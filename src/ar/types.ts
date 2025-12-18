export type ArModeId = "image" | "world";

export type Availability = { available: boolean; reason?: string };

export interface ArMode {
  id: ArModeId;
  label: string;
  getAvailability(): Promise<Availability>;
  init(container: HTMLElement): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  destroy(): Promise<void>;
}