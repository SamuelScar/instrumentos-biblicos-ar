export type InstrumentId = "shofar" | "harpa" | "tamborim";

export type BibleRef = {
  book: string;
  chapter: number;
  verse?: number;
};

export type Instrument = {
  id: InstrumentId;
  name: string;
  shortDescription: string;
  bibleRefs: BibleRef[];
  assets: {
    modelUrl?: string;
    posterUrl?: string;
    audioUrl?: string;
  };
  content: {
    historicalContext?: string;
    scientificExplanation?: string;
    curiosities: string[];
  };
  ar: {
    enabled: boolean;
    placement: "floor" | "wall";
    scale: "auto" | "fixed";
  };
};

export const instruments: Instrument[] = [
  {
    id: "shofar",
    name: "Shofar",
    shortDescription: "Trombeta feita de chifre, usada em anúncios e celebrações.",
    bibleRefs: [{ book: "Josué", chapter: 6, verse: 5 }],
    assets: {},
    content: { curiosities: [] },
    ar: { enabled: false, placement: "floor", scale: "auto" },
  },
  {
    id: "harpa",
    name: "Harpa",
    shortDescription: "Instrumento de cordas associado a louvor e adoração.",
    bibleRefs: [{ book: "Salmos", chapter: 33, verse: 2 }],
    assets: {
      modelUrl: "/models/harpa/harpa.glb",
    },
    content: {
      scientificExplanation:
        "O som é produzido pela vibração das cordas. O comprimento, a espessura e a tensão de cada corda influenciam a altura do som.",
      curiosities: [],
    },
    ar: { enabled: true, placement: "floor", scale: "auto" },
  },
  {
    id: "tamborim",
    name: "Tamborim",
    shortDescription: "Percussão usada em celebrações e danças.",
    bibleRefs: [{ book: "Êxodo", chapter: 15, verse: 20 }],
    assets: {},
    content: { curiosities: [] },
    ar: { enabled: false, placement: "floor", scale: "auto" },
  },
];

export function findInstrumentById(id: string | null | undefined): Instrument | undefined {
  return instruments.find((instrument) => instrument.id === id);
}

export function formatBibleRef(ref: BibleRef): string {
  return `${ref.book} ${ref.chapter}${ref.verse ? `:${ref.verse}` : ""}`;
}
