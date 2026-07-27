<script setup lang="ts">
import {
  Camera,
  Download,
  LoaderCircle,
  RotateCcw,
  ScanLine,
  ShieldAlert,
  X,
} from "@lucide/vue";
import {
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Texture,
  type Object3D,
} from "three";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import {
  AR_COLLECTION_TARGET_URL,
  findImageArInstrumentByTargetIndex,
  imageArInstruments,
  type ImageArInstrument,
} from "../domain/arExperience";
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

const emit = defineEmits<{
  close: [];
}>();

const FOCUSABLE_ELEMENT_SELECTOR =
  'a[href], button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type ExperienceState =
  | "idle"
  | "starting"
  | "scanning"
  | "loading-model"
  | "found"
  | "model-error"
  | "error";

const viewportElement = ref<HTMLElement | null>(null);
const dialogElement = ref<HTMLElement | null>(null);
const closeButtonElement = ref<HTMLButtonElement | null>(null);
const experienceState = ref<ExperienceState>("idle");
const errorMessage = ref("");
const modelErrorMessage = ref("");
const activeInstrument = ref<ImageArInstrument | null>(null);
const cameras = ref<CameraOption[]>([]);
const selectedCameraId = ref(readCameraPreference());
const showsSetup = computed(
  () => experienceState.value === "idle" || experienceState.value === "error"
);
const activeCardDownloadLocation = computed(() => {
  const instrument = activeInstrument.value;
  if (!instrument) return { name: "ar-cards" };

  return {
    name: "ar-cards",
    hash: `#card-${instrument.id}`,
  };
});
const statusMessage = computed(() => {
  switch (experienceState.value) {
    case "starting":
      return "Preparando os cards e a câmera...";
    case "loading-model":
      return `Carregando ${activeInstrument.value?.name ?? "instrumento"}...`;
    case "found":
      return `${activeInstrument.value?.name ?? "Instrumento"} reconhecido`;
    case "model-error":
      return `${activeInstrument.value?.name ?? "Instrumento"} reconhecido`;
    default:
      return "Procurando um card...";
  }
});

const collectionTargetIndices = imageArInstruments.map(
  (instrument) => instrument.ar.imageTracking.collectionTargetIndex
);
const collectionMissTolerance = Math.max(
  5,
  ...imageArInstruments.map((instrument) => instrument.ar.imageTracking.missTolerance ?? 5)
);

let requestVersion = 0;
let modelRequestVersion = 0;
let session: MindArImageSession | null = null;
let loadedModel: Object3D | null = null;
let loadedInstrumentId: string | null = null;
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
  loadedInstrumentId = null;
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
  modelRequestVersion += 1;
  disposeSessionResources();
}

function prepareEnvironment(currentSession: MindArImageSession): void {
  environmentTexture = createImageTrackingEnvironment(currentSession.renderer);
  currentSession.scene.environment = environmentTexture;

  const ambientLight = new HemisphereLight(0xfff4dd, 0x4c382a, 2.2);
  const keyLight = new DirectionalLight(0xffffff, 2.8);
  keyLight.position.set(1.5, 2.5, 3);
  currentSession.scene.add(ambientLight, keyLight);
}

function handleModelPointerDown(event: PointerEvent): void {
  if (
    experienceState.value !== "found" ||
    !modelPivot ||
    !event.isPrimary ||
    event.button !== 0 ||
    activePointerId !== null ||
    (event.target instanceof Element && event.target.closest("a, button, select, label"))
  ) {
    return;
  }

  const target = event.currentTarget as HTMLElement;

  try {
    target.setPointerCapture(event.pointerId);
  } catch {
    return;
  }

  if (!target.hasPointerCapture(event.pointerId)) return;

  event.preventDefault();
  activePointerId = event.pointerId;
  pointerX = event.clientX;
  pointerY = event.clientY;
}

function handleModelPointerMove(event: PointerEvent): void {
  const target = event.currentTarget as HTMLElement;
  if (
    event.pointerId !== activePointerId ||
    !modelPivot ||
    !target.hasPointerCapture(event.pointerId)
  ) {
    return;
  }

  event.preventDefault();
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

function handleModelPointerCaptureLost(event: PointerEvent): void {
  if (event.pointerId === activePointerId) activePointerId = null;
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

async function showInstrumentForTarget(
  targetIndex: number,
  sessionVersion: number,
  forceReload = false
): Promise<void> {
  const instrument = findImageArInstrumentByTargetIndex(targetIndex);
  const activeSession = session;
  if (!instrument || !activeSession || sessionVersion !== requestVersion) return;

  activeInstrument.value = instrument;
  modelErrorMessage.value = "";

  if (!forceReload && loadedModel && loadedInstrumentId === instrument.id) {
    experienceState.value =
      activeSession.visibleTargetIndex === targetIndex ? "found" : "scanning";
    return;
  }

  const currentModelRequest = ++modelRequestVersion;
  experienceState.value = "loading-model";
  disposeLoadedModel();

  try {
    const model = await loadModel(instrument.assets.modelUrl);

    if (
      sessionVersion !== requestVersion ||
      currentModelRequest !== modelRequestVersion ||
      session !== activeSession
    ) {
      disposeModel(model);
      return;
    }

    loadedModel = model;
    loadedInstrumentId = instrument.id;
    modelPivot = prepareImageTrackingModel(
      model,
      instrument.ar.imageTracking.modelScale,
      instrument.ar.imageTracking.modelRotation
    );
    activeSession.anchor.add(modelPivot);
    experienceState.value =
      activeSession.visibleTargetIndex === targetIndex ? "found" : "scanning";
  } catch {
    if (sessionVersion !== requestVersion || currentModelRequest !== modelRequestVersion) return;

    modelErrorMessage.value = `Não foi possível carregar o modelo de ${instrument.name}.`;
    experienceState.value = "model-error";
  }
}

function handleTargetLost(targetIndex: number, sessionVersion: number): void {
  if (
    sessionVersion !== requestVersion ||
    activeInstrument.value?.ar.imageTracking.collectionTargetIndex !== targetIndex
  ) {
    return;
  }

  experienceState.value = "scanning";
}

async function startExperience(): Promise<void> {
  stopSession();
  const currentRequest = requestVersion;
  experienceState.value = "starting";
  errorMessage.value = "";
  modelErrorMessage.value = "";
  activeInstrument.value = null;

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
      targetUrl: AR_COLLECTION_TARGET_URL,
      targetIndices: collectionTargetIndices,
      missTolerance: collectionMissTolerance,
      deviceId: selectedCameraId.value || undefined,
      onTargetFound: (targetIndex) => {
        if (currentRequest === requestVersion) {
          void showInstrumentForTarget(targetIndex, currentRequest);
        }
      },
      onTargetLost: (targetIndex) => handleTargetLost(targetIndex, currentRequest),
    });
    session = activeSession;
    prepareEnvironment(activeSession);

    await activeSession.start();

    if (currentRequest !== requestVersion) {
      activeSession.dispose();
      return;
    }

    if (experienceState.value === "starting") experienceState.value = "scanning";

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

function retryActiveModel(): void {
  const instrument = activeInstrument.value;
  const activeSession = session;
  if (!instrument || !activeSession) return;

  void showInstrumentForTarget(
    instrument.ar.imageTracking.collectionTargetIndex,
    requestVersion,
    true
  );
}

function closeExperience(): void {
  stopSession();
  emit("close");
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    closeExperience();
    return;
  }

  if (event.key !== "Tab" || !dialogElement.value) return;

  const focusableElements = Array.from(
    dialogElement.value.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENT_SELECTOR)
  ).filter((element) => element.getClientRects().length > 0);

  if (!focusableElements.length) {
    event.preventDefault();
    dialogElement.value.focus();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
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
      ref="dialogElement"
      class="image-ar-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Realidade aumentada com todos os cards"
      tabindex="-1"
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
        v-if="activeInstrument?.assets.audioUrl && experienceState === 'found'"
        :key="activeInstrument.id"
        class="image-ar-audio"
        variant="minimal"
        :src="activeInstrument.assets.audioUrl"
        :instrument-name="activeInstrument.name"
      />

      <div v-if="showsSetup" class="image-ar-setup">
        <div class="image-ar-setup__content">
          <p class="eyebrow">Central de RA por cards</p>
          <h2>Aponte para um card</h2>
          <p>
            A câmera reconhece os nove cards. Para trocar de instrumento, basta enquadrar outro card
            sem fechar a experiência.
          </p>

          <div v-if="cameras.length" class="image-ar-camera-field">
            <label for="image-ar-collection-camera">Câmera utilizada</label>
            <select
              id="image-ar-collection-camera"
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

        <aside class="image-ar-collection-reference" aria-label="Cards reconhecidos">
          <strong>Nove cards, uma única câmera</strong>
          <div class="image-ar-collection-reference__cards">
            <img
              v-for="instrument in imageArInstruments"
              :key="instrument.id"
              :src="instrument.ar.imageTracking.targetImageUrl"
              :alt="`Card de ${instrument.name}`"
            />
          </div>
          <RouterLink class="image-ar-card-reference__download" :to="{ name: 'ar-cards' }">
            <Download :size="17" aria-hidden="true" />
            Baixar os cards
          </RouterLink>
        </aside>
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
        @lostpointercapture="handleModelPointerCaptureLost"
      >
        <div class="image-ar-status" role="status" aria-live="polite">
          <LoaderCircle
            v-if="experienceState === 'starting' || experienceState === 'loading-model'"
            class="image-ar-status__spinner"
            :size="19"
            aria-hidden="true"
          />
          <ScanLine v-else :size="19" aria-hidden="true" />
          <span>{{ statusMessage }}</span>
        </div>

        <div
          class="image-ar-guide"
          :class="{ 'image-ar-guide--found': experienceState === 'found' }"
        >
          <span v-if="experienceState !== 'found'">Enquadre um card inteiro</span>
        </div>

        <RouterLink
          class="image-ar-card-hint"
          :to="activeCardDownloadLocation"
          :aria-label="
            activeInstrument
              ? `Baixar o card de ${activeInstrument.name}`
              : 'Ver os cards de realidade aumentada'
          "
        >
          <img
            v-if="activeInstrument"
            :src="activeInstrument.ar.imageTracking.targetImageUrl"
            alt=""
            aria-hidden="true"
            :draggable="false"
          />
          <ScanLine v-else :size="24" aria-hidden="true" />
          <span>{{ activeInstrument ? "Baixar card" : "Ver cards" }}</span>
        </RouterLink>

        <p v-if="experienceState === 'found'" class="image-ar-interaction-hint">
          Arraste para girar {{ activeInstrument?.name }}
        </p>

        <div v-if="modelErrorMessage" class="image-ar-model-error" role="alert">
          <ShieldAlert :size="20" aria-hidden="true" />
          <span>{{ modelErrorMessage }}</span>
          <button type="button" @click="retryActiveModel">Tentar novamente</button>
        </div>

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
