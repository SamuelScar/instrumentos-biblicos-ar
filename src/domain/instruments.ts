import harpaData from "../data/instruments/harpa.json";
import shofarData from "../data/instruments/shofar.json";
import tamborimData from "../data/instruments/tamborim.json";

export type InstrumentId = "shofar" | "harpa" | "tamborim";

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
  };
  sources: InstrumentSource[];
};

type InstrumentData = Omit<Instrument, "id" | "ar"> & {
  id: string;
  ar: {
    enabled: boolean;
    placement: string;
    scale: string;
  };
};

function isInstrumentId(id: string): id is InstrumentId {
  return id === "shofar" || id === "harpa" || id === "tamborim";
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

  return {
    ...data,
    id: data.id,
    ar: {
      ...data.ar,
      placement: data.ar.placement,
      scale: data.ar.scale,
    },
  };
}

export const instruments: Instrument[] = [shofarData, harpaData, tamborimData].map(
  parseInstrument,
);

export function findInstrumentById(id: string | null | undefined): Instrument | undefined {
  return instruments.find((instrument) => instrument.id === id);
}

export function formatBibleRef(ref: BibleRef): string {
  const verse = ref.verse === null ? "" : `:${ref.verse}`;
  const endVerse = ref.endVerse === null ? "" : `-${ref.endVerse}`;

  return `${ref.book} ${ref.chapter}${verse}${endVerse}`;
}
