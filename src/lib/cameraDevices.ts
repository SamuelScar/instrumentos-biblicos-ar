export type CameraOption = {
  deviceId: string;
  label: string;
};

type CameraMediaDevices = Pick<MediaDevices, "enumerateDevices" | "getUserMedia">;

type CameraRequestOptions = {
  deviceId?: string;
  retryAutomaticWithAnyCamera?: boolean;
  shouldRetry?: () => boolean;
};

export type CameraRequestResult = {
  stream: MediaStream;
  preferredDeviceUnavailable: boolean;
};

function getBrowserMediaDevices(): CameraMediaDevices | undefined {
  return navigator.mediaDevices;
}

export function isCameraUnavailableError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "NotFoundError" || error.name === "OverconstrainedError")
  );
}

export function createCameraOptions(devices: readonly MediaDeviceInfo[]): CameraOption[] {
  return devices
    .filter((device) => device.kind === "videoinput" && device.deviceId)
    .map((device, index) => ({
      deviceId: device.deviceId,
      label: device.label || `Câmera ${index + 1}`,
    }));
}

export function normalizeCameraDeviceId(
  deviceId: string,
  cameras: readonly CameraOption[]
): string {
  if (!deviceId || cameras.length === 0) return deviceId;
  return cameras.some((camera) => camera.deviceId === deviceId) ? deviceId : "";
}

export async function enumerateMediaDevices(
  mediaDevices = getBrowserMediaDevices()
): Promise<MediaDeviceInfo[] | null> {
  if (!mediaDevices?.enumerateDevices) return null;
  return mediaDevices.enumerateDevices();
}

export async function requestCameraStream(
  options: CameraRequestOptions = {},
  mediaDevices = getBrowserMediaDevices()
): Promise<CameraRequestResult> {
  if (!mediaDevices?.getUserMedia) {
    throw new Error("A câmera não está disponível neste navegador.");
  }

  if (options.deviceId) {
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: false,
        video: { deviceId: { exact: options.deviceId } },
      });
      return { stream, preferredDeviceUnavailable: false };
    } catch (error) {
      if (!isCameraUnavailableError(error) || options.shouldRetry?.() === false) throw error;

      const stream = await mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      return { stream, preferredDeviceUnavailable: true };
    }
  }

  try {
    const stream = await mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: "environment" } },
    });
    return { stream, preferredDeviceUnavailable: false };
  } catch (error) {
    if (!options.retryAutomaticWithAnyCamera || options.shouldRetry?.() === false) throw error;

    const stream = await mediaDevices.getUserMedia({ video: true, audio: false });
    return { stream, preferredDeviceUnavailable: false };
  }
}
