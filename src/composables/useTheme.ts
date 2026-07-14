import { onBeforeUnmount, onMounted, ref, watch } from "vue";

export type ThemePreference = "system" | "light" | "dark";

const THEME_STORAGE_KEY = "instrumentos-mundo-biblico-theme";
const themePreference = ref<ThemePreference>(readStoredTheme());

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

function readStoredTheme(): ThemePreference {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return isThemePreference(storedTheme) ? storedTheme : "system";
}

function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference !== "system") {
    return preference;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(preference: ThemePreference): void {
  const resolvedTheme = resolveTheme(preference);
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;
}

applyTheme(themePreference.value);

export function useTheme() {
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

  function handleSystemThemeChange(): void {
    if (themePreference.value === "system") {
      applyTheme("system");
    }
  }

  watch(themePreference, (preference) => {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
    applyTheme(preference);
  });

  onMounted(() => systemTheme.addEventListener("change", handleSystemThemeChange));
  onBeforeUnmount(() => systemTheme.removeEventListener("change", handleSystemThemeChange));

  return { themePreference };
}
