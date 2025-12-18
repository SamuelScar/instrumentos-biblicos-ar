import type { ArModeId } from "../ar/types";
import type { InstrumentId } from "../domain/instruments";

export const store = {
  selectedMode: null as ArModeId | null,
  selectedInstrumentId: "shofar" as InstrumentId,
};