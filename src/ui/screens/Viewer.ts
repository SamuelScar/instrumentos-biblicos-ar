import { goTo } from "../../app/routes";
import { store } from "../../app/store";
import type { ArMode } from "../../ar/types";
import { createImageMode } from "../../ar/modes/image/mode";
import { createWorldMode } from "../../ar/modes/world/mode";

function resolveMode(): ArMode {
  return store.selectedMode === "world" ? createWorldMode() : createImageMode();
}

export async function renderViewer(root: HTMLElement) {
  let currentMode: ArMode | null = null;

  const safeStop = async () => {
    if (!currentMode) return;
    try {
      await currentMode.stop();
    } finally {
      await currentMode.destroy();
      currentMode = null;
    }
  };

  const mode = resolveMode();

  const el = document.createElement("div");
  el.innerHTML = `
    <div style="display:flex; gap:12px; align-items:center;">
      <button id="btn-back">Voltar</button>
      <strong>Viewer — ${mode.label}</strong>
    </div>

    <div id="ar-root" style="margin-top:12px; border:1px solid #ccc; height:70vh; border-radius:8px; overflow:hidden;">
      <div style="padding:12px;">Inicializando...</div>
    </div>
  `;

  el.querySelector<HTMLButtonElement>("#btn-back")!.onclick = async () => {
    await safeStop();
    goTo("home");
  };

  root.appendChild(el);

  const arRoot = el.querySelector<HTMLElement>("#ar-root")!;
  const availability = await mode.getAvailability();

  if (!availability.available) {
    arRoot.innerHTML = `<div style="padding:12px;">Indisponível: ${availability.reason ?? "motivo desconhecido"}</div>`;
    return safeStop; // cleanup mesmo assim
  }

  currentMode = mode;
  await currentMode.init(arRoot);
  await currentMode.start();

  return safeStop;
}
