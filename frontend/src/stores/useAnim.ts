import { create } from "zustand";

import { carMetadata } from "@/data";

interface BabylonStore {
  carIdx: number;
  carData: CarMetadata;
  incrementCarIdx: () => void;
  decrementCarIdx: () => void;
}

export const useAnim = create<BabylonStore>((set) => ({
  carIdx: 0,
  carData: carMetadata[0],
  incrementCarIdx: () =>
    set((state) => {
      const newCarIdx = state.carIdx === 0 ? carMetadata.length - 1 : state.carIdx - 1;
      return { carIdx: newCarIdx, carData: carMetadata[newCarIdx] };
    }),
  decrementCarIdx: () =>
    set((state) => {
      const newCarIdx = (state.carIdx + 1) % carMetadata.length;
      return { carIdx: newCarIdx, carData: carMetadata[newCarIdx] };
    }),
}));
