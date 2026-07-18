import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";

type CameraOption = {
  deviceId: string;
  label: string;
};

export function useCameraDiagnostics() {
  let requestVersion = 0;
  const videoElement = ref<HTMLVideoElement | null>(null);
  const stream = shallowRef<MediaStream | null>(null);
  const permission = ref("unknown");
  const devices = ref("Carregando...");
  const cameras = ref<CameraOption[]>([]);
  const selectedCameraId = ref("");
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
      if (!navigator.mediaDevices?.enumerateDevices) {
        cameras.value = [];
        selectedCameraId.value = "";
        return "enumerateDevices: unsupported";
      }

      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      if (!mediaDevices.length) {
        cameras.value = [];
        selectedCameraId.value = "";
        return "(nenhum dispositivo retornado)";
      }

      const availableCameras = mediaDevices
        .filter((device) => device.kind === "videoinput")
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Câmera ${index + 1}`,
        }));

      cameras.value = availableCameras;

      if (
        selectedCameraId.value &&
        !availableCameras.some((camera) => camera.deviceId === selectedCameraId.value)
      ) {
        selectedCameraId.value = "";
      }

      return mediaDevices
        .map(
          (device) =>
            `${device.kind} | ${device.label || "(sem identificação)"} | ${device.deviceId.slice(0, 6)}...`
        )
        .join("\n");
    } catch (error) {
      cameras.value = [];
      selectedCameraId.value = "";
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
      const selectedDeviceId = selectedCameraId.value;

      try {
        requestedStream = await navigator.mediaDevices.getUserMedia({
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId } }
            : { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch (error) {
        if (currentRequest !== requestVersion) return;
        if (selectedDeviceId) throw error;
        requestedStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      if (currentRequest !== requestVersion) {
        requestedStream.getTracks().forEach((track) => track.stop());
        return;
      }

      stream.value = requestedStream;
      selectedCameraId.value =
        requestedStream.getVideoTracks()[0]?.getSettings().deviceId ?? selectedCameraId.value;
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

  async function changeCamera() {
    if (!isActive.value) return;

    addLog("alternando câmera");
    await startCamera();
  }

  onMounted(() => {
    addLog("diagnóstico aberto");
    void refresh();
  });
  onBeforeUnmount(stopCamera);

  return {
    videoElement,
    cameras,
    devices,
    diagnosticsText,
    isActive,
    logsText,
    selectedCameraId,
    changeCamera,
    startCamera,
    stopCamera: stopAndRefresh,
  };
}
