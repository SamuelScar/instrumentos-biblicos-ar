<script setup lang="ts">
import { RouterLink } from "vue-router";
import type { Instrument } from "../domain/instruments";

defineProps<{
  instrument: Instrument;
}>();
</script>

<template>
  <article class="instrument-card">
    <div class="instrument-card__preview" aria-hidden="true">
      {{ instrument.name.slice(0, 1) }}
    </div>

    <div class="instrument-card__content">
      <span class="status-badge">
        {{ instrument.assets.modelUrl ? "Modelo 3D disponível" : "Conteúdo em preparação" }}
      </span>

      <h3>{{ instrument.name }}</h3>
      <p>{{ instrument.shortDescription }}</p>

      <RouterLink
        class="button button--primary"
        :to="{ name: 'instrument', params: { instrumentId: instrument.id } }"
      >
        {{ instrument.assets.modelUrl ? "Explorar instrumento" : "Conhecer instrumento" }}
      </RouterLink>
    </div>
  </article>
</template>
