// src/ar/modes/world/mode.ts
import type { ArMode, Availability } from "../../types";
import { instruments } from "../../../domain/instruments";
import { store } from "../../../app/store";

type State = {
  container: HTMLElement | null;
  surface: HTMLElement | null;
  marker: HTMLElement | null;
  coordsEl: HTMLElement | null;
  onPointerDown: ((ev: PointerEvent) => void) | null;
};

export function createWorldMode(): ArMode {
  const state: State = {
    container: null,
    surface: null,
    marker: null,
    coordsEl: null,
    onPointerDown: null,
  };

  const getAvailability = async (): Promise<Availability> => {
    // Protótipo sempre disponível (depois você troca por WebXR + fallback)
    return { available: true };
  };

  function setCoords(text: string) {
    if (state.coordsEl) state.coordsEl.textContent = text;
  }

  function clearMarker() {
    if (state.marker) {
      state.marker.remove();
      state.marker = null;
    }
    setCoords("Toque para posicionar");
  }

  function createInstrumentCard() {
    const instrument =
      instruments.find((i) => i.id === store.selectedInstrumentId) ?? instruments[0];

    const card = document.createElement("div");
    card.setAttribute("data-marker", "1");
    card.style.position = "absolute";
    card.style.transform = "translate(-50%, -100%)";
    card.style.width = "240px";
    card.style.padding = "10px 12px";
    card.style.borderRadius = "10px";
    card.style.background = "rgba(0,0,0,.65)";
    card.style.border = "1px solid rgba(255,255,255,.12)";
    card.style.color = "#fff";
    card.style.fontSize = "13px";
    card.style.userSelect = "none";
    card.style.pointerEvents = "none"; // importante: não bloquear novos toques

    const ref = instrument.bibleRefs[0];
    const verse = ref.verse ? `:${ref.verse}` : "";

    card.innerHTML = `
      <div style="font-weight:700; font-size:14px; margin-bottom:4px;">${instrument.name}</div>
      <div style="opacity:.9; margin-bottom:6px;">${instrument.shortDescription}</div>
      <div style="opacity:.75;">Referência: ${ref.book} ${ref.chapter}${verse}</div>
    `;

    return card;
  }

  function placeMarker(x: number, y: number) {
    if (!state.surface) return;

    if (!state.marker) {
      state.marker = createInstrumentCard();
      state.surface.appendChild(state.marker);
    } else {
      // Atualiza o card se o usuário trocou o instrumento e tocou novamente
      const newCard = createInstrumentCard();
      state.marker.replaceWith(newCard);
      state.marker = newCard;
    }

    state.marker.style.left = `${x}px`;
    state.marker.style.top = `${y}px`;

    const rect = state.surface.getBoundingClientRect();
    const prcX = Math.round((x / rect.width) * 100);
    const prcY = Math.round((y / rect.height) * 100);

    setCoords(`Posição: ${Math.round(x)}px, ${Math.round(y)}px (${prcX}%, ${prcY}%)`);
  }

  async function detach() {
    if (state.surface && state.onPointerDown) {
      state.surface.removeEventListener("pointerdown", state.onPointerDown);
    }
    state.onPointerDown = null;
    state.surface = null;
    state.coordsEl = null;
    state.marker = null;
  }

  return {
    id: "world",
    label: "World Tracking (Protótipo)",
    getAvailability,

    async init(container) {
      state.container = container;

      container.innerHTML = `
        <div style="height:100%; position:relative;">
          <div style="display:flex; gap:8px; align-items:center; padding:12px;">
            <div style="font-weight:600;">Protótipo</div>
            <div id="wt-coords" style="opacity:.8;">Toque para posicionar</div>
            <div style="flex:1;"></div>
            <button id="wt-clear">Limpar</button>
          </div>

          <div
            id="wt-surface"
            style="
              position:absolute;
              inset:56px 0 0 0;
              border-top:1px solid rgba(255,255,255,.12);
              background:rgba(0,0,0,.15);
              touch-action:manipulation;
              overflow:hidden;
            "
          >
            <div style="position:absolute; left:12px; bottom:12px; background:rgba(0,0,0,.55); color:#fff; padding:8px 10px; border-radius:8px; font-size:14px;">
              (stub) Tap to place — aqui entra WebXR/hit-test no futuro
            </div>
          </div>
        </div>
      `;

      state.surface = container.querySelector<HTMLElement>("#wt-surface")!;
      state.coordsEl = container.querySelector<HTMLElement>("#wt-coords")!;

      container.querySelector<HTMLButtonElement>("#wt-clear")!.onclick = () => clearMarker();

      state.onPointerDown = (ev: PointerEvent) => {
        if (!state.surface) return;

        const rect = state.surface.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;

        const clampedX = Math.max(0, Math.min(rect.width, x));
        const clampedY = Math.max(0, Math.min(rect.height, y));

        placeMarker(clampedX, clampedY);
      };

      state.surface.addEventListener("pointerdown", state.onPointerDown);
    },

    async start() {},

    async stop() {},

    async destroy() {
      clearMarker();
      await detach();
      if (state.container) state.container.innerHTML = "";
      state.container = null;
    },
  };
}
