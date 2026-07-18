<script setup lang="ts">
import { Wrench } from "@lucide/vue";
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import InstrumentCard from "../components/InstrumentCard.vue";
import { instruments } from "../domain/instruments";

type SortOption = "default" | "name-asc" | "name-desc" | "bible-refs" | "sources";

const sortOption = ref<SortOption>("default");
const nameCollator = new Intl.Collator("pt-BR", { sensitivity: "base" });
const isDevelopment = import.meta.env.DEV;

const sortedInstruments = computed(() => {
  const sorted = [...instruments];

  switch (sortOption.value) {
    case "name-asc":
      return sorted.sort((first, second) => nameCollator.compare(first.name, second.name));
    case "name-desc":
      return sorted.sort((first, second) => nameCollator.compare(second.name, first.name));
    case "bible-refs":
      return sorted.sort(
        (first, second) =>
          second.bibleRefs.length - first.bibleRefs.length ||
          nameCollator.compare(first.name, second.name),
      );
    case "sources":
      return sorted.sort(
        (first, second) =>
          second.sources.length - first.sources.length ||
          nameCollator.compare(first.name, second.name),
      );
    default:
      return sorted;
  }
});
</script>

<template>
  <div class="catalog-page">
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
      <div class="section-heading catalog-heading">
        <div>
          <p class="eyebrow">Catálogo</p>
          <h2 id="catalog-title">Escolha um instrumento</h2>
          <p class="catalog-heading__description">
            Comece pelo conteúdo disponível e acompanhe a chegada de novos modelos 3D.
          </p>
        </div>

        <div class="catalog-toolbar">
          <label for="catalog-sort">Ordenar por</label>
          <select id="catalog-sort" v-model="sortOption">
            <option value="default">Ordem sugerida</option>
            <option value="name-asc">Nome: A–Z</option>
            <option value="name-desc">Nome: Z–A</option>
            <option value="bible-refs">Mais referências bíblicas</option>
            <option value="sources">Mais fontes de pesquisa</option>
          </select>
        </div>
      </div>

      <div class="catalog-grid">
        <InstrumentCard
          v-for="instrument in sortedInstruments"
          :key="instrument.id"
          :instrument="instrument"
        />
      </div>
    </section>

    <div v-if="isDevelopment" class="technical-tools">
      <span>Ambiente local</span>
      <RouterLink class="button button--quiet" :to="{ name: 'diagnostics' }">
        <Wrench :size="17" aria-hidden="true" />
        Diagnóstico de câmera
      </RouterLink>
    </div>
  </div>
</template>
