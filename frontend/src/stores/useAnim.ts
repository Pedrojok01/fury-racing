import { create } from "zustand";

import { carMetadata } from "@/data";

const defaultCarIdx = 0;

interface BabylonStore {
  carIdx: number;
  carData: CarMetadata;
  weatherFx: WeatherFx;
  skybox: Sky;
  incrementCarIdx: () => void;
  decrementCarIdx: () => void;
  setWeather: (weather: WeatherFx) => void;
  setSky: (sky: Sky) => void;
}

export const useAnim = create<BabylonStore>((set) => ({
  carIdx: defaultCarIdx,
  carData: carMetadata[defaultCarIdx],
  weatherFx: "none",
  skybox: "sunny",
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
  setWeather: (weatherFx) => set({ weatherFx }),
  setSky: (skybox) => set({ skybox }),
}));
