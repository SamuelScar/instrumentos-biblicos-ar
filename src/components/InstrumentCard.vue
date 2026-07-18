<script setup lang="ts">
import { Box, ScanLine } from "@lucide/vue";
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

        <span
          v-if="instrument.assets.modelUrl || instrument.ar.enabled"
          class="instrument-card__capabilities"
        >
          <span
            v-if="instrument.assets.modelUrl"
            class="instrument-card__capability"
            role="img"
            aria-label="Modelo 3D disponível"
            title="Modelo 3D disponível"
          >
            <Box :size="18" aria-hidden="true" />
          </span>
          <span
            v-if="instrument.ar.enabled"
            class="instrument-card__capability"
            role="img"
            aria-label="Realidade aumentada disponível"
            title="Realidade aumentada disponível"
          >
            <ScanLine :size="18" aria-hidden="true" />
          </span>
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
