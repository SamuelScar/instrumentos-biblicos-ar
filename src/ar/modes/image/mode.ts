import type { ArMode, Availability } from "../../types";

type State = {
  stream: MediaStream | null;
  video: HTMLVideoElement | null;
  container: HTMLElement | null;
};

export function createImageMode(): ArMode {
  const state: State = {
    stream: null,
    video: null,
    container: null,
  };

  async function stopCamera() {
    if (state.stream) {
      state.stream.getTracks().forEach((t) => t.stop());
      state.stream = null;
    }
    if (state.video) {
      state.video.srcObject = null;
    }
  }

  const getAvailability = async (): Promise<Availability> => {
    const ok = !!navigator.mediaDevices?.getUserMedia;
    return ok ? { available: true } : { available: false, reason: "getUserMedia indisponível" };
  };

  return {
    id: "image",
    label: "Image Tracking",
    getAvailability,

    async init(container) {
      state.container = container;

      container.innerHTML = `
        <div style="height:100%; position:relative;">
          <video id="ar-video" playsinline muted autoplay
                 style="width:100%; height:100%; object-fit:cover; display:block;"></video>

          <div style="position:absolute; left:12px; top:12px; background:rgba(0,0,0,.55); color:#fff; padding:8px 10px; border-radius:8px; font-size:14px;">
            Camera ativa (stub Image Tracking)
          </div>
        </div>
      `;

      state.video = container.querySelector<HTMLVideoElement>("#ar-video")!;

      state.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      state.video.srcObject = state.stream;
    },

    async start() {
      // depois: iniciar tracking da biblioteca aqui
    },

    async stop() {
      await stopCamera();
    },

    async destroy() {
      await stopCamera();
      if (state.container) state.container.innerHTML = "";
      state.video = null;
      state.container = null;
    },
  };
}