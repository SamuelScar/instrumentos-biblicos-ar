<script setup lang="ts">
import { RouterLink } from "vue-router";
import type { Instrument } from "../domain/instruments";

defineProps<{
  instrument: Instrument;
}>();
</script>

<template>
  <article class="instrument-card">
    <RouterLink
      class="instrument-card__link"
      :to="{ name: 'instrument', params: { instrumentId: instrument.id } }"
    >
      <div class="instrument-card__preview">
        <img
          v-if="instrument.assets.coverImageUrl"
          :src="instrument.assets.coverImageUrl"
          :alt="`Capa do instrumento ${instrument.name}`"
        />
        <span v-else aria-hidden="true">{{ instrument.name.slice(0, 1) }}</span>

        <span class="status-badge">
          {{ instrument.assets.modelUrl ? "Modelo 3D disponível" : "Modelo 3D em breve" }}
        </span>
      </div>

      <div class="instrument-card__content">
        <h3>{{ instrument.name }}</h3>
        <p>{{ instrument.shortDescription }}</p>

        <span class="instrument-card__action">
          {{ instrument.assets.modelUrl ? "Explorar instrumento" : "Conhecer instrumento" }}
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </RouterLink>
  </article>
</template>
