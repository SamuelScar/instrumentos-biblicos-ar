import { goTo } from "../../app/routes";
import { store } from "../../app/store";
import { createImageMode } from "../../ar/modes/image/mode";
import { createWorldMode } from "../../ar/modes/world/mode";
import type { Availability } from "../../ar/types";
import { instruments } from "../../domain/instruments";

export function renderHome(root: HTMLElement) {
  const el = document.createElement("div");

  const options = instruments
    .map((i) => `<option value="${i.id}">${i.name}</option>`)
    .join("");

  el.innerHTML = `
    <h1>Ciência e Fé — Instrumentos Bíblicos (AR)</h1>

    <div style="margin:14px 0; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
      <label for="instrument" style="opacity:.9;">Instrumento:</label>
      <select id="instrument" style="padding:8px 10px; border-radius:8px;">
        ${options}
      </select>
    </div>

    <p>Escolha o modo:</p>

    <div style="display:flex; gap:12px; flex-wrap:wrap;">
      <div style="display:flex; flex-direction:column; gap:6px;">
        <button id="btn-image">Image Tracking</button>
        <small id="status-image" style="min-height:16px; opacity:.8;"></small>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <button id="btn-world">World Tracking (protótipo)</button>
        <small id="status-world" style="min-height:16px; opacity:.8;"></small>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <button id="btn-diag">Diagnostics</button>
        <small style="min-height:16px; opacity:.6;">Ajuda para câmera</small>
      </div>
    </div>
  `;

  const select = el.querySelector<HTMLSelectElement>("#instrument")!;
  select.value = store.selectedInstrumentId;

  select.onchange = () => {
    const selected = instruments.find((i) => i.id === select.value);
    if (selected) store.selectedInstrumentId = selected.id;
  };

  const btnImage = el.querySelector<HTMLButtonElement>("#btn-image")!;
  const btnWorld = el.querySelector<HTMLButtonElement>("#btn-world")!;
  const statusImage = el.querySelector<HTMLElement>("#status-image")!;
  const statusWorld = el.querySelector<HTMLElement>("#status-world")!;

  const setAvailability = (
    button: HTMLButtonElement,
    statusEl: HTMLElement,
    availability: Availability
  ) => {
    if (availability.available) {
      button.disabled = false;
      statusEl.textContent = "";
    } else {
      button.disabled = true;
      statusEl.textContent = availability.reason ?? "Indisponível";
    }
  };

  statusImage.textContent = "Verificando...";
  statusWorld.textContent = "Verificando...";

  void (async () => {
    const imageMode = createImageMode();
    const worldMode = createWorldMode();

    const [imageAvailability, worldAvailability] = await Promise.all([
      imageMode.getAvailability(),
      worldMode.getAvailability(),
    ]);

    setAvailability(btnImage, statusImage, imageAvailability);
    setAvailability(btnWorld, statusWorld, worldAvailability);
  })();

  btnImage.onclick = () => {
    store.selectedMode = "image";
    goTo("viewer");
  };

  btnWorld.onclick = () => {
    store.selectedMode = "world";
    goTo("viewer");
  };

  el.querySelector<HTMLButtonElement>("#btn-diag")!.onclick = () => goTo("diagnostics");

  root.appendChild(el);
}
