const CAMERA_PREFERENCE_STORAGE_KEY = "instrumentos-biblicos:camera-preference";

export function readCameraPreference(): string {
  try {
    return localStorage.getItem(CAMERA_PREFERENCE_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveCameraPreference(deviceId: string): void {
  try {
    if (deviceId) {
      localStorage.setItem(CAMERA_PREFERENCE_STORAGE_KEY, deviceId);
      return;
    }

    localStorage.removeItem(CAMERA_PREFERENCE_STORAGE_KEY);
  } catch {
    // A preferência é opcional quando o armazenamento do navegador está indisponível.
  }
}
