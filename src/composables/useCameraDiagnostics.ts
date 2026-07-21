import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from "vue";
import {
  createCameraOptions,
  enumerateMediaDevices,
  normalizeCameraDeviceId,
  requestCameraStream,
  type CameraOption,
} from "../lib/cameraDevices";
import { readCameraPreference, saveCameraPreference } from "../lib/cameraPreference";

export function useCameraDiagnostics() {
  let requestVersion = 0;
  const videoElement = ref<HTMLVideoElement | null>(null);
  const stream = shallowRef<MediaStream | null>(null);
  const permission = ref("unknown");
  const devices = ref("Carregando...");
  const cameras = ref<CameraOption[]>([]);
  const selectedCameraId = ref(readCameraPreference());
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
      const mediaDevices = await enumerateMediaDevices();
      if (!mediaDevices) {
        cameras.value = [];
        return "enumerateDevices: unsupported";
      }

      if (!mediaDevices.length) {
        cameras.value = [];
        return "(nenhum dispositivo retornado)";
      }

      const availableCameras = createCameraOptions(mediaDevices);

      cameras.value = availableCameras;

      const normalizedCameraId = normalizeCameraDeviceId(selectedCameraId.value, availableCameras);
      if (normalizedCameraId !== selectedCameraId.value) {
        selectedCameraId.value = normalizedCameraId;
        saveCameraPreference("");
      }

      return mediaDevices
        .map(
          (device) =>
            `${device.kind} | ${device.label || "(sem identificação)"} | ${device.deviceId.slice(0, 6)}...`
        )
        .join("\n");
    } catch (error) {
      cameras.value = [];
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

      const selectedDeviceId = selectedCameraId.value;
      const { stream: requestedStream, preferredDeviceUnavailable } = await requestCameraStream({
        deviceId: selectedDeviceId || undefined,
        retryAutomaticWithAnyCamera: true,
        shouldRetry: () => currentRequest === requestVersion,
      });

      if (currentRequest !== requestVersion) {
        requestedStream.getTracks().forEach((track) => track.stop());
        return;
      }

      if (preferredDeviceUnavailable) {
        selectedCameraId.value = "";
        saveCameraPreference("");
      }

      stream.value = requestedStream;
      if (videoElement.value) videoElement.value.srcObject = requestedStream;
      addLog("câmera iniciada");
    } catch (error) {
      if (currentRequest !== requestVersion) return;
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
    saveCameraPreference(selectedCameraId.value);
    if (!isActive.value) return;

    addLog("alternando câmera");
    await startCamera();
  }

  onMounted(() => {
    addLog("configuração da câmera aberta");
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
