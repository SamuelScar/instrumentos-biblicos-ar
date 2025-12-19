import { goTo } from "../../app/routes";
import { store } from "../../app/store";
import type { ArMode, Availability } from "../../ar/types";
import { createImageMode } from "../../ar/modes/image/mode";
import { createWorldMode } from "../../ar/modes/world/mode";

export async function renderViewer(root: HTMLElement) {
  let currentMode: ArMode | null = null;

  const createMode = (): ArMode =>
    store.selectedMode === "world" ? createWorldMode() : createImageMode();
  const modeLabel = createMode().label;

  const safeStop = async () => {
    if (!currentMode) return;
    try {
      await currentMode.stop();
    } finally {
      await currentMode.destroy();
      currentMode = null;
    }
  };

  const el = document.createElement("div");
  el.innerHTML = `
    <div style="display:flex; gap:12px; align-items:center;">
      <button id="btn-back">Voltar</button>
      <strong>Viewer - ${modeLabel}</strong>
    </div>

    <div id="ar-root" style="margin-top:12px; border:1px solid #ccc; height:70vh; border-radius:8px; overflow:hidden;">
      <div style="padding:12px;">Inicializando...</div>
    </div>
  `;

  el.querySelector<HTMLButtonElement>("#btn-back")!.onclick = async () => {
    try {
      await safeStop();
    } catch {
      // ignore stop errors to keep navigation responsive
    } finally {
      goTo("home");
    }
  };

  root.appendChild(el);

  const arRoot = el.querySelector<HTMLElement>("#ar-root")!;

  const renderAvailabilityError = (availability: Availability) => {
    arRoot.innerHTML = `<div style="padding:12px;">Indisponível: ${
      availability.reason ?? "motivo desconhecido"
    }</div>`;
  };

  const renderCameraError = (err: unknown) => {
    const error = err as Error;
    const domError = err instanceof DOMException ? err : null;
    const isPermissionDenied =
      domError?.name === "NotAllowedError" ||
      domError?.name === "SecurityError" ||
      domError?.name === "PermissionDeniedError";
    const isNotFound = domError?.name === "NotFoundError";
    const isInsecure = location.protocol !== "https:" && location.hostname !== "localhost";

    let title = "Erro ao acessar a câmera";
    let hint = "Verifique as permissões do navegador e tente novamente.";

    if (isPermissionDenied) {
      title = "Câmera bloqueada";
      hint =
        "Clique no ícone de câmera na barra de endereço e permita o acesso, depois tente novamente.";
    } else if (isNotFound) {
      title = "Nenhuma câmera encontrada";
      hint = "Conecte ou habilite uma câmera e tente novamente.";
    } else if (isInsecure) {
      hint = "Este navegador exige HTTPS para usar a câmera. Use https:// ou localhost.";
    }

    const detail = error?.message ? `Detalhe: ${error.message}` : "";

    arRoot.innerHTML = `
      <div style="padding:16px; display:flex; flex-direction:column; gap:10px;">
        <strong>${title}</strong>
        <div>${hint}</div>
        <div style="opacity:.8; font-size:12px;">${detail}</div>
        <div style="margin-top:6px;">
          <button id="btn-retry">Tentar novamente</button>
        </div>
      </div>
    `;

    arRoot.querySelector<HTMLButtonElement>("#btn-retry")!.onclick = () => {
      void startMode();
    };
  };

  const startMode = async () => {
    await safeStop();
    const mode = createMode();
    const availability = await mode.getAvailability();

    if (!availability.available) {
      renderAvailabilityError(availability);
      return;
    }

    currentMode = mode;
    try {
      await currentMode.init(arRoot);
      await currentMode.start();
    } catch (err) {
      await safeStop();
      renderCameraError(err);
    }
  };

  await startMode();

  return safeStop;
}
