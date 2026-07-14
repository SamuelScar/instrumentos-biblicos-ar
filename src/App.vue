<script setup lang="ts">
import { Moon, Palette, Sun } from "@lucide/vue";
import { ref } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { useTheme, type ThemePreference } from "./composables/useTheme";

const { themePreference } = useTheme();
const themeMenu = ref<HTMLDetailsElement>();

function selectTheme(preference: ThemePreference): void {
  themePreference.value = preference;
  themeMenu.value?.removeAttribute("open");
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header__inner">
        <RouterLink
          class="brand"
          :to="{ name: 'catalog' }"
          aria-label="Instrumentos do Mundo Bíblico — início"
        >
          <strong class="brand__text">Instrumentos do Mundo Bíblico</strong>
        </RouterLink>

        <div class="app-header__actions">
          <RouterLink class="header-link" :to="{ name: 'catalog' }">Instrumentos</RouterLink>

          <details ref="themeMenu" class="theme-menu">
            <summary
              :aria-label="`Tema atual: ${themePreference}. Alterar tema`"
              :title="`Tema atual: ${themePreference}`"
            >
              <Palette v-if="themePreference === 'system'" :size="20" aria-hidden="true" />
              <Sun v-else-if="themePreference === 'light'" :size="20" aria-hidden="true" />
              <Moon v-else :size="20" aria-hidden="true" />
            </summary>

            <div class="theme-menu__options">
              <button
                type="button"
                :aria-pressed="themePreference === 'system'"
                @click="selectTheme('system')"
              >
                <Palette :size="18" aria-hidden="true" />
                <span>Sistema</span>
              </button>
              <button
                type="button"
                :aria-pressed="themePreference === 'light'"
                @click="selectTheme('light')"
              >
                <Sun :size="18" aria-hidden="true" />
                <span>Claro</span>
              </button>
              <button
                type="button"
                :aria-pressed="themePreference === 'dark'"
                @click="selectTheme('dark')"
              >
                <Moon :size="18" aria-hidden="true" />
                <span>Escuro</span>
              </button>
            </div>
          </details>
        </div>
      </div>
    </header>

    <main class="screen-root">
      <RouterView />
    </main>

    <footer class="app-footer">
      <p>Ciência, história e fé em uma experiência interativa.</p>
    </footer>
  </div>
</template>
