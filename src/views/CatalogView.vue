<script setup lang="ts">
import { RouterLink } from "vue-router";
import InstrumentCard from "../components/InstrumentCard.vue";
import { instruments } from "../domain/instruments";
</script>

<template>
  <header class="hero">
    <div class="hero__content">
      <p class="eyebrow">Uma jornada pela música do mundo bíblico</p>
      <h1>Instrumentos do Mundo Bíblico</h1>
      <p class="hero__description">
        Explore em 3D e conheça a história, o som e a ciência por trás dos instrumentos
        mencionados na Bíblia.
      </p>
    </div>

    <div class="hero__art">
      <img
        class="hero__image"
        src="/images/hero-instruments.png"
        alt="Ilustração de um shofar, uma lira antiga e um tambor de moldura"
      />
    </div>
  </header>

  <section class="catalog" aria-labelledby="catalog-title">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Catálogo</p>
        <h2 id="catalog-title">Escolha um instrumento</h2>
      </div>
      <p>Comece pelo conteúdo disponível e acompanhe a chegada de novos modelos 3D.</p>
    </div>

    <div class="catalog-grid">
      <InstrumentCard
        v-for="instrument in instruments"
        :key="instrument.id"
        :instrument="instrument"
      />
    </div>
  </section>

  <div class="technical-tools">
    <RouterLink class="button button--quiet" :to="{ name: 'diagnostics' }">
      Ferramentas técnicas
    </RouterLink>
  </div>
</template>
