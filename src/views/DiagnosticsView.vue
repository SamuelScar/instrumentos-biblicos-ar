<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useCameraDiagnostics } from "../composables/useCameraDiagnostics";

const {
  videoElement,
  devices,
  diagnosticsText,
  isActive,
  logsText,
  startCamera,
  stopCamera,
} = useCameraDiagnostics();
</script>

<template>
  <section class="diagnostics-page">
    <div class="page-navigation">
      <RouterLink class="button button--quiet" :to="{ name: 'catalog' }">← Voltar</RouterLink>
      <strong>Diagnóstico da câmera</strong>
    </div>

    <div class="diagnostics-actions">
      <button class="button button--primary" type="button" @click="startCamera">
        Testar câmera
      </button>
      <button
        class="button button--secondary"
        type="button"
        :disabled="!isActive"
        @click="stopCamera"
      >
        Parar câmera
      </button>
    </div>

    <pre class="diagnostics-output">{{ diagnosticsText }}</pre>

    <details>
      <summary>Dispositivos de mídia</summary>
      <pre class="diagnostics-output">{{ devices }}</pre>
    </details>

    <details>
      <summary>Logs</summary>
      <pre class="diagnostics-output diagnostics-output--dark">{{ logsText }}</pre>
    </details>

    <div class="camera-preview">
      <video ref="videoElement" playsinline muted autoplay />
    </div>
  </section>
</template>
