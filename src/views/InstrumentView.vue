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
      <RouterLink class="back-link" :to="{ name: 'catalog' }">
        <span aria-hidden="true">←</span> Voltar ao catálogo
      </RouterLink>
    </nav>

    <header class="instrument-header">
      <p class="eyebrow">Instrumento bíblico</p>
      <h1>{{ instrument.name }}</h1>
      <p>{{ instrument.shortDescription }}</p>
    </header>

    <section class="instrument-experience" aria-label="Exploração do instrumento">
      <div class="instrument-visual" :aria-label="`Visualização de ${instrument.name}`">
        <InstrumentModel
          v-if="instrument.assets.modelUrl"
          :key="instrument.id"
          :model-url="instrument.assets.modelUrl"
          :poster-url="instrument.assets.coverImageUrl ?? undefined"
          :instrument-name="instrument.name"
          :ar="instrument.ar"
        />

        <div v-else class="model-placeholder">
          <span class="model-placeholder__letter" aria-hidden="true">
            {{ instrument.name.slice(0, 1) }}
          </span>
          <strong>Modelo 3D em preparação</strong>
          <span>O conteúdo educacional já pode ser consultado nesta página.</span>
        </div>
      </div>

      <aside class="instrument-overview" aria-label="Resumo do instrumento">
        <section class="overview-section">
          <p class="eyebrow">Referências</p>
          <h2>Onde aparece na Bíblia?</h2>
          <ul v-if="instrument.bibleRefs.length" class="reference-list">
            <li v-for="reference in instrument.bibleRefs" :key="formatBibleRef(reference)">
              {{ formatBibleRef(reference) }}
            </li>
          </ul>
          <p v-else>Referências em preparação.</p>
        </section>

        <section class="overview-section overview-section--soft">
          <p class="eyebrow">Experiência</p>
          <h2>
            {{ instrument.assets.modelUrl ? "Explore por todos os ângulos" : "Conteúdo disponível" }}
          </h2>
          <p>
            {{
              instrument.assets.modelUrl
                ? "Arraste para girar o modelo e use o gesto de pinça ou a roda do mouse para aproximar."
                : "Conheça o contexto bíblico, a história e a ciência por trás deste instrumento."
            }}
          </p>
        </section>

        <section v-if="instrument.assets.audioUrl" class="overview-section">
          <p class="eyebrow">Demonstração</p>
          <h2>Ouça o instrumento</h2>
          <audio controls preload="none" :src="instrument.assets.audioUrl" />
        </section>
      </aside>
    </section>

    <section class="instrument-education" aria-labelledby="education-title">
      <div class="section-heading section-heading--education">
        <div>
          <p class="eyebrow">Aprenda</p>
          <h2 id="education-title">História, Bíblia e ciência</h2>
        </div>
        <p>Descubra o papel do instrumento no seu tempo e entenda como ele produz som.</p>
      </div>

      <div class="education-grid">
        <section class="content-section content-section--biblical">
          <span class="content-section__number" aria-hidden="true">01</span>
          <h3>Contexto bíblico</h3>
          <p>{{ instrument.content.biblicalContext ?? "Conteúdo em preparação." }}</p>
        </section>

        <section class="content-section">
          <span class="content-section__number" aria-hidden="true">02</span>
          <h3>Contexto histórico</h3>
          <p>{{ instrument.content.historicalContext ?? "Conteúdo em preparação." }}</p>
        </section>

        <section class="content-section content-section--science">
          <span class="content-section__number" aria-hidden="true">03</span>
          <h3>Como o som é produzido?</h3>
          <p>{{ instrument.content.scientificExplanation ?? "Conteúdo em preparação." }}</p>
        </section>
      </div>
    </section>

    <section v-if="instrument.content.curiosities.length" class="curiosities-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Você sabia?</p>
          <h2>Curiosidades</h2>
        </div>
      </div>

      <ul class="curiosity-grid">
        <li v-for="(curiosity, index) in instrument.content.curiosities" :key="curiosity">
          <span aria-hidden="true">{{ String(index + 1).padStart(2, "0") }}</span>
          <p>{{ curiosity }}</p>
        </li>
      </ul>
    </section>

    <section v-if="instrument.sources.length" class="sources-section">
      <h2>Fontes consultadas</h2>
      <ul>
        <li v-for="source in instrument.sources" :key="source.url">
          <a :href="source.url" target="_blank" rel="noreferrer">
            {{ source.title }} <span aria-hidden="true">↗</span>
          </a>
        </li>
      </ul>
    </section>
  </article>

  <section v-else class="empty-state">
    <p class="eyebrow">Erro de navegação</p>
    <h1>Instrumento não encontrado</h1>
    <p>Escolha um instrumento disponível no catálogo.</p>
    <RouterLink class="button button--primary" :to="{ name: 'catalog' }">
      Voltar ao catálogo
    </RouterLink>
  </section>
</template>
