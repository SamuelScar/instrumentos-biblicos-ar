import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";

export function useCameraDiagnostics() {
  let requestVersion = 0;
  const videoElement = ref<HTMLVideoElement | null>(null);
  const stream = shallowRef<MediaStream | null>(null);
  const permission = ref("unknown");
  const devices = ref("Carregando...");
  const logs = ref<string[]>([]);

  const isActive = computed(() => stream.value !== null);
  const logsText = computed(() => logs.value.join("\n"));
  const diagnosticsText = computed(() =>
    [
      `userAgent: ${navigator.userAgent}`,
      `https: ${location.protocol === "https:"}`,
      `cameraPermission: ${permission.value}`,
      `getUserMedia: ${!!navigator.mediaDevices?.getUserMedia}`,
      `streamActive: ${isActive.value}`,
    ].join("\n")
  );

  function addLog(message: string) {
    logs.value = [`[${new Date().toLocaleTimeString()}] ${message}`, ...logs.value].slice(0, 40);
  }

  function stopCamera() {
    requestVersion += 1;
    stream.value?.getTracks().forEach((track) => track.stop());
    stream.value = null;
    if (videoElement.value) videoElement.value.srcObject = null;
  }

  async function readPermission() {
    try {
      if (!navigator.permissions?.query) return "unsupported";
      const result = await navigator.permissions.query({ name: "camera" } as PermissionDescriptor);
      return result.state;
    } catch {
      return "unknown";
    }
  }

  async function readDevices() {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return "enumerateDevices: unsupported";
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      if (!mediaDevices.length) return "(nenhum dispositivo retornado)";

      return mediaDevices
        .map(
          (device) =>
            `${device.kind} | ${device.label || "(sem identificação)"} | ${device.deviceId.slice(0, 6)}...`
        )
        .join("\n");
    } catch (error) {
      return `erro: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  async function refresh() {
    const [permissionState, mediaDevices] = await Promise.all([readPermission(), readDevices()]);
    permission.value = permissionState;
    devices.value = mediaDevices;
  }

  async function startCamera() {
    addLog("iniciando câmera");
    stopCamera();
    const currentRequest = ++requestVersion;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("getUserMedia não está disponível neste navegador");
      }

      let requestedStream: MediaStream;

      try {
        requestedStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch {
        if (currentRequest !== requestVersion) return;
        requestedStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      if (currentRequest !== requestVersion) {
        requestedStream.getTracks().forEach((track) => track.stop());
        return;
      }

      stream.value = requestedStream;
      if (videoElement.value) videoElement.value.srcObject = requestedStream;
      addLog("câmera iniciada");
    } catch (error) {
      addLog(`ERRO: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      if (currentRequest === requestVersion) await refresh();
    }
  }

  async function stopAndRefresh() {
    addLog("câmera interrompida");
    stopCamera();
    await refresh();
  }

  onMounted(() => {
    addLog("diagnóstico aberto");
    void refresh();
  });
  onBeforeUnmount(stopCamera);

  return {
    videoElement,
    devices,
    diagnosticsText,
    isActive,
    logsText,
    startCamera,
    stopCamera: stopAndRefresh,
  };
}
