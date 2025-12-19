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
    targetIndex: number;
  };
};

export const instruments: Instrument[] = [
  {
    id: "shofar",
    name: "Shofar",
    shortDescription: "Trombeta feita de chifre, usada em anúncios e celebrações.",
    bibleRefs: [{ book: "Josué", chapter: 6, verse: 5 }],
    assets: { targetIndex: 0 },
  },
  {
    id: "harpa",
    name: "Harpa",
    shortDescription: "Instrumento de cordas associado a louvor e adoração.",
    bibleRefs: [{ book: "Salmos", chapter: 33, verse: 2 }],
    assets: { targetIndex: 1 },
  },
  {
    id: "tamborim",
    name: "Tamborim",
    shortDescription: "Percussão usada em celebrações e danças.",
    bibleRefs: [{ book: "Êxodo", chapter: 15, verse: 20 }],
    assets: { targetIndex: 2 },
  },
];
