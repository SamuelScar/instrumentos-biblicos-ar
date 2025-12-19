declare module "mind-ar/dist/mindar-image-three.prod.js" {
  import type { Group, PerspectiveCamera, Scene, WebGLRenderer } from "three";

  export type MindARImageAnchor = {
    group: Group;
    onTargetFound?: () => void;
    onTargetLost?: () => void;
  };

  export type MindARImageConfig = {
    container: HTMLElement;
    imageTargetSrc: string;
    maxTrack?: number;
    uiLoading?: string;
    uiScanning?: string;
    uiError?: string;
  };

  export class MindARThree {
    constructor(config: MindARImageConfig);
    renderer: WebGLRenderer;
    scene: Scene;
    camera: PerspectiveCamera;
    start(): Promise<void>;
    stop(): Promise<void> | void;
    dispose(): void;
    addAnchor(index: number): MindARImageAnchor;
  }
}
