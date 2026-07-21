<script setup lang="ts">
import { Music2, Pause, Play } from "@lucide/vue";
import { computed, onBeforeUnmount, ref } from "vue";

type AudioPlayerVariant = "default" | "compact" | "minimal";

const props = withDefaults(
  defineProps<{
    src: string;
    instrumentName: string;
    variant?: AudioPlayerVariant;
  }>(),
  { variant: "default" }
);

const audioElement = ref<HTMLAudioElement>();
const currentTime = ref(0);
const duration = ref(0);
const isPlaying = ref(false);
const isLoading = ref(true);
const hasError = ref(false);

const progress = computed(() => {
  if (!duration.value) return 0;
  return Math.min((currentTime.value / duration.value) * 100, 100);
});

const progressStyle = computed(() => ({
  "--audio-progress": `${progress.value}%`,
}));
const isCompact = computed(() => props.variant !== "default");
const isMinimal = computed(() => props.variant === "minimal");
const compactExpanded = computed(
  () => isCompact.value && !isMinimal.value && (isPlaying.value || currentTime.value > 0)
);

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

async function togglePlayback(): Promise<void> {
  const audio = audioElement.value;
  if (!audio || hasError.value) return;

  if (audio.paused) {
    try {
      await audio.play();
    } catch {
      hasError.value = true;
      isLoading.value = false;
    }
    return;
  }

  audio.pause();
}

function updateDuration(): void {
  const audio = audioElement.value;
  if (!audio) return;

  duration.value = Number.isFinite(audio.duration) ? audio.duration : 0;
  isLoading.value = false;
}

function updateCurrentTime(): void {
  currentTime.value = audioElement.value?.currentTime ?? 0;
}

function seek(event: Event): void {
  const audio = audioElement.value;
  const input = event.currentTarget as HTMLInputElement;
  if (!audio) return;

  audio.currentTime = Number(input.value);
  currentTime.value = audio.currentTime;
}

function finishPlayback(): void {
  const audio = audioElement.value;
  isPlaying.value = false;
  currentTime.value = 0;

  if (audio) audio.currentTime = 0;
}

function reportError(): void {
  hasError.value = true;
  isLoading.value = false;
  isPlaying.value = false;
}

onBeforeUnmount(() => {
  audioElement.value?.pause();
});
</script>

<template>
  <div
    class="audio-player"
    :class="{
      'audio-player--playing': isPlaying,
      'audio-player--compact': isCompact,
      'audio-player--compact-expanded': compactExpanded,
    }"
  >
    <audio
      ref="audioElement"
      class="audio-player__media"
      :src="props.src"
      preload="none"
      @loadedmetadata="updateDuration"
      @durationchange="updateDuration"
      @timeupdate="updateCurrentTime"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @waiting="isLoading = true"
      @canplay="isLoading = false"
      @ended="finishPlayback"
      @error="reportError"
    />

    <button
      class="audio-player__control"
      type="button"
      :disabled="hasError"
      :aria-label="
        isPlaying ? `Pausar som de ${instrumentName}` : `Reproduzir som de ${instrumentName}`
      "
      @click="togglePlayback"
    >
      <Pause v-if="isPlaying" :size="21" fill="currentColor" aria-hidden="true" />
      <Play v-else :size="21" fill="currentColor" aria-hidden="true" />
      <span v-if="isCompact">Som</span>
    </button>

    <div v-if="!isMinimal" class="audio-player__content">
      <div v-if="!isCompact" class="audio-player__heading">
        <span class="audio-player__icon" aria-hidden="true">
          <Music2 :size="18" />
        </span>
        <div>
          <strong>Som de {{ instrumentName }}</strong>
          <span v-if="hasError">Áudio indisponível</span>
          <span v-else-if="isLoading">Preparando áudio...</span>
          <span v-else-if="isPlaying">Reproduzindo demonstração</span>
          <span v-else>Demonstração sonora</span>
        </div>
      </div>

      <input
        class="audio-player__timeline"
        type="range"
        min="0"
        :max="duration"
        step="0.1"
        :value="currentTime"
        :disabled="!duration || hasError"
        :style="progressStyle"
        :aria-label="`Posição do áudio de ${instrumentName}`"
        @input="seek"
      />

      <div class="audio-player__time" aria-hidden="true">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ duration ? formatTime(duration) : "--:--" }}</span>
      </div>
    </div>
  </div>
</template>
