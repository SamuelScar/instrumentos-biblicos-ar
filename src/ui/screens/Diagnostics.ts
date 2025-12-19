import { goTo } from "../../app/routes";

let stream: MediaStream | null = null;

function stopCamera(video?: HTMLVideoElement) {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
  if (video) video.srcObject = null;
}

async function getCameraPermissionState(): Promise<string> {
  try {
    const perms = (navigator as Navigator & { permissions?: Permissions }).permissions;
    if (!perms?.query) return "unsupported";
    const res = await perms.query({ name: "camera" });
    return res?.state ?? "unknown";
  } catch {
    return "unknown";
  }
}

async function listMediaDevices(): Promise<string> {
  try {
    const md = navigator.mediaDevices;
    if (!md?.enumerateDevices) return "enumerateDevices: unsupported";

    const devices = await md.enumerateDevices();
    if (!devices.length) return "(nenhum device retornado)";

    return devices
      .map((d) => `${d.kind} | ${d.label || "(sem label)"} | ${d.deviceId.slice(0, 6)}...`)
      .join("\n");
  } catch (e) {
    return `erro: ${(e as Error)?.message ?? String(e)}`;
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

    <details style="margin-top:12px;">
      <summary><b>Media Devices</b></summary>
      <pre id="devices" style="margin-top:8px; background:#f6f6f6; padding:12px; border-radius:8px; overflow:auto;"></pre>
    </details>

    <details style="margin-top:12px;">
      <summary><b>Logs</b></summary>
      <pre id="logs" style="margin-top:8px; background:#111; color:#ddd; padding:12px; border-radius:8px; overflow:auto;"></pre>
    </details>

    <div style="margin-top:12px; border:1px solid #ccc; border-radius:8px; overflow:hidden; max-width:520px;">
      <video id="video" playsinline muted autoplay style="width:100%; height:auto; display:block;"></video>
    </div>
  `;

  const info = el.querySelector<HTMLElement>("#info")!;
  const devicesPre = el.querySelector<HTMLElement>("#devices")!;
  const logsPre = el.querySelector<HTMLElement>("#logs")!;
  const video = el.querySelector<HTMLVideoElement>("#video")!;
  const btnStart = el.querySelector<HTMLButtonElement>("#btn-start")!;
  const btnStop = el.querySelector<HTMLButtonElement>("#btn-stop")!;

  const logs: string[] = [];
  const log = (msg: string) => {
    logs.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
    logsPre.textContent = logs.slice(0, 40).join("\n");
  };

  const setInfo = (text: string) => {
    info.textContent = text;
  };

  const refreshInfo = async () => {
    const permission = await getCameraPermissionState();
    setInfo(
      [
        `userAgent: ${navigator.userAgent}`,
        `https: ${location.protocol === "https:"}`,
        `hash: ${location.hash || "(vazio)"}`,
        `cameraPermission: ${permission}`,
        `getUserMedia: ${!!navigator.mediaDevices?.getUserMedia}`,
        `streamActive: ${!!stream}`,
      ].join("\n")
    );

    devicesPre.textContent = await listMediaDevices();
  };

  el.querySelector<HTMLButtonElement>("#btn-back")!.onclick = () => {
    log("back");
    stopCamera(video);
    goTo("home");
  };

  btnStart.onclick = async () => {
    try {
      log("start camera");
      stopCamera(video);

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch {
        // fallback pro desktop
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      video.srcObject = stream;

      btnStop.disabled = false;
      await refreshInfo();
    } catch (err) {
      btnStop.disabled = true;
      log(`ERROR: ${(err as Error)?.message ?? String(err)}`);
      await refreshInfo();
    }
  };

  btnStop.onclick = async () => {
    log("stop camera");
    stopCamera(video);
    btnStop.disabled = true;
    await refreshInfo();
  };

  root.replaceChildren(el);
  log("open diagnostics");
  void refreshInfo();
}
