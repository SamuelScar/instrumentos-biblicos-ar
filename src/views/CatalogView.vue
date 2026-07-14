<script setup lang="ts">
import { RouterLink } from "vue-router";
import InstrumentCard from "../components/InstrumentCard.vue";
import { instruments } from "../domain/instruments";
</script>

<template>
  <header class="hero">
    <p class="eyebrow">Ciência e Fé</p>
    <h1>Instrumentos Bíblicos</h1>
    <p class="hero__description">
      Conheça a história, o som e a ciência por trás de instrumentos mencionados na Bíblia.
    </p>
  </header>

  <section class="catalog" aria-labelledby="catalog-title">
    <h2 id="catalog-title">Escolha um instrumento</h2>

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
      Diagnóstico da câmera
    </RouterLink>
  </div>
</template>
