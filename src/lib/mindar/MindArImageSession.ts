import {
  Group,
  Matrix4,
  PerspectiveCamera,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";

const MINDAR_CORE_URL = "/vendor/mindar/1.2.5/mindar-image.prod.js";
const TRACKING_FILTER_MIN_CUTOFF = 0.0001;
const TRACKING_FILTER_SPEED_COEFFICIENT = 10;
const DEFAULT_TRACKING_MISS_TOLERANCE = 5;
const POSITION_DAMPING = 8;
const ROTATION_DAMPING = 7;
const SCALE_DAMPING = 8;
const MAX_FRAME_DELTA_SECONDS = 0.1;

type ImageTargetDimensions = [number, number];

type MindArUpdate = {
  type: string;
  targetIndex?: number;
  worldMatrix?: ArrayLike<number> | null;
};

type MindArControllerOptions = {
  inputWidth: number;
  inputHeight: number;
  maxTrack: number;
  filterMinCF: number;
  filterBeta: number;
  missTolerance: number;
  onUpdate: (update: MindArUpdate) => void;
};

type MindArController = {
  inputWidth: number;
  inputHeight: number;
  interestedTargetIndex: number;
  addImageTargetsFromBuffer: (buffer: ArrayBuffer) => {
    dimensions: ImageTargetDimensions[];
  };
  dispose: () => void;
  dummyRun: (video: HTMLVideoElement) => Promise<void> | void;
  getProjectionMatrix: () => number[];
  processVideo: (video: HTMLVideoElement) => void;
  stopProcessVideo: () => void;
};

type MindArCoreModule = {
  Controller: new (options: MindArControllerOptions) => MindArController;
};

type MindArGlobalWindow = Window & {
  MINDAR?: {
    IMAGE?: MindArCoreModule;
  };
};

let mindArCoreTask: Promise<MindArCoreModule> | null = null;

function loadMindArCore(): Promise<MindArCoreModule> {
  const globalWindow = window as MindArGlobalWindow;
  const loadedCore = globalWindow.MINDAR?.IMAGE;

  if (loadedCore?.Controller) return Promise.resolve(loadedCore);
  if (mindArCoreTask) return mindArCoreTask;

  mindArCoreTask = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = MINDAR_CORE_URL;
    script.dataset.mindArCore = "1.2.5";

    script.addEventListener(
      "load",
      () => {
        const core = globalWindow.MINDAR?.IMAGE;

        if (!core?.Controller) {
          mindArCoreTask = null;
          script.remove();
          reject(new Error("O núcleo do MindAR foi carregado sem expor o Controller."));
          return;
        }

        resolve(core);
      },
      { once: true }
    );

    script.addEventListener(
      "error",
      () => {
        mindArCoreTask = null;
        script.remove();
        reject(new Error("Não foi possível carregar o núcleo do MindAR."));
      },
      { once: true }
    );

    document.head.appendChild(script);
  });

  return mindArCoreTask;
}

export interface MindArImageSessionOptions {
  container: HTMLElement;
  targetUrl: string;
  targetIndex?: number;
  missTolerance?: number;
  deviceId?: string;
  onTargetFound?: () => void;
  onTargetLost?: () => void;
  onTargetUpdate?: () => void;
}

export class MindArImageSession {
  readonly renderer: WebGLRenderer;
  readonly camera: PerspectiveCamera;
  readonly scene: Scene;
  readonly anchor: Group;
  readonly video: HTMLVideoElement;

  private readonly container: HTMLElement;
  private readonly targetUrl: string;
  private readonly targetIndex: number;
  private readonly missTolerance: number;
  private readonly deviceId?: string;
  private readonly onTargetFound?: () => void;
  private readonly onTargetLost?: () => void;
  private readonly onTargetUpdate?: () => void;
  private readonly originalContainerPosition: string;
  private readonly changedContainerPosition: boolean;
  private readonly resizeListener = () => this.resize();

  private controller: MindArController | null = null;
  private mediaStream: MediaStream | null = null;
  private postMatrix: Matrix4 | null = null;
  private readonly targetPosition = new Vector3();
  private readonly targetQuaternion = new Quaternion();
  private readonly targetScale = new Vector3(1, 1, 1);
  private startTask: Promise<void> | null = null;
  private startAbortController: AbortController | null = null;
  private operationToken = 0;
  private resizeListenerAttached = false;
  private running = false;
  private targetVisible = false;
  private poseInitialized = false;
  private disposed = false;

  constructor(options: MindArImageSessionOptions) {
    this.container = options.container;
    this.targetUrl = options.targetUrl;
    this.targetIndex = options.targetIndex ?? 0;
    this.missTolerance = options.missTolerance ?? DEFAULT_TRACKING_MISS_TOLERANCE;
    this.deviceId = options.deviceId;
    this.onTargetFound = options.onTargetFound;
    this.onTargetLost = options.onTargetLost;
    this.onTargetUpdate = options.onTargetUpdate;

    if (!Number.isInteger(this.targetIndex) || this.targetIndex < 0) {
      throw new Error("O índice do alvo do MindAR deve ser um inteiro não negativo.");
    }

    if (!Number.isInteger(this.missTolerance) || this.missTolerance < 0) {
      throw new Error("A tolerância de perda do MindAR deve ser um inteiro não negativo.");
    }

    this.originalContainerPosition = this.container.style.position;
    this.changedContainerPosition = getComputedStyle(this.container).position === "static";
    if (this.changedContainerPosition) this.container.style.position = "relative";

    this.scene = new Scene();
    this.camera = new PerspectiveCamera();
    this.anchor = new Group();
    this.anchor.visible = false;
    this.scene.add(this.anchor);

    this.renderer = new WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.configureCanvas();

    this.video = document.createElement("video");
    this.configureVideo();

    this.attachElements();
    this.attachResizeListener();
  }

  get isRunning() {
    return this.running;
  }

  get isTargetVisible() {
    return this.targetVisible;
  }

  updateAnchorPose(deltaSeconds: number) {
    if (!this.targetVisible || !this.poseInitialized) return;

    const delta = Math.min(Math.max(deltaSeconds, 0), MAX_FRAME_DELTA_SECONDS);
    if (delta === 0) return;

    const positionAlpha = 1 - Math.exp(-POSITION_DAMPING * delta);
    const rotationAlpha = 1 - Math.exp(-ROTATION_DAMPING * delta);
    const scaleAlpha = 1 - Math.exp(-SCALE_DAMPING * delta);

    this.anchor.position.lerp(this.targetPosition, positionAlpha);
    this.anchor.quaternion.slerp(this.targetQuaternion, rotationAlpha);
    this.anchor.scale.lerp(this.targetScale, scaleAlpha);
  }

  start(): Promise<void> {
    if (this.disposed) {
      return Promise.reject(new Error("A sessão de RA já foi descartada."));
    }

    if (this.running) return Promise.resolve();
    if (this.startTask) return this.startTask;

    const token = ++this.operationToken;
    const abortController = new AbortController();
    this.startAbortController = abortController;
    this.attachElements();
    this.attachResizeListener();

    this.startTask = this.runStart(token, abortController);
    return this.startTask;
  }

  stop() {
    this.operationToken += 1;
    this.startAbortController?.abort();
    this.startAbortController = null;
    this.startTask = null;

    this.renderer.setAnimationLoop(null);
    this.disposeController(this.controller);
    this.controller = null;

    this.stopMediaStream(this.mediaStream);
    this.mediaStream = null;
    this.video.srcObject = null;

    this.running = false;
    this.targetVisible = false;
    this.poseInitialized = false;
    this.postMatrix = null;
    this.anchor.visible = false;
    this.anchor.position.set(0, 0, 0);
    this.anchor.quaternion.identity();
    this.anchor.scale.set(1, 1, 1);

    this.detachResizeListener();
    this.detachElements();
  }

  dispose() {
    if (this.disposed) return;

    this.disposed = true;
    this.stop();
    this.scene.remove(this.anchor);
    this.renderer.dispose();
    this.renderer.forceContextLoss();

    if (this.changedContainerPosition) {
      this.container.style.position = this.originalContainerPosition;
    }
  }

  resize() {
    if (!this.video.videoWidth || !this.video.videoHeight) return;

    const containerWidth = Math.max(1, this.container.clientWidth);
    const containerHeight = Math.max(1, this.container.clientHeight);
    const containerRatio = containerWidth / containerHeight;
    const videoRatio = this.video.videoWidth / this.video.videoHeight;

    let videoWidth: number;
    let videoHeight: number;

    if (videoRatio > containerRatio) {
      videoHeight = containerHeight;
      videoWidth = videoHeight * videoRatio;
    } else {
      videoWidth = containerWidth;
      videoHeight = videoWidth / videoRatio;
    }

    this.video.style.left = `${-(videoWidth - containerWidth) / 2}px`;
    this.video.style.top = `${-(videoHeight - containerHeight) / 2}px`;
    this.video.style.width = `${videoWidth}px`;
    this.video.style.height = `${videoHeight}px`;

    const canvas = this.renderer.domElement;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    this.renderer.setSize(containerWidth, containerHeight, false);

    if (!this.controller) return;

    const projection = this.controller.getProjectionMatrix();
    const inputRatio = this.controller.inputWidth / this.controller.inputHeight;
    const inputAdjust =
      inputRatio > containerRatio
        ? this.video.width / this.controller.inputWidth
        : this.video.height / this.controller.inputHeight;

    let videoDisplayHeight: number;
    if (inputRatio > containerRatio) {
      videoDisplayHeight = containerHeight * inputAdjust;
    } else {
      const videoDisplayWidth = containerWidth;
      videoDisplayHeight =
        (videoDisplayWidth / this.controller.inputWidth) *
        this.controller.inputHeight *
        inputAdjust;
    }

    const fovAdjust = containerHeight / videoDisplayHeight;
    const fov = (2 * Math.atan((1 / projection[5]) * fovAdjust) * 180) / Math.PI;
    const near = projection[14] / (projection[10] - 1);
    const far = projection[14] / (projection[10] + 1);

    this.camera.fov = fov;
    this.camera.near = near;
    this.camera.far = far;
    this.camera.aspect = containerRatio;
    this.camera.updateProjectionMatrix();
  }

  private async runStart(token: number, abortController: AbortController) {
    try {
      await this.startInternal(token, abortController.signal);
    } finally {
      if (this.operationToken === token) {
        this.startTask = null;
        this.startAbortController = null;
      }
    }
  }

  private async startInternal(token: number, signal: AbortSignal) {
    let localStream: MediaStream | null = null;
    let localController: MindArController | null = null;

    try {
      localStream = await this.requestCamera();
      this.assertActive(token, signal);

      this.mediaStream = localStream;
      this.video.srcObject = localStream;
      await this.waitForVideoMetadata(signal);
      this.assertActive(token, signal);

      this.video.width = this.video.videoWidth;
      this.video.height = this.video.videoHeight;
      await this.video.play();
      this.assertActive(token, signal);

      const mindArModule = await loadMindArCore();
      this.assertActive(token, signal);

      localController = new mindArModule.Controller({
        inputWidth: this.video.videoWidth,
        inputHeight: this.video.videoHeight,
        maxTrack: 1,
        filterMinCF: TRACKING_FILTER_MIN_CUTOFF,
        filterBeta: TRACKING_FILTER_SPEED_COEFFICIENT,
        missTolerance: this.missTolerance,
        onUpdate: (update) => this.handleControllerUpdate(update, localController, token),
      });
      localController.interestedTargetIndex = this.targetIndex;
      this.controller = localController;
      this.resize();

      const targetResponse = await fetch(this.targetUrl, { signal });
      if (!targetResponse.ok) {
        throw new Error(`Não foi possível carregar o alvo do MindAR (${targetResponse.status}).`);
      }
      const targetBuffer = await targetResponse.arrayBuffer();
      this.assertActive(token, signal);

      const { dimensions } = localController.addImageTargetsFromBuffer(targetBuffer);

      const targetDimensions = dimensions[this.targetIndex];
      if (!targetDimensions) {
        throw new Error(`O alvo ${this.targetIndex} não existe no arquivo do MindAR.`);
      }
      this.postMatrix = this.createPostMatrix(targetDimensions);

      await localController.dummyRun(this.video);
      this.assertActive(token, signal);

      this.resize();
      localController.processVideo(this.video);
      this.running = true;
    } catch (error) {
      this.disposeController(localController);
      this.stopMediaStream(localStream);

      if (this.controller === localController) this.controller = null;
      if (this.mediaStream === localStream) this.mediaStream = null;
      if (this.video.srcObject === localStream) this.video.srcObject = null;

      if (this.operationToken === token) {
        this.renderer.setAnimationLoop(null);
        this.running = false;
        this.targetVisible = false;
        this.poseInitialized = false;
        this.postMatrix = null;
        this.anchor.visible = false;
        this.detachResizeListener();
        this.detachElements();
      }

      throw error;
    }
  }

  private async requestCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("A câmera não está disponível neste navegador.");
    }

    const video: MediaTrackConstraints = this.deviceId
      ? { deviceId: { exact: this.deviceId } }
      : { facingMode: { ideal: "environment" } };

    return navigator.mediaDevices.getUserMedia({ audio: false, video });
  }

  private waitForVideoMetadata(signal: AbortSignal) {
    if (this.video.readyState >= HTMLMediaElement.HAVE_METADATA && this.video.videoWidth > 0) {
      return Promise.resolve();
    }

    if (signal.aborted) return Promise.reject(this.createAbortError());

    return new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        this.video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        this.video.removeEventListener("error", handleError);
        signal.removeEventListener("abort", handleAbort);
      };
      const handleLoadedMetadata = () => {
        cleanup();
        resolve();
      };
      const handleError = () => {
        cleanup();
        reject(new Error("Não foi possível ler o vídeo da câmera."));
      };
      const handleAbort = () => {
        cleanup();
        reject(this.createAbortError());
      };

      this.video.addEventListener("loadedmetadata", handleLoadedMetadata, { once: true });
      this.video.addEventListener("error", handleError, { once: true });
      signal.addEventListener("abort", handleAbort, { once: true });

      if (signal.aborted) handleAbort();
    });
  }

  private handleControllerUpdate(
    update: MindArUpdate,
    sourceController: MindArController | null,
    token: number
  ) {
    if (
      update.type !== "updateMatrix" ||
      update.targetIndex !== this.targetIndex ||
      sourceController !== this.controller ||
      token !== this.operationToken ||
      !this.postMatrix
    ) {
      return;
    }

    if (update.worldMatrix === null || update.worldMatrix === undefined) {
      this.anchor.visible = false;
      this.poseInitialized = false;
      if (this.targetVisible) {
        this.targetVisible = false;
        this.onTargetLost?.();
      }
      this.onTargetUpdate?.();
      return;
    }

    const matrix = new Matrix4().fromArray(update.worldMatrix);
    matrix.multiply(this.postMatrix);
    matrix.decompose(this.targetPosition, this.targetQuaternion, this.targetScale);

    if (!this.poseInitialized) {
      this.anchor.position.copy(this.targetPosition);
      this.anchor.quaternion.copy(this.targetQuaternion);
      this.anchor.scale.copy(this.targetScale);
      this.poseInitialized = true;
    }

    this.anchor.visible = true;

    if (!this.targetVisible) {
      this.targetVisible = true;
      this.onTargetFound?.();
    }
    this.onTargetUpdate?.();
  }

  private createPostMatrix([markerWidth, markerHeight]: ImageTargetDimensions) {
    const position = new Vector3(
      markerWidth / 2,
      markerWidth / 2 + (markerHeight - markerWidth) / 2,
      0
    );
    const scale = new Vector3(markerWidth, markerWidth, markerWidth);
    return new Matrix4().compose(position, new Quaternion(), scale);
  }

  private assertActive(token: number, signal: AbortSignal) {
    if (signal.aborted || token !== this.operationToken || this.disposed) {
      throw this.createAbortError();
    }
  }

  private createAbortError() {
    return new DOMException("A inicialização da sessão de RA foi interrompida.", "AbortError");
  }

  private configureVideo() {
    this.video.autoplay = true;
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.setAttribute("aria-hidden", "true");
    this.video.style.position = "absolute";
    this.video.style.inset = "0 auto auto 0";
    this.video.style.zIndex = "0";
    this.video.style.maxWidth = "none";
    this.video.style.pointerEvents = "none";
  }

  private configureCanvas() {
    const canvas = this.renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.inset = "0 auto auto 0";
    canvas.style.zIndex = "1";
    canvas.style.pointerEvents = "none";
  }

  private attachElements() {
    if (!this.video.isConnected) this.container.appendChild(this.video);
    if (!this.renderer.domElement.isConnected) {
      this.container.appendChild(this.renderer.domElement);
    }
  }

  private detachElements() {
    this.video.remove();
    this.renderer.domElement.remove();
  }

  private attachResizeListener() {
    if (this.resizeListenerAttached) return;
    window.addEventListener("resize", this.resizeListener);
    this.resizeListenerAttached = true;
  }

  private detachResizeListener() {
    if (!this.resizeListenerAttached) return;
    window.removeEventListener("resize", this.resizeListener);
    this.resizeListenerAttached = false;
  }

  private disposeController(controller: MindArController | null) {
    if (!controller) return;

    try {
      controller.stopProcessVideo();
    } catch {
      // A inicialização pode ter sido interrompida antes do loop começar.
    }

    try {
      controller.dispose();
    } catch {
      // O worker pode já ter sido descartado por uma interrupção anterior.
    }
  }

  private stopMediaStream(stream: MediaStream | null) {
    stream?.getTracks().forEach((track) => track.stop());
  }
}
