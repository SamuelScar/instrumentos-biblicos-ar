import {
  ACESFilmicToneMapping,
  Box3,
  Group,
  Mesh,
  PMREMGenerator,
  Texture,
  Vector3,
  type Material,
  type Object3D,
  type WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

function disposeMaterial(material: Material): void {
  for (const value of Object.values(material)) {
    if (value instanceof Texture) value.dispose();
  }

  material.dispose();
}

export function disposeModel(model: Object3D): void {
  model.traverse((object) => {
    if (!(object instanceof Mesh)) return;

    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach(disposeMaterial);
  });

  model.removeFromParent();
}

export function loadModel(modelUrl: string): Promise<Object3D> {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(
      modelUrl,
      (gltf) => resolve(gltf.scene),
      undefined,
      (error) => reject(error)
    );
  });
}

export function prepareImageTrackingModel(
  model: Object3D,
  scale: number,
  rotation: readonly [number, number, number]
): Group {
  model.scale.setScalar(scale);

  const center = new Box3().setFromObject(model).getCenter(new Vector3());
  model.position.sub(center);

  const pivot = new Group();
  pivot.rotation.set(...rotation);
  pivot.add(model);
  return pivot;
}

export function createImageTrackingEnvironment(renderer: WebGLRenderer): Texture {
  const environment = new RoomEnvironment();
  const generator = new PMREMGenerator(renderer);

  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  try {
    return generator.fromScene(environment, 0.04).texture;
  } finally {
    environment.dispose();
    generator.dispose();
  }
}
