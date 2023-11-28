import { without } from "lodash-es";
import { StoreApi, UseBoundStore, create } from "zustand";

import { getStartOfTodayInParis } from "./util";

enum Quartier {
  RG,
  RD,
  EXT,
}

export type CalendrierStore = UseBoundStore<StoreApi<CalendrierState>>;

interface CalendrierState {
  date: Date;
  minHour: number;
  maxHour: number;
  filter: string;
  quartiers: Quartier[];
  setDate: (date: Date) => void;
  setMinHour: (minHour: number) => void;
  setMaxHour: (maxHour: number) => void;
  setFilter: (filter: string) => void;
  toggleQuartier: (quartier: Quartier) => void;
}

export function useUseCalendrierStore() {
  return create<CalendrierState>()((set, get) => ({
    date: getStartOfTodayInParis(),
    minHour: 0,
    maxHour: 24,
    filter: "",
    quartiers: [Quartier.RG, Quartier.RD, Quartier.EXT],
    setDate: (date: Date) => set({ date, minHour: 0, maxHour: 24 }),
    setMinHour: (minHour: number) => set({ minHour }),
    setMaxHour: (maxHour: number) => set({ maxHour }),
    setFilter: (filter: string) => set({ filter }),
    toggleQuartier: (quartier: Quartier) => {
      const quartiers = get().quartiers;
      if (quartiers.includes(quartier)) {
        set({ quartiers: without(quartiers, quartier) });
      } else {
        set({ quartiers: [...quartiers, quartier] });
      }
    },
  }));
}
