<script setup lang="ts">
import { Box, LoaderCircle, RotateCcw } from "@lucide/vue";
import { onMounted, ref } from "vue";
import type { Instrument } from "../domain/instruments";

defineProps<{
  modelUrl: string;
  posterUrl?: string;
  instrumentName: string;
  ar: Instrument["ar"];
}>();

type ViewerState = "preparing" | "loading" | "ready" | "error";
type ArStatus = "not-presenting" | "session-started" | "object-placed" | "failed";
type ArTrackingStatus = "tracking" | "not-tracking";
type ModelViewerElement = HTMLElement & {
  canActivateAR?: boolean;
  activateAR?: () => Promise<void>;
};

const componentReady = ref(false);
const modelViewerElement = ref<ModelViewerElement | null>(null);
const viewerKey = ref(0);
const viewerState = ref<ViewerState>("preparing");
const arStatus = ref<ArStatus>("not-presenting");
const arTrackingStatus = ref<ArTrackingStatus>("tracking");
const canActivateAr = ref(false);

async function prepareViewer(): Promise<void> {
  viewerState.value = "preparing";

  try {
    await import("@google/model-viewer");
    componentReady.value = true;
    viewerState.value = "loading";
  } catch {
    componentReady.value = false;
    viewerState.value = "error";
  }
}

function finishLoading(event: Event): void {
  viewerState.value = "ready";
  updateArAvailability(event.currentTarget as ModelViewerElement);
}

function updateArAvailability(
  viewer = modelViewerElement.value,
): boolean {
  const isAvailable = Boolean(viewer?.canActivateAR);
  canActivateAr.value = isAvailable;
  return isAvailable;
}

function reportError(): void {
  viewerState.value = "error";
}

function reportArStatus(event: Event): void {
  const status = (event as CustomEvent<{ status: ArStatus }>).detail.status;
  arStatus.value = status;

  if (status === "not-presenting" || status === "failed") {
    arTrackingStatus.value = "tracking";
  }
}

function reportArTracking(event: Event): void {
  arTrackingStatus.value = (
    event as CustomEvent<{ status: ArTrackingStatus }>
  ).detail.status;
}

function prepareArSession(): void {
  arStatus.value = "not-presenting";
  arTrackingStatus.value = "tracking";
}

async function startArSession(): Promise<void> {
  const viewer = modelViewerElement.value;
  if (!viewer?.activateAR || !updateArAvailability(viewer)) {
    arStatus.value = "failed";
    return;
  }

  prepareArSession();

  try {
    await viewer.activateAR();
  } catch {
    arStatus.value = "failed";
  }
}

async function retryLoading(): Promise<void> {
  viewerKey.value += 1;
  arStatus.value = "not-presenting";
  arTrackingStatus.value = "tracking";
  canActivateAr.value = false;

  if (componentReady.value) {
    viewerState.value = "loading";
    return;
  }

  await prepareViewer();
}

onMounted(prepareViewer);
</script>

<template>
  <div
    class="instrument-model-shell"
    :class="`instrument-model-shell--${viewerState}`"
  >
    <model-viewer
      v-if="componentReady"
      ref="modelViewerElement"
      :key="viewerKey"
      class="instrument-model"
      :src="modelUrl"
      :poster="posterUrl"
      :alt="`Modelo 3D do instrumento ${instrumentName}`"
      camera-controls
      auto-rotate
      shadow-intensity="1"
      touch-action="pan-y"
      :ar="ar.enabled"
      ar-modes="webxr scene-viewer quick-look"
      :ar-placement="ar.placement"
      :ar-scale="ar.scale"
      @load="finishLoading"
      @error="reportError"
      @ar-status="reportArStatus"
      @ar-tracking="reportArTracking"
    >
      <div
        v-if="
          arStatus !== 'not-presenting' &&
          arStatus !== 'failed' &&
          arTrackingStatus === 'not-tracking'
        "
        class="model-ar-feedback"
        role="status"
        aria-live="polite"
      >
        <strong>Rastreamento interrompido</strong>
        <span>Aponte para uma superfície bem iluminada e mova o celular devagar.</span>
      </div>

      <div
        v-else-if="arStatus === 'session-started'"
        class="model-ar-feedback"
        role="status"
        aria-live="polite"
      >
        <strong>Procure uma superfície</strong>
        <span>Mova o celular devagar até encontrar o chão.</span>
      </div>

      <div
        v-else-if="arStatus === 'failed'"
        class="model-ar-feedback model-ar-feedback--error"
        role="alert"
      >
        <strong>Não foi possível abrir a realidade aumentada.</strong>
        <span>Use um celular compatível, acesse por HTTPS e permita o uso da câmera.</span>
      </div>
    </model-viewer>

    <p v-if="viewerState === 'ready'" class="model-gesture-hint">
      Arraste para girar · pinça ou roda para aproximar
    </p>

    <div v-if="viewerState === 'ready'" class="model-action-dock" aria-label="Ações rápidas">
      <button
        v-if="ar.enabled"
        class="model-action-button"
        type="button"
        :aria-disabled="!canActivateAr"
        :title="canActivateAr ? 'Ver no meu espaço' : 'Disponível em celular compatível'"
        @focus="updateArAvailability()"
        @pointerenter="updateArAvailability()"
        @click="startArSession"
      >
        <Box :size="19" aria-hidden="true" />
        <span>No ambiente</span>
      </button>

      <slot name="actions" />
    </div>

    <div
      v-if="viewerState === 'preparing' || viewerState === 'loading'"
      class="model-status"
      role="status"
      aria-live="polite"
    >
      <LoaderCircle class="model-status__icon" :size="18" aria-hidden="true" />
      <span>
        {{
          viewerState === "preparing"
            ? "Preparando visualizador 3D..."
            : "Carregando modelo 3D..."
        }}
      </span>
    </div>

    <div v-else-if="viewerState === 'error'" class="model-error" role="alert">
      <strong>Não foi possível carregar o modelo 3D.</strong>
      <span>O arquivo pode estar indisponível ou o navegador pode não oferecer suporte ao 3D.</span>
      <button class="button button--secondary" type="button" @click="retryLoading">
        <RotateCcw :size="17" aria-hidden="true" />
        Tentar novamente
      </button>
    </div>
  </div>
</template>
