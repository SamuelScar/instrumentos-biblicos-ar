import * as THREE from "three";
import type { ArMode, Availability } from "../../types";
import { MindARThree, type MindARImageAnchor } from "mind-ar/dist/mindar-image-three.prod.js";
import { store } from "../../../app/store";
import { instruments } from "../../../domain/instruments";

const TARGET_FILE = "/targets.mind";
const OVERLAY_IDLE = "Aponte para o marcador";

type State = {
  container: HTMLElement | null;
  mindar: MindARThree | null;
  overlay: HTMLElement | null;
  anchor: MindARImageAnchor | null;
};

function resolveInstrument() {
  return instruments.find((i) => i.id === store.selectedInstrumentId) ?? instruments[0];
}

function cleanupMindarUI() {
  document.querySelectorAll(".mindar-ui-overlay").forEach((node) => node.remove());
}

async function checkTargetFile(): Promise<boolean> {
  try {
    const head = await fetch(TARGET_FILE, { method: "HEAD" });
    if (head.ok) return true;
    if (head.status === 405 || head.status === 403) {
      const getRes = await fetch(TARGET_FILE);
      return getRes.ok;
    }
    return false;
  } catch {
    return false;
  }
}

function createOverlay(container: HTMLElement, text: string) {
  const el = document.createElement("div");
  el.style.position = "absolute";
  el.style.left = "12px";
  el.style.top = "12px";
  el.style.padding = "8px 10px";
  el.style.borderRadius = "8px";
  el.style.background = "rgba(0,0,0,.55)";
  el.style.color = "#fff";
  el.style.fontSize = "14px";
  el.style.pointerEvents = "none";
  el.textContent = text;
  container.appendChild(el);
  return el;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    const width = ctx.measureText(test).width;
    if (width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line) lines.push(line);

  lines.slice(0, maxLines).forEach((l, index) => {
    ctx.fillText(l, x, y + index * lineHeight);
  });
}

function createInstrumentSprite() {
  const instrument = resolveInstrument();
  const ref = instrument.bibleRefs[0];
  const verse = ref.verse ? `:${ref.verse}` : "";

  const width = 640;
  const height = 320;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponível");

  ctx.fillStyle = "rgba(0,0,0,0.68)";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 2;
  ctx.strokeRect(6, 6, width - 12, height - 12);

  ctx.fillStyle = "#fff";
  ctx.textBaseline = "top";
  ctx.font = "bold 36px sans-serif";
  ctx.fillText(instrument.name, 28, 28);

  ctx.font = "24px sans-serif";
  wrapText(ctx, instrument.shortDescription, 28, 88, width - 56, 30, 3);

  ctx.font = "20px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText(`Ref: ${ref.book} ${ref.chapter}${verse}`, 28, height - 54);

  const texture = new THREE.CanvasTexture(canvas);
  const threeCompat = THREE as unknown as {
    SRGBColorSpace?: unknown;
    sRGBEncoding?: number;
  };
  const textureCompat = texture as unknown as {
    colorSpace?: unknown;
    encoding?: number;
  };

  if (threeCompat.SRGBColorSpace !== undefined && "colorSpace" in textureCompat) {
    textureCompat.colorSpace = threeCompat.SRGBColorSpace;
  } else if (threeCompat.sRGBEncoding !== undefined) {
    textureCompat.encoding = threeCompat.sRGBEncoding;
  }

  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.6, 0.8, 1);
  sprite.position.set(0, 0.4, 0);
  return sprite;
}

export function createImageMode(): ArMode {
  const state: State = {
    container: null,
    mindar: null,
    overlay: null,
    anchor: null,
  };

  const getAvailability = async (): Promise<Availability> => {
    if (location.protocol !== "https:" && location.hostname !== "localhost") {
      return { available: false, reason: "HTTPS obrigatório para usar a câmera" };
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      return { available: false, reason: "getUserMedia indisponível" };
    }
    if (!window.WebGLRenderingContext) {
      return { available: false, reason: "WebGL indisponível" };
    }

    const targetsOk = await checkTargetFile();
    if (!targetsOk) {
      return { available: false, reason: `Arquivo de marcadores não encontrado: ${TARGET_FILE}` };
    }

    return { available: true };
  };

  return {
    id: "image",
    label: "Image Tracking",
    getAvailability,

    async init(container) {
      state.container = container;
      container.innerHTML = "";
      container.style.position = "relative";

      cleanupMindarUI();
      state.overlay = createOverlay(container, OVERLAY_IDLE);

      const instrument = resolveInstrument();
      const mindar = new MindARThree({
        container,
        imageTargetSrc: TARGET_FILE,
        uiLoading: "no",
        uiScanning: "no",
        uiError: "no",
      });

      state.mindar = mindar;
      const { renderer, scene } = mindar;

      renderer.setClearColor(0x000000, 0);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));

      const anchor = mindar.addAnchor(instrument.assets.targetIndex);
      anchor.group.add(createInstrumentSprite());

      anchor.onTargetFound = () => {
        if (state.overlay) state.overlay.textContent = `${instrument.name} detectado`;
      };

      anchor.onTargetLost = () => {
        if (state.overlay) state.overlay.textContent = OVERLAY_IDLE;
      };

      state.anchor = anchor;
    },

    async start() {
      if (!state.mindar) return;
      await state.mindar.start();

      const { renderer, scene, camera } = state.mindar;
      renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      });
    },

    async stop() {
      if (!state.mindar) return;
      state.mindar.renderer.setAnimationLoop(null);
      await Promise.resolve(state.mindar.stop());
    },

    async destroy() {
      if (state.mindar) {
        state.mindar.renderer.setAnimationLoop(null);
        state.mindar.dispose();
      }

      cleanupMindarUI();
      if (state.container) state.container.innerHTML = "";
      state.container = null;
      state.mindar = null;
      state.overlay = null;
      state.anchor = null;
    },
  };
}
