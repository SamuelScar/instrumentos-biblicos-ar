<script setup lang="ts">
import {
  Camera,
  LoaderCircle,
  RotateCcw,
  ScanLine,
  ShieldAlert,
  X,
} from "@lucide/vue";
import {
  ACESFilmicToneMapping,
  Box3,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  PMREMGenerator,
  Texture,
  Vector3,
  type Material,
  type Object3D,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import type { ImageTrackingAr } from "../domain/instruments";
import { readCameraPreference, saveCameraPreference } from "../lib/cameraPreference";
import { MindArImageSession } from "../lib/mindar/MindArImageSession";

const props = defineProps<{
  instrumentName: string;
  modelUrl: string;
  imageTracking: ImageTrackingAr;
}>();

const emit = defineEmits<{
  close: [];
}>();

type ExperienceState = "idle" | "starting" | "scanning" | "found" | "error";
type CameraOption = {
  deviceId: string;
  label: string;
};

const viewportElement = ref<HTMLElement | null>(null);
const closeButtonElement = ref<HTMLButtonElement | null>(null);
const experienceState = ref<ExperienceState>("idle");
const errorMessage = ref("");
const cameras = ref<CameraOption[]>([]);
const selectedCameraId = ref(readCameraPreference());

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

function disposeMaterial(material: Material): void {
  for (const value of Object.values(material)) {
    if (value instanceof Texture) {
      value.dispose();
    }
  }

  material.dispose();
}

function disposeModel(model: Object3D): void {
  model.traverse((object) => {
    if (!(object instanceof Mesh)) return;

    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach(disposeMaterial);
  });

  model.removeFromParent();
}

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

function stopSession(): void {
  requestVersion += 1;
  activePointerId = null;
  disposeEnvironment();
  session?.dispose();
  session = null;
  disposeLoadedModel();
}

function loadModel(modelUrl: string): Promise<Object3D> {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(
      modelUrl,
      (gltf) => resolve(gltf.scene),
      undefined,
      (error) => reject(error),
    );
  });
}

function prepareModel(model: Object3D): Group {
  model.scale.setScalar(props.imageTracking.modelScale);

  const bounds = new Box3().setFromObject(model);
  const center = bounds.getCenter(new Vector3());
  model.position.sub(center);

  const pivot = new Group();
  pivot.rotation.set(...props.imageTracking.modelRotation);
  pivot.add(model);
  return pivot;
}

function prepareEnvironment(currentSession: MindArImageSession): void {
  const environment = new RoomEnvironment();
  const generator = new PMREMGenerator(currentSession.renderer);

  currentSession.renderer.toneMapping = ACESFilmicToneMapping;
  currentSession.renderer.toneMappingExposure = 1.1;

  try {
    environmentTexture = generator.fromScene(environment, 0.04).texture;
    currentSession.scene.environment = environmentTexture;
  } finally {
    environment.dispose();
    generator.dispose();
  }
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
    MODEL_TILT_LIMIT,
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
    const devices = await navigator.mediaDevices?.enumerateDevices();
    if (!devices) return;

    cameras.value = devices
      .filter((device) => device.kind === "videoinput" && device.deviceId)
      .map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Câmera ${index + 1}`,
      }));

    if (
      cameras.value.length > 0 &&
      selectedCameraId.value &&
      !cameras.value.some((camera) => camera.deviceId === selectedCameraId.value)
    ) {
      selectedCameraId.value = "";
      saveCameraPreference("");
    }
  } catch {
    cameras.value = [];
  }
}

async function startExperience(): Promise<void> {
  stopSession();
  const currentRequest = ++requestVersion;
  experienceState.value = "starting";
  errorMessage.value = "";

  await nextTick();

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

  let currentSession: MindArImageSession | null = null;

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
    currentSession = activeSession;
    session = activeSession;

    const model = await loadModel(props.modelUrl);

    if (currentRequest !== requestVersion) {
      disposeModel(model);
      return;
    }

    loadedModel = model;
    modelPivot = prepareModel(model);
    activeSession.anchor.add(modelPivot);

    const ambientLight = new HemisphereLight(0xfff4dd, 0x4c382a, 2.2);
    const keyLight = new DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(1.5, 2.5, 3);
    activeSession.scene.add(ambientLight, keyLight);
    prepareEnvironment(activeSession);

    let previousFrameTime: number | null = null;
    activeSession.renderer.setAnimationLoop((frameTime) => {
      const deltaSeconds =
        previousFrameTime === null ? 1 / 60 : (frameTime - previousFrameTime) / 1000;
      previousFrameTime = frameTime;

      activeSession.updateAnchorPose(deltaSeconds);
      activeSession.renderer.render(activeSession.scene, activeSession.camera);
    });

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

    disposeEnvironment();
    currentSession?.dispose();
    session = null;
    disposeLoadedModel();
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

      <div v-if="experienceState === 'idle' || experienceState === 'error'" class="image-ar-setup">
        <div class="image-ar-setup__content">
          <p class="eyebrow">RA por card</p>
          <h2>Veja {{ instrumentName }} surgir sobre o card</h2>
          <p>
            Apoie o card de {{ instrumentName }} em uma superfície plana — impresso ou exibido em
            outra tela deitada. Depois, aponte a câmera para ele e mantenha toda a imagem visível.
          </p>

          <div v-if="cameras.length" class="image-ar-camera-field">
            <label for="image-ar-camera">Câmera utilizada</label>
            <select
              id="image-ar-camera"
              v-model="selectedCameraId"
              @change="storeCameraPreference"
            >
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
            {{
              experienceState === "starting"
                ? "Preparando modelo e câmera..."
                : experienceState === "found"
                  ? "Instrumento reconhecido"
                  : `Procurando o card de ${instrumentName}...`
            }}
          </span>
        </div>

        <div class="image-ar-guide" :class="{ 'image-ar-guide--found': experienceState === 'found' }">
          <span v-if="experienceState !== 'found'">Enquadre o card inteiro</span>
        </div>

        <aside class="image-ar-card-hint">
          <img :src="imageTracking.targetImageUrl" alt="" aria-hidden="true" />
          <span>{{ experienceState === "found" ? "Card reconhecido" : "Procure esta imagem" }}</span>
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
