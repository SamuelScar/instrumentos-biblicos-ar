<script setup lang="ts">
import { Camera, CameraOff } from "@lucide/vue";
import { RouterLink } from "vue-router";
import { useCameraDiagnostics } from "../composables/useCameraDiagnostics";

const {
  videoElement,
  cameras,
  devices,
  diagnosticsText,
  isActive,
  logsText,
  selectedCameraId,
  changeCamera,
  startCamera,
  stopCamera,
} = useCameraDiagnostics();
</script>

<template>
  <section class="diagnostics-page">
    <nav class="page-navigation" aria-label="Navegação da página">
      <RouterLink class="back-link" :to="{ name: 'catalog' }">
        <span aria-hidden="true">←</span> Voltar ao catálogo
      </RouterLink>
    </nav>

    <header class="diagnostics-header">
      <p class="eyebrow">Área técnica</p>
      <h1>Diagnóstico de câmera</h1>
      <p>
        Use esta tela para conferir permissões, HTTPS e acesso à câmera durante o desenvolvimento da
        experiência em realidade aumentada.
      </p>
    </header>

    <div class="diagnostics-grid">
      <section class="diagnostics-panel">
        <div class="diagnostics-panel__heading">
          <div>
            <p class="eyebrow">Pré-visualização</p>
            <h2>Câmera do dispositivo</h2>
          </div>
          <span class="status-badge" :class="{ 'status-badge--active': isActive }">
            {{ isActive ? "Câmera ativa" : "Câmera parada" }}
          </span>
        </div>

        <div class="diagnostics-camera-field">
          <label for="diagnostics-camera">Câmera utilizada</label>
          <select
            id="diagnostics-camera"
            v-model="selectedCameraId"
            :disabled="!cameras.length"
            @change="changeCamera"
          >
            <option value="">Automática — preferir câmera traseira</option>
            <option v-for="camera in cameras" :key="camera.deviceId" :value="camera.deviceId">
              {{ camera.label }}
            </option>
          </select>
          <span v-if="cameras.length > 1">
            Ao selecionar outra opção, a câmera ativa será trocada automaticamente.
          </span>
          <span v-else>
            Os nomes e as opções disponíveis podem aparecer somente após conceder a permissão.
          </span>
        </div>

        <div class="camera-preview" :class="{ 'camera-preview--active': isActive }">
          <video ref="videoElement" playsinline muted autoplay />
          <div v-if="!isActive" class="camera-preview__empty">
            <Camera :size="32" aria-hidden="true" />
            <strong>A câmera ainda não foi iniciada</strong>
            <span>O navegador solicitará permissão quando você iniciar o diagnóstico.</span>
          </div>
        </div>

        <div class="diagnostics-actions">
          <button class="button button--primary" type="button" @click="startCamera">
            <Camera :size="18" aria-hidden="true" />
            {{ isActive ? "Reiniciar câmera" : "Iniciar câmera" }}
          </button>
          <button
            class="button button--secondary"
            type="button"
            :disabled="!isActive"
            @click="stopCamera"
          >
            <CameraOff :size="18" aria-hidden="true" />
            Parar câmera
          </button>
        </div>
      </section>

      <aside class="diagnostics-panel diagnostics-panel--summary">
        <p class="eyebrow">Ambiente</p>
        <h2>Resumo técnico</h2>
        <p>Informações usadas para identificar bloqueios de permissão e compatibilidade.</p>
        <pre class="diagnostics-output">{{ diagnosticsText }}</pre>
      </aside>
    </div>

    <section class="diagnostics-details" aria-labelledby="diagnostics-details-title">
      <div class="diagnostics-details__heading">
        <p class="eyebrow">Investigação</p>
        <h2 id="diagnostics-details-title">Detalhes avançados</h2>
        <p>Abra estas informações somente quando precisar investigar um problema.</p>
      </div>

      <details>
        <summary>Dispositivos de mídia</summary>
        <pre class="diagnostics-output">{{ devices }}</pre>
      </details>

      <details>
        <summary>Logs da sessão</summary>
        <pre class="diagnostics-output diagnostics-output--dark">{{ logsText }}</pre>
      </details>
    </section>
  </section>
</template>
