<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import InstrumentModel from "../components/InstrumentModel.vue";
import { findInstrumentById, formatBibleRef } from "../domain/instruments";

const route = useRoute();

const instrument = computed(() => {
  const routeId = route.params.instrumentId;
  const instrumentId = Array.isArray(routeId) ? routeId[0] : routeId;
  return findInstrumentById(instrumentId);
});
</script>

<template>
  <article v-if="instrument" class="instrument-page">
    <nav class="page-navigation" aria-label="Navegação da página">
      <RouterLink class="button button--quiet" :to="{ name: 'catalog' }">
        ← Voltar ao catálogo
      </RouterLink>
    </nav>

    <header class="instrument-header">
      <p class="eyebrow">Instrumento bíblico</p>
      <h1>{{ instrument.name }}</h1>
      <p>{{ instrument.shortDescription }}</p>
    </header>

    <div class="instrument-layout">
      <section class="instrument-visual" :aria-label="`Visualização de ${instrument.name}`">
        <InstrumentModel
          v-if="instrument.assets.modelUrl"
          :key="instrument.id"
          :model-url="instrument.assets.modelUrl"
          :poster-url="instrument.assets.posterUrl"
          :instrument-name="instrument.name"
          :ar="instrument.ar"
        />

        <div v-else class="model-placeholder">
          <strong>Modelo 3D em preparação</strong>
          <span>O conteúdo educacional já pode ser consultado nesta página.</span>
        </div>
      </section>

      <div class="instrument-content">
        <section class="content-section">
          <h2>Onde aparece na Bíblia?</h2>
          <p>{{ instrument.bibleRefs.map(formatBibleRef).join(", ") }}</p>
        </section>

        <section class="content-section">
          <h2>Contexto histórico</h2>
          <p>{{ instrument.content.historicalContext ?? "Conteúdo em preparação." }}</p>
        </section>

        <section class="content-section">
          <h2>Como o som é produzido?</h2>
          <p>{{ instrument.content.scientificExplanation ?? "Conteúdo em preparação." }}</p>
        </section>

        <section v-if="instrument.content.curiosities.length" class="content-section">
          <h2>Curiosidades</h2>
          <ul>
            <li v-for="curiosity in instrument.content.curiosities" :key="curiosity">
              {{ curiosity }}
            </li>
          </ul>
        </section>

        <section v-if="instrument.assets.audioUrl" class="content-section">
          <h2>Ouça o instrumento</h2>
          <audio controls preload="none" :src="instrument.assets.audioUrl" />
        </section>
      </div>
    </div>
  </article>

  <section v-else class="empty-state">
    <h1>Instrumento não encontrado</h1>
    <p>Escolha um instrumento disponível no catálogo.</p>
    <RouterLink class="button button--primary" :to="{ name: 'catalog' }">
      Voltar ao catálogo
    </RouterLink>
  </section>
</template>
