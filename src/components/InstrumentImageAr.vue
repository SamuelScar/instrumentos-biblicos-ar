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
  DirectionalLight,
  HemisphereLight,
  Mesh,
  Texture,
  type Material,
  type Object3D,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import type { ImageTrackingAr } from "../domain/instruments";
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
const selectedCameraId = ref("");

let requestVersion = 0;
let session: MindArImageSession | null = null;
let loadedModel: Object3D | null = null;
let previousBodyOverflow = "";
let previouslyFocusedElement: HTMLElement | null = null;

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
}

function stopSession(): void {
  requestVersion += 1;
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
      selectedCameraId.value &&
      !cameras.value.some((camera) => camera.deviceId === selectedCameraId.value)
    ) {
      selectedCameraId.value = "";
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
    currentSession = new MindArImageSession({
      container: viewportElement.value,
      targetUrl: props.imageTracking.targetFileUrl,
      targetIndex: props.imageTracking.targetIndex,
      deviceId: selectedCameraId.value || undefined,
      onTargetFound: () => {
        if (currentRequest === requestVersion) experienceState.value = "found";
      },
      onTargetLost: () => {
        if (currentRequest === requestVersion) experienceState.value = "scanning";
      },
    });
    session = currentSession;

    const model = await loadModel(props.modelUrl);

    if (currentRequest !== requestVersion) {
      disposeModel(model);
      return;
    }

    loadedModel = model;
    model.scale.setScalar(props.imageTracking.modelScale);
    model.rotation.set(...props.imageTracking.modelRotation);
    currentSession.anchor.add(model);

    const ambientLight = new HemisphereLight(0xfff4dd, 0x4c382a, 2.2);
    const keyLight = new DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(1.5, 2.5, 3);
    currentSession.scene.add(ambientLight, keyLight);

    currentSession.renderer.setAnimationLoop(() => {
      currentSession.renderer.render(currentSession.scene, currentSession.camera);
    });

    await currentSession.start();

    if (currentRequest !== requestVersion) {
      currentSession.dispose();
      return;
    }

    experienceState.value = currentSession.isTargetVisible ? "found" : "scanning";

    await refreshCameras();
    if (currentRequest !== requestVersion) return;

    const activeStream = currentSession.video.srcObject;
    const activeDeviceId =
      activeStream instanceof MediaStream
        ? (activeStream.getVideoTracks()[0]?.getSettings().deviceId ?? "")
        : "";

    if (activeDeviceId && cameras.value.some((camera) => camera.deviceId === activeDeviceId)) {
      selectedCameraId.value = activeDeviceId;
    }
  } catch (error) {
    if (currentRequest !== requestVersion) return;

    currentSession?.dispose();
    session = null;
    disposeLoadedModel();
    errorMessage.value = describeCameraError(error);
    experienceState.value = "error";
  }
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
            Apoie o card 01 em uma superfície plana — impresso ou exibido em outra tela deitada.
            Depois, aponte a câmera para ele e mantenha toda a imagem visível.
          </p>

          <div v-if="cameras.length" class="image-ar-camera-field">
            <label for="image-ar-camera">Câmera utilizada</label>
            <select id="image-ar-camera" v-model="selectedCameraId">
              <option value="">Automática — preferir câmera traseira</option>
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
            :alt="`Card 01 usado para reconhecer ${instrumentName}`"
          />
          <figcaption>Card provisório do piloto</figcaption>
        </figure>
      </div>

      <div
        v-else
        ref="viewportElement"
        class="image-ar-viewport"
        :class="{ 'image-ar-viewport--camera-options': cameras.length > 1 }"
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
                  : "Procurando o card 01..."
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

        <label v-if="cameras.length > 1" class="image-ar-camera-control">
          <span>Câmera</span>
          <select
            v-model="selectedCameraId"
            :disabled="experienceState === 'starting'"
            @change="startExperience"
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
