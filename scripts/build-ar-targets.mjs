import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

globalThis.require = createRequire(import.meta.url);
globalThis.window = globalThis;

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mindArModulePath = resolve(
  projectRoot,
  "public/vendor/mindar/1.2.5/mindar-image.prod.js"
);
const combinedTargetsPath = resolve(projectRoot, "public/ar/alaude/targets.mind");
const harpaTargetPath = resolve(projectRoot, "public/ar/harpa/targets.mind");
const flautaTargetPath = resolve(projectRoot, "public/ar/flauta/targets.mind");
const outputDirectory = resolve(projectRoot, "public/ar/collection");
const outputPath = resolve(outputDirectory, "targets.mind");

const { Compiler } = await import(mindArModulePath);

async function readTargets(path) {
  const compiler = new Compiler();
  return compiler.importData(await readFile(path));
}

const [combinedTargets, harpaTargets, flautaTargets] = await Promise.all([
  readTargets(combinedTargetsPath),
  readTargets(harpaTargetPath),
  readTargets(flautaTargetPath),
]);

if (combinedTargets.length !== 8 || harpaTargets.length !== 1 || flautaTargets.length !== 1) {
  throw new Error("Os arquivos de origem dos cards não possuem a quantidade esperada de alvos.");
}

const collectionTargets = [...combinedTargets];
collectionTargets[1] = harpaTargets[0];
collectionTargets.push(flautaTargets[0]);

const compiler = new Compiler();
compiler.data = collectionTargets;

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, compiler.exportData());

console.log(`Arquivo criado com ${collectionTargets.length} alvos: ${outputPath}`);
