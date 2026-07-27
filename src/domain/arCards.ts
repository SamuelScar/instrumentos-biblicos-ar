import { instruments, type InstrumentId } from "./instruments";

export const AR_CARD_PRINT_WIDTH_CM = 10;
export const AR_CARD_PRINT_HEIGHT_CM = 15;
export const AR_CARDS_PDF_URL = "/downloads/cards-ra-impressao.pdf";

export type ArCard = {
  id: InstrumentId;
  instrumentName: string;
  imageUrl: string;
  downloadFileName: string;
};

export const arCards: ArCard[] = instruments.flatMap((instrument) => {
  const imageTracking = instrument.ar.imageTracking;

  if (!imageTracking?.enabled) return [];

  return [
    {
      id: instrument.id,
      instrumentName: instrument.name,
      imageUrl: imageTracking.targetImageUrl,
      downloadFileName: `card-ra-${instrument.id}.webp`,
    },
  ];
});

export const arCardPrintSheets: ArCard[][] = Array.from(
  { length: Math.ceil(arCards.length / 2) },
  (_, index) => arCards.slice(index * 2, index * 2 + 2)
);
