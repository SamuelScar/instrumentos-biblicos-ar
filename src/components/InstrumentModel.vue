<script setup lang="ts">
import { LoaderCircle, RotateCcw } from "@lucide/vue";
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

const componentReady = ref(false);
const viewerKey = ref(0);
const viewerState = ref<ViewerState>("preparing");
const arStatus = ref<ArStatus>("not-presenting");

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

function finishLoading(): void {
  viewerState.value = "ready";
}

function reportError(): void {
  viewerState.value = "error";
}

function reportArStatus(event: Event): void {
  arStatus.value = (event as CustomEvent<{ status: ArStatus }>).detail.status;
}

function prepareArSession(): void {
  arStatus.value = "not-presenting";
}

async function retryLoading(): Promise<void> {
  viewerKey.value += 1;
  arStatus.value = "not-presenting";

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
    >
      <button
        v-if="ar.enabled"
        class="button button--primary model-ar-button"
        slot="ar-button"
        type="button"
        @click="prepareArSession"
      >
        Ver no meu espaço
      </button>

      <div
        v-if="arStatus === 'session-started'"
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
