import { goTo } from "../../app/routes";

let stream: MediaStream | null = null;

async function stopCamera(video?: HTMLVideoElement) {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
  if (video) {
    video.srcObject = null;
  }
}

export function renderDiagnostics(root: HTMLElement) {
  const el = document.createElement("div");

  el.innerHTML = `
    <div style="display:flex; gap:12px; align-items:center;">
      <button id="btn-back">Voltar</button>
      <strong>Diagnostics</strong>
    </div>

    <div style="margin-top:12px; display:flex; gap:12px; flex-wrap:wrap;">
      <button id="btn-start">Testar câmera</button>
      <button id="btn-stop" disabled>Parar câmera</button>
    </div>

    <pre id="info" style="margin-top:12px; background:#f6f6f6; padding:12px; border-radius:8px; overflow:auto;"></pre>

    <div style="margin-top:12px; border:1px solid #ccc; border-radius:8px; overflow:hidden; max-width:520px;">
      <video id="video" playsinline muted autoplay style="width:100%; height:auto; display:block;"></video>
    </div>
  `;

  const info = el.querySelector<HTMLElement>("#info")!;
  const video = el.querySelector<HTMLVideoElement>("#video")!;
  const btnStart = el.querySelector<HTMLButtonElement>("#btn-start")!;
  const btnStop = el.querySelector<HTMLButtonElement>("#btn-stop")!;

  const setInfo = (text: string) => {
    info.textContent = text;
  };

  const refreshInfo = () => {
    setInfo(
      [
        `userAgent: ${navigator.userAgent}`,
        `https: ${location.protocol === "https:"}`,
        `getUserMedia: ${!!navigator.mediaDevices?.getUserMedia}`,
        `streamActive: ${!!stream}`,
      ].join("\n")
    );
  };

  el.querySelector<HTMLButtonElement>("#btn-back")!.onclick = async () => {
    await stopCamera(video);
    goTo("home");
  };

  btnStart.onclick = async () => {
    try {
      await stopCamera(video);

      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      video.srcObject = stream;

      btnStop.disabled = false;
      refreshInfo();
    } catch (err) {
      btnStop.disabled = true;
      refreshInfo();
      setInfo(`${info.textContent}\n\nERROR: ${(err as Error)?.message ?? String(err)}`);
    }
  };

  btnStop.onclick = async () => {
    await stopCamera(video);
    btnStop.disabled = true;
    refreshInfo();
  };

  refreshInfo();
  root.appendChild(el);
}