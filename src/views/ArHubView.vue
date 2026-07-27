<script setup lang="ts">
import { Box, Camera, Download, ScanLine } from "@lucide/vue";
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AudioPlayer from "../components/AudioPlayer.vue";
import InstrumentModel from "../components/InstrumentModel.vue";
import {
  environmentArInstruments,
  findEnvironmentArInstrument,
  imageArInstruments,
} from "../domain/arExperience";
import type { InstrumentId } from "../domain/instruments";

type ArMode = "environment" | "cards";

const ArCardCollectionExperience = defineAsyncComponent(
  () => import("../components/ArCardCollectionExperience.vue")
);

const route = useRoute();
const selectedMode = computed<ArMode | null>(() => {
  if (route.name === "ar-environment") return "environment";
  if (route.name === "ar-card-collection") return "cards";
  return null;
});
const selectedInstrumentId = ref<InstrumentId | null>(
  environmentArInstruments[0]?.id ?? null
);
const showCardExperience = ref(false);
const selectedInstrument = computed(() => {
  if (!selectedInstrumentId.value) return undefined;
  return findEnvironmentArInstrument(selectedInstrumentId.value);
});

watch(selectedMode, () => {
  showCardExperience.value = false;
});
</script>

<template>
  <div class="ar-hub-page">
    <header class="ar-hub-header">
      <p class="eyebrow">Realidade aumentada</p>
      <h1>Explore os instrumentos onde você estiver</h1>
      <p>
        Escolha como deseja explorar. Você pode colocar um instrumento no ambiente ou usar os cards
        para alternar entre toda a coleção.
      </p>
    </header>

    <section v-if="!selectedMode" class="ar-hub-modes" aria-labelledby="ar-mode-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Duas experiências</p>
          <h2 id="ar-mode-title">Como você quer explorar?</h2>
        </div>
      </div>

      <div class="ar-hub-mode-grid">
        <RouterLink class="ar-hub-mode-card" :to="{ name: 'ar-environment' }">
          <span class="ar-hub-mode-card__icon" aria-hidden="true">
            <Box :size="32" />
          </span>
          <span>
            <strong>Ver no meu espaço</strong>
            <small>
              Escolha um instrumento e coloque o modelo no chão usando um celular compatível.
            </small>
          </span>
          <span class="ar-hub-mode-card__action">
            Escolher instrumento <span aria-hidden="true">→</span>
          </span>
        </RouterLink>

        <RouterLink class="ar-hub-mode-card" :to="{ name: 'ar-card-collection' }">
          <span class="ar-hub-mode-card__icon" aria-hidden="true">
            <ScanLine :size="32" />
          </span>
          <span>
            <strong>Usar os cards</strong>
            <small>
              Mantenha a câmera aberta e troque de instrumento simplesmente apontando para outro
              card.
            </small>
          </span>
          <span class="ar-hub-mode-card__action">
            Preparar câmera <span aria-hidden="true">→</span>
          </span>
        </RouterLink>
      </div>
    </section>

    <section
      v-else-if="selectedMode === 'environment'"
      class="ar-hub-experience"
      aria-labelledby="environment-title"
    >
      <div class="section-heading ar-hub-experience__heading">
        <div>
          <p class="eyebrow">No ambiente</p>
          <h2 id="environment-title">Escolha um instrumento</h2>
        </div>
        <p>
          Ao voltar da realidade aumentada, escolha outro instrumento aqui sem precisar abrir sua
          página individual.
        </p>
      </div>

      <div class="ar-hub-instrument-selector" aria-label="Instrumentos disponíveis">
        <button
          v-for="instrument in environmentArInstruments"
          :key="instrument.id"
          class="ar-hub-instrument-option"
          :class="{ 'ar-hub-instrument-option--active': selectedInstrumentId === instrument.id }"
          type="button"
          :aria-pressed="selectedInstrumentId === instrument.id"
          @click="selectedInstrumentId = instrument.id"
        >
          <img
            v-if="instrument.assets.coverImageUrl"
            :src="instrument.assets.coverImageUrl"
            :alt="`Capa de ${instrument.name}`"
            loading="lazy"
          />
          <span v-else aria-hidden="true">{{ instrument.name.slice(0, 1) }}</span>
          <strong>{{ instrument.name }}</strong>
        </button>
      </div>

      <div v-if="selectedInstrument" class="ar-hub-environment">
        <div class="ar-hub-environment__intro">
          <p class="eyebrow">Instrumento selecionado</p>
          <h3>{{ selectedInstrument.name }}</h3>
          <p>{{ selectedInstrument.shortDescription }}</p>
        </div>

        <InstrumentModel
          :key="selectedInstrument.id"
          :model-url="selectedInstrument.assets.modelUrl"
          :poster-url="selectedInstrument.assets.coverImageUrl ?? undefined"
          :instrument-name="selectedInstrument.name"
          :ar="selectedInstrument.ar"
        >
          <template #actions>
            <AudioPlayer
              v-if="selectedInstrument.assets.audioUrl"
              :key="selectedInstrument.id"
              variant="compact"
              :src="selectedInstrument.assets.audioUrl"
              :instrument-name="selectedInstrument.name"
            />
          </template>
        </InstrumentModel>
      </div>
    </section>

    <section
      v-else
      class="ar-hub-experience ar-hub-cards"
      aria-labelledby="cards-experience-title"
    >
      <div class="ar-hub-cards__content">
        <p class="eyebrow">Com cards</p>
        <h2 id="cards-experience-title">Uma câmera para os nove instrumentos</h2>
        <p>
          Inicie a câmera e aponte para qualquer card. Quando quiser trocar, enquadre outro card e o
          modelo será substituído automaticamente.
        </p>

        <div class="ar-hub-cards__actions">
          <button
            class="button button--primary"
            type="button"
            @click="showCardExperience = true"
          >
            <Camera :size="19" aria-hidden="true" />
            Abrir leitor de cards
          </button>
          <RouterLink class="button button--secondary" :to="{ name: 'ar-cards' }">
            <Download :size="19" aria-hidden="true" />
            Baixar os cards
          </RouterLink>
        </div>

        <small>
          Use os cards impressos ou exiba o card em outra tela apoiada sobre uma superfície.
        </small>
      </div>

      <div class="ar-hub-card-preview" aria-label="Cards disponíveis">
        <figure v-for="instrument in imageArInstruments" :key="instrument.id">
          <img
            :src="instrument.ar.imageTracking.targetImageUrl"
            :alt="`Card de ${instrument.name}`"
            loading="lazy"
          />
          <figcaption>{{ instrument.name }}</figcaption>
        </figure>
      </div>
    </section>

    <ArCardCollectionExperience
      v-if="showCardExperience"
      @close="showCardExperience = false"
    />
  </div>
</template>
