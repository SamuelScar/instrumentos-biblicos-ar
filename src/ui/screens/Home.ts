import { goTo } from "../../app/routes";
import { store } from "../../app/store";
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
      <button id="btn-image">Image Tracking</button>
      <button id="btn-world">World Tracking (protótipo)</button>
      <button id="btn-diag">Diagnostics</button>
    </div>
  `;

  const select = el.querySelector<HTMLSelectElement>("#instrument")!;
  select.value = store.selectedInstrumentId;

  select.onchange = () => {
    store.selectedInstrumentId = select.value as any;
  };

  el.querySelector<HTMLButtonElement>("#btn-image")!.onclick = () => {
    store.selectedMode = "image";
    goTo("viewer");
  };

  el.querySelector<HTMLButtonElement>("#btn-world")!.onclick = () => {
    store.selectedMode = "world";
    goTo("viewer");
  };

  el.querySelector<HTMLButtonElement>("#btn-diag")!.onclick = () => goTo("diagnostics");

  root.appendChild(el);
}
