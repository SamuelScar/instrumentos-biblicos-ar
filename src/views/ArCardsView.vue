<script setup lang="ts">
import { Download, FileDown, Printer, ScanLine } from "@lucide/vue";
import {
  AR_CARD_PRINT_HEIGHT_CM,
  AR_CARD_PRINT_WIDTH_CM,
  AR_CARDS_PDF_URL,
  arCards,
} from "../domain/arCards";
</script>

<template>
  <div class="ar-cards-page">
    <header class="ar-cards-hero">
      <div class="ar-cards-hero__content">
        <p class="eyebrow">Realidade aumentada por card</p>
        <h1>Leve os instrumentos para a sala de aula</h1>
        <p>
          Baixe os cards usados pela câmera para reconhecer cada instrumento. Você pode escolher um
          card específico ou imprimir o kit completo no tamanho preparado para a experiência.
        </p>

        <div class="ar-cards-hero__actions">
          <a
            class="button button--primary"
            :href="AR_CARDS_PDF_URL"
            download="cards-ra-instrumentos-biblicos.pdf"
          >
            <FileDown :size="19" aria-hidden="true" />
            Baixar kit em PDF
          </a>
          <RouterLink class="button button--secondary" :to="{ name: 'ar-cards-print' }">
            <Printer :size="19" aria-hidden="true" />
            Ver versão para impressão
          </RouterLink>
        </div>
      </div>

      <aside class="ar-cards-instructions" aria-labelledby="print-instructions-title">
        <div class="ar-cards-instructions__icon" aria-hidden="true">
          <ScanLine :size="30" />
        </div>
        <p class="eyebrow">Antes de imprimir</p>
        <h2 id="print-instructions-title">Use o tamanho correto</h2>
        <ol>
          <li>Imprima em <strong>tamanho real ou escala 100%</strong>, sem ajustar à página.</li>
          <li>
            Cada card deve medir
            <strong>{{ AR_CARD_PRINT_WIDTH_CM }} × {{ AR_CARD_PRINT_HEIGHT_CM }} cm</strong>.
          </li>
          <li>Recorte nas bordas da imagem e mantenha o card plano e bem iluminado.</li>
          <li>Na câmera, enquadre o card inteiro sem cobrir a ilustração.</li>
        </ol>
      </aside>
    </header>

    <section class="ar-cards-collection" aria-labelledby="ar-cards-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Downloads individuais</p>
          <h2 id="ar-cards-title">Escolha um instrumento</h2>
        </div>
        <p>Os arquivos possuem proporção 2:3 e resolução de 1024 × 1536 pixels.</p>
      </div>

      <div class="ar-cards-grid">
        <article
          v-for="card in arCards"
          :id="`card-${card.id}`"
          :key="card.id"
          class="ar-download-card"
        >
          <div class="ar-download-card__preview">
            <img
              :src="card.imageUrl"
              :alt="`Card de realidade aumentada do instrumento ${card.instrumentName}`"
              loading="lazy"
              width="1024"
              height="1536"
            />
          </div>

          <div class="ar-download-card__content">
            <div>
              <p class="eyebrow">Card de RA</p>
              <h3>{{ card.instrumentName }}</h3>
            </div>

            <a
              class="ar-download-card__action"
              :href="card.imageUrl"
              :download="card.downloadFileName"
            >
              <Download :size="18" aria-hidden="true" />
              Baixar card
            </a>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
