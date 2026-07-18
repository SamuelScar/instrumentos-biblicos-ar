import alaudeData from "../data/instruments/alaude.json";
import flautaData from "../data/instruments/flauta.json";
import harpaData from "../data/instruments/harpa.json";
import liraData from "../data/instruments/lira.json";
import salterioData from "../data/instruments/salterio.json";
import shofarData from "../data/instruments/shofar.json";
import sinosData from "../data/instruments/sinos.json";
import tamborimData from "../data/instruments/tamborim.json";
import trombetaData from "../data/instruments/trombeta.json";

export type InstrumentId =
  | "alaude"
  | "flauta"
  | "shofar"
  | "harpa"
  | "lira"
  | "sinos"
  | "tamborim"
  | "salterio"
  | "trombeta";

export type BibleRef = {
  book: string;
  chapter: number;
  verse: number | null;
  endVerse: number | null;
};

export type InstrumentSource = {
  title: string;
  url: string;
};

export type ImageTrackingAr = {
  enabled: boolean;
  targetFileUrl: string;
  targetImageUrl: string;
  targetIndex: number;
  missTolerance?: number;
  modelScale: number;
  modelRotation: [number, number, number];
};

export type Instrument = {
  id: InstrumentId;
  name: string;
  shortDescription: string;
  bibleRefs: BibleRef[];
  content: {
    biblicalContext: string | null;
    historicalContext: string | null;
    scientificExplanation: string | null;
    curiosities: string[];
  };
  assets: {
    modelUrl: string | null;
    coverImageUrl: string | null;
    audioUrl: string | null;
  };
  ar: {
    enabled: boolean;
    placement: "floor" | "wall";
    scale: "auto" | "fixed";
    imageTracking?: ImageTrackingAr;
  };
  sources: InstrumentSource[];
};

type InstrumentData = Omit<Instrument, "id" | "ar"> & {
  id: string;
  ar: {
    enabled: boolean;
    placement: string;
    scale: string;
    imageTracking?: Omit<ImageTrackingAr, "modelRotation"> & {
      modelRotation: number[];
    };
  };
};

function isInstrumentId(id: string): id is InstrumentId {
  return (
    id === "alaude" ||
    id === "flauta" ||
    id === "shofar" ||
    id === "harpa" ||
    id === "lira" ||
    id === "sinos" ||
    id === "tamborim" ||
    id === "salterio" ||
    id === "trombeta"
  );
}

function parseInstrument(data: InstrumentData): Instrument {
  if (!isInstrumentId(data.id)) {
    throw new Error(`Identificador de instrumento inválido: ${data.id}`);
  }

  if (data.ar.placement !== "floor" && data.ar.placement !== "wall") {
    throw new Error(`Posicionamento de RA inválido para ${data.id}`);
  }

  if (data.ar.scale !== "auto" && data.ar.scale !== "fixed") {
    throw new Error(`Escala de RA inválida para ${data.id}`);
  }

  const imageTracking = data.ar.imageTracking;

  if (
    imageTracking &&
    (!Number.isInteger(imageTracking.targetIndex) ||
      imageTracking.targetIndex < 0 ||
      (imageTracking.missTolerance !== undefined &&
        (!Number.isInteger(imageTracking.missTolerance) ||
          imageTracking.missTolerance < 0)) ||
      !imageTracking.targetFileUrl ||
      !imageTracking.targetImageUrl ||
      !Number.isFinite(imageTracking.modelScale) ||
      imageTracking.modelScale <= 0 ||
      imageTracking.modelRotation.length !== 3 ||
      !imageTracking.modelRotation.every(Number.isFinite))
  ) {
    throw new Error(`Configuração de rastreamento por imagem inválida para ${data.id}`);
  }

  return {
    ...data,
    id: data.id,
    ar: {
      ...data.ar,
      placement: data.ar.placement,
      scale: data.ar.scale,
      imageTracking: imageTracking
        ? {
            ...imageTracking,
            modelRotation: imageTracking.modelRotation as [number, number, number],
          }
        : undefined,
    },
  };
}

export const instruments: Instrument[] = [
  shofarData,
  harpaData,
  liraData,
  alaudeData,
  flautaData,
  tamborimData,
  salterioData,
  trombetaData,
  sinosData,
].map(parseInstrument);

export function findInstrumentById(id: string | null | undefined): Instrument | undefined {
  return instruments.find((instrument) => instrument.id === id);
}

export function formatBibleRef(ref: BibleRef): string {
  const verse = ref.verse === null ? "" : `:${ref.verse}`;
  const endVerse = ref.endVerse === null ? "" : `-${ref.endVerse}`;

  return `${ref.book} ${ref.chapter}${verse}${endVerse}`;
}
