<script setup lang="ts">
import { ArrowLeft, Printer } from "@lucide/vue";
import {
  AR_CARD_PRINT_HEIGHT_CM,
  AR_CARD_PRINT_WIDTH_CM,
  arCardPrintSheets,
} from "../domain/arCards";

function printCards(): void {
  window.print();
}
</script>

<template>
  <div class="ar-print-page">
    <nav class="ar-print-toolbar" aria-label="Ações da versão para impressão">
      <RouterLink class="back-link" :to="{ name: 'ar-cards' }">
        <ArrowLeft :size="18" aria-hidden="true" />
        Voltar aos cards
      </RouterLink>

      <button class="button button--primary" type="button" @click="printCards">
        <Printer :size="18" aria-hidden="true" />
        Imprimir cards
      </button>
    </nav>

    <section class="ar-print-sheet ar-print-cover">
      <div class="ar-print-cover__mark" aria-hidden="true">
        <Printer :size="42" />
      </div>
      <p class="eyebrow">Kit para impressão</p>
      <h1>Cards de Realidade Aumentada</h1>
      <p>
        Instrumentos do Mundo Bíblico — nove imagens para explorar os modelos 3D com webcam ou
        câmera do celular.
      </p>

      <div class="ar-print-cover__instructions">
        <div>
          <span>01</span>
          <strong>Imprima em escala 100%</strong>
          <p>Desative opções como “ajustar”, “preencher” ou “reduzir páginas grandes”.</p>
        </div>
        <div>
          <span>02</span>
          <strong>Confira as dimensões</strong>
          <p>
            Cada imagem deve medir {{ AR_CARD_PRINT_WIDTH_CM }} × {{ AR_CARD_PRINT_HEIGHT_CM }} cm.
          </p>
        </div>
        <div>
          <span>03</span>
          <strong>Recorte e use</strong>
          <p>Mantenha o card plano, bem iluminado e completamente visível para a câmera.</p>
        </div>
      </div>
    </section>

    <section
      v-for="(sheet, sheetIndex) in arCardPrintSheets"
      :key="sheetIndex"
      class="ar-print-sheet ar-print-cards-sheet"
      :aria-label="`Folha ${sheetIndex + 1} de cards`"
    >
      <figure v-for="card in sheet" :key="card.id" class="ar-print-card">
        <img
          :src="card.imageUrl"
          :alt="`Card de realidade aumentada de ${card.instrumentName}`"
          width="1024"
          height="1536"
        />
        <figcaption>
          {{ card.instrumentName }} · {{ AR_CARD_PRINT_WIDTH_CM }} ×
          {{ AR_CARD_PRINT_HEIGHT_CM }} cm
        </figcaption>
      </figure>
    </section>
  </div>
</template>
