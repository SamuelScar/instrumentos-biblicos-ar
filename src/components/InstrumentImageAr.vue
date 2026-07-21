<script setup lang="ts">
import { Camera, LoaderCircle, RotateCcw, ScanLine, ShieldAlert, X } from "@lucide/vue";
import { DirectionalLight, Group, HemisphereLight, MathUtils, Texture, type Object3D } from "three";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import type { ImageTrackingAr } from "../domain/instruments";
import {
  createCameraOptions,
  enumerateMediaDevices,
  normalizeCameraDeviceId,
  type CameraOption,
} from "../lib/cameraDevices";
import { readCameraPreference, saveCameraPreference } from "../lib/cameraPreference";
import { MindArImageSession } from "../lib/mindar/MindArImageSession";
import {
  createImageTrackingEnvironment,
  disposeModel,
  loadModel,
  prepareImageTrackingModel,
} from "../lib/three/imageTrackingModel";
import AudioPlayer from "./AudioPlayer.vue";

const props = defineProps<{
  instrumentName: string;
  modelUrl: string;
  audioUrl?: string;
  imageTracking: ImageTrackingAr;
}>();

const emit = defineEmits<{
  close: [];
}>();

type ExperienceState = "idle" | "starting" | "scanning" | "found" | "error";

const viewportElement = ref<HTMLElement | null>(null);
const closeButtonElement = ref<HTMLButtonElement | null>(null);
const experienceState = ref<ExperienceState>("idle");
const errorMessage = ref("");
const cameras = ref<CameraOption[]>([]);
const selectedCameraId = ref(readCameraPreference());
const showsSetup = computed(
  () => experienceState.value === "idle" || experienceState.value === "error"
);
const statusMessage = computed(() => {
  switch (experienceState.value) {
    case "starting":
      return "Preparando modelo e câmera...";
    case "found":
      return "Instrumento reconhecido";
    default:
      return `Procurando o card de ${props.instrumentName}...`;
  }
});

let requestVersion = 0;
let session: MindArImageSession | null = null;
let loadedModel: Object3D | null = null;
let modelPivot: Group | null = null;
let environmentTexture: Texture | null = null;
let activePointerId: number | null = null;
let pointerX = 0;
let pointerY = 0;
let previousBodyOverflow = "";
let previouslyFocusedElement: HTMLElement | null = null;

const MODEL_ROTATION_SENSITIVITY = 0.008;
const MODEL_TILT_LIMIT = Math.PI / 3;

function disposeLoadedModel(): void {
  if (loadedModel) disposeModel(loadedModel);
  loadedModel = null;
  modelPivot?.removeFromParent();
  modelPivot = null;
}

function disposeEnvironment(): void {
  if (session?.scene.environment === environmentTexture) {
    session.scene.environment = null;
  }

  environmentTexture?.dispose();
  environmentTexture = null;
}

function disposeSessionResources(): void {
  activePointerId = null;
  disposeEnvironment();
  session?.dispose();
  session = null;
  disposeLoadedModel();
}

function stopSession(): void {
  requestVersion += 1;
  disposeSessionResources();
}

function prepareEnvironment(currentSession: MindArImageSession): void {
  environmentTexture = createImageTrackingEnvironment(currentSession.renderer);
  currentSession.scene.environment = environmentTexture;
}

function handleModelPointerDown(event: PointerEvent): void {
  if (
    experienceState.value !== "found" ||
    !modelPivot ||
    activePointerId !== null ||
    (event.target instanceof Element && event.target.closest("button, select, label"))
  ) {
    return;
  }

  activePointerId = event.pointerId;
  pointerX = event.clientX;
  pointerY = event.clientY;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}

function handleModelPointerMove(event: PointerEvent): void {
  if (event.pointerId !== activePointerId || !modelPivot) return;

  const movementX = event.clientX - pointerX;
  const movementY = event.clientY - pointerY;
  pointerX = event.clientX;
  pointerY = event.clientY;

  modelPivot.rotation.y += movementX * MODEL_ROTATION_SENSITIVITY;
  modelPivot.rotation.x = MathUtils.clamp(
    modelPivot.rotation.x + movementY * MODEL_ROTATION_SENSITIVITY,
    -MODEL_TILT_LIMIT,
    MODEL_TILT_LIMIT
  );
}

function handleModelPointerEnd(event: PointerEvent): void {
  if (event.pointerId !== activePointerId) return;

  activePointerId = null;
  const target = event.currentTarget as HTMLElement;
  if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
}

function describeCameraError(error: unknown): string {
  if (!window.isSecureContext) {
    return "A câmera exige HTTPS. No computador, localhost também é aceito.";
  }

  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return "O acesso à câmera foi bloqueado. Libere a permissão no navegador e tente novamente.";
    }

    if (error.name === "NotFoundError" || error.name === "OverconstrainedError") {
      return "Nenhuma câmera compatível foi encontrada neste dispositivo.";
    }

    if (error.name === "NotReadableError" || error.name === "AbortError") {
      return "A câmera está indisponível ou sendo usada por outro aplicativo.";
    }
  }

  return "Não foi possível preparar a experiência. Recarregue a página e tente novamente.";
}

async function refreshCameras(): Promise<void> {
  try {
    const devices = await enumerateMediaDevices();
    if (!devices) return;

    cameras.value = createCameraOptions(devices);
    const normalizedCameraId = normalizeCameraDeviceId(selectedCameraId.value, cameras.value);
    if (normalizedCameraId !== selectedCameraId.value) {
      selectedCameraId.value = normalizedCameraId;
      saveCameraPreference("");
    }
  } catch {
    cameras.value = [];
  }
}

async function startExperience(): Promise<void> {
  stopSession();
  const currentRequest = requestVersion;
  experienceState.value = "starting";
  errorMessage.value = "";

  await nextTick();
  if (currentRequest !== requestVersion) return;

  if (!viewportElement.value) {
    experienceState.value = "error";
    errorMessage.value = "Não foi possível criar a área da câmera.";
    return;
  }

  if (!window.isSecureContext) {
    experienceState.value = "error";
    errorMessage.value = "A câmera exige HTTPS. No computador, localhost também é aceito.";
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    experienceState.value = "error";
    errorMessage.value = "A câmera não está disponível neste navegador ou dispositivo.";
    return;
  }

  try {
    const activeSession = new MindArImageSession({
      container: viewportElement.value,
      targetUrl: props.imageTracking.targetFileUrl,
      targetIndex: props.imageTracking.targetIndex,
      missTolerance: props.imageTracking.missTolerance,
      deviceId: selectedCameraId.value || undefined,
      onTargetFound: () => {
        if (currentRequest === requestVersion) experienceState.value = "found";
      },
      onTargetLost: () => {
        if (currentRequest === requestVersion) experienceState.value = "scanning";
      },
    });
    session = activeSession;

    const model = await loadModel(props.modelUrl);

    if (currentRequest !== requestVersion) {
      disposeModel(model);
      activeSession.dispose();
      return;
    }

    loadedModel = model;
    modelPivot = prepareImageTrackingModel(
      model,
      props.imageTracking.modelScale,
      props.imageTracking.modelRotation
    );
    activeSession.anchor.add(modelPivot);

    const ambientLight = new HemisphereLight(0xfff4dd, 0x4c382a, 2.2);
    const keyLight = new DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(1.5, 2.5, 3);
    activeSession.scene.add(ambientLight, keyLight);
    prepareEnvironment(activeSession);

    await activeSession.start();

    if (currentRequest !== requestVersion) {
      activeSession.dispose();
      return;
    }

    experienceState.value = activeSession.isTargetVisible ? "found" : "scanning";

    await refreshCameras();
    if (currentRequest !== requestVersion) return;
  } catch (error) {
    if (currentRequest !== requestVersion) return;

    disposeSessionResources();
    errorMessage.value = describeCameraError(error);
    experienceState.value = "error";
  }
}

function storeCameraPreference(): void {
  saveCameraPreference(selectedCameraId.value);
}

async function changeCamera(): Promise<void> {
  storeCameraPreference();
  await startExperience();
}

function closeExperience(): void {
  stopSession();
  emit("close");
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") closeExperience();
}

onMounted(() => {
  previouslyFocusedElement =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  window.addEventListener("keydown", handleKeydown);
  closeButtonElement.value?.focus();
  void refreshCameras();
});

onBeforeUnmount(() => {
  stopSession();
  document.body.style.overflow = previousBodyOverflow;
  window.removeEventListener("keydown", handleKeydown);
  previouslyFocusedElement?.focus();
});
</script>

<template>
  <Teleport to="body">
    <section
      class="image-ar-overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="`Realidade aumentada por card de ${instrumentName}`"
    >
      <button
        ref="closeButtonElement"
        class="image-ar-close"
        type="button"
        aria-label="Fechar realidade aumentada"
        title="Fechar"
        @click="closeExperience"
      >
        <X :size="22" aria-hidden="true" />
      </button>

      <AudioPlayer
        v-if="audioUrl && !showsSetup"
        class="image-ar-audio"
        variant="minimal"
        :src="audioUrl"
        :instrument-name="instrumentName"
      />

      <div v-if="showsSetup" class="image-ar-setup">
        <div class="image-ar-setup__content">
          <p class="eyebrow">RA por card</p>
          <h2>Veja {{ instrumentName }} surgir sobre o card</h2>
          <p>
            Apoie o card de {{ instrumentName }} em uma superfície plana — impresso ou exibido em
            outra tela deitada. Depois, aponte a câmera para ele e mantenha toda a imagem visível.
          </p>

          <div v-if="cameras.length" class="image-ar-camera-field">
            <label for="image-ar-camera">Câmera utilizada</label>
            <select id="image-ar-camera" v-model="selectedCameraId" @change="storeCameraPreference">
              <option value="">Automática</option>
              <option v-for="camera in cameras" :key="camera.deviceId" :value="camera.deviceId">
                {{ camera.label }}
              </option>
            </select>
          </div>

          <div v-if="experienceState === 'error'" class="image-ar-error" role="alert">
            <ShieldAlert :size="22" aria-hidden="true" />
            <div>
              <strong>Não foi possível iniciar a experiência</strong>
              <span>{{ errorMessage }}</span>
            </div>
          </div>

          <div class="image-ar-setup__actions">
            <button class="button button--primary" type="button" @click="startExperience">
              <RotateCcw v-if="experienceState === 'error'" :size="18" aria-hidden="true" />
              <Camera v-else :size="18" aria-hidden="true" />
              {{ experienceState === "error" ? "Tentar novamente" : "Iniciar câmera" }}
            </button>
            <button class="button button--secondary" type="button" @click="closeExperience">
              Agora não
            </button>
          </div>

          <small>O navegador pedirá permissão para usar a câmera.</small>
        </div>

        <figure class="image-ar-card-reference">
          <img
            :src="imageTracking.targetImageUrl"
            :alt="`Card usado para reconhecer ${instrumentName}`"
          />
          <figcaption>Card de {{ instrumentName }}</figcaption>
        </figure>
      </div>

      <div
        v-else
        ref="viewportElement"
        class="image-ar-viewport"
        :class="{
          'image-ar-viewport--camera-options': cameras.length > 1,
          'image-ar-viewport--interactive': experienceState === 'found',
        }"
        @pointerdown="handleModelPointerDown"
        @pointermove="handleModelPointerMove"
        @pointerup="handleModelPointerEnd"
        @pointercancel="handleModelPointerEnd"
      >
        <div class="image-ar-status" role="status" aria-live="polite">
          <LoaderCircle
            v-if="experienceState === 'starting'"
            class="image-ar-status__spinner"
            :size="19"
            aria-hidden="true"
          />
          <ScanLine v-else :size="19" aria-hidden="true" />
          <span>
            {{ statusMessage }}
          </span>
        </div>

        <div
          class="image-ar-guide"
          :class="{ 'image-ar-guide--found': experienceState === 'found' }"
        >
          <span v-if="experienceState !== 'found'">Enquadre o card inteiro</span>
        </div>

        <aside class="image-ar-card-hint">
          <img :src="imageTracking.targetImageUrl" alt="" aria-hidden="true" />
          <span>{{
            experienceState === "found" ? "Card reconhecido" : "Procure esta imagem"
          }}</span>
        </aside>

        <p v-if="experienceState === 'found'" class="image-ar-interaction-hint">
          Arraste para girar o instrumento
        </p>

        <label v-if="cameras.length > 1" class="image-ar-camera-control">
          <span>Câmera</span>
          <select
            v-model="selectedCameraId"
            :disabled="experienceState === 'starting'"
            @change="changeCamera"
          >
            <option value="">Automática</option>
            <option v-for="camera in cameras" :key="camera.deviceId" :value="camera.deviceId">
              {{ camera.label }}
            </option>
          </select>
        </label>
      </div>
    </section>
  </Teleport>
</template>
