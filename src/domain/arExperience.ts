import {
  instruments,
  type ImageTrackingAr,
  type Instrument,
  type InstrumentId,
} from "./instruments";

export const AR_COLLECTION_TARGET_URL = "/ar/collection/targets.mind";

export type EnvironmentArInstrument = Instrument & {
  assets: Instrument["assets"] & {
    modelUrl: string;
  };
};

export type ImageArInstrument = EnvironmentArInstrument & {
  ar: Instrument["ar"] & {
    imageTracking: ImageTrackingAr;
  };
};

export const environmentArInstruments = instruments.filter(
  (instrument): instrument is EnvironmentArInstrument =>
    Boolean(instrument.assets.modelUrl && instrument.ar.environmentEnabled)
);

export const imageArInstruments = instruments.filter(
  (instrument): instrument is ImageArInstrument =>
    Boolean(
      instrument.assets.modelUrl &&
        instrument.ar.imageTracking?.enabled &&
        Number.isInteger(instrument.ar.imageTracking.collectionTargetIndex)
    )
);

const imageArInstrumentByTargetIndex = new Map(
  imageArInstruments.map((instrument) => [
    instrument.ar.imageTracking.collectionTargetIndex,
    instrument,
  ])
);

const collectionTargetIndices = [...imageArInstrumentByTargetIndex.keys()].sort(
  (first, second) => first - second
);

if (
  imageArInstrumentByTargetIndex.size !== imageArInstruments.length ||
  collectionTargetIndices.some((targetIndex, position) => targetIndex !== position)
) {
  throw new Error("Os índices da coleção de cards de RA são inválidos.");
}

export function findEnvironmentArInstrument(
  instrumentId: InstrumentId
): EnvironmentArInstrument | undefined {
  return environmentArInstruments.find((instrument) => instrument.id === instrumentId);
}

export function findImageArInstrumentByTargetIndex(
  targetIndex: number
): ImageArInstrument | undefined {
  return imageArInstrumentByTargetIndex.get(targetIndex);
}
