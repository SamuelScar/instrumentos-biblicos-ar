<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Instrument } from "../domain/instruments";

defineProps<{
  modelUrl: string;
  posterUrl?: string;
  instrumentName: string;
  ar: Instrument["ar"];
}>();

const componentReady = ref(false);
const loadFailed = ref(false);
const loaded = ref(false);

onMounted(async () => {
  try {
    await import("@google/model-viewer");
    componentReady.value = true;
  } catch {
    loadFailed.value = true;
  }
});
</script>

<template>
  <div class="instrument-model-shell">
    <div v-if="loadFailed" class="notice notice--error">
      <strong>Não foi possível carregar o modelo 3D.</strong>
      <span>O arquivo ou o contexto gráfico do navegador pode estar indisponível.</span>
    </div>

    <template v-else-if="componentReady">
      <model-viewer
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
        @load="loaded = true"
        @error="loadFailed = true"
      >
        <button
          v-if="ar.enabled"
          class="button button--primary model-ar-button"
          slot="ar-button"
          type="button"
        >
          Ver no meu espaço
        </button>
      </model-viewer>

      <p v-if="!loaded" class="model-loading">Carregando modelo 3D...</p>
    </template>

    <p v-else class="model-loading">Preparando visualizador 3D...</p>
  </div>
</template>
