import { create } from "zustand";

type GameState = {
  lastTime: number;
  bestTime: number;
  mode: RaceMode | undefined;
  setLastTime: (time: number) => void;
  setBestTime: (time: number) => void;
  setRaceMode: (mode: RaceMode) => void;
};

const useGame = create<GameState>((set) => ({
  lastTime: 0,
  bestTime: 0,
  mode: undefined,
  setLastTime: (time: number) => set({ lastTime: time }),
  setBestTime: (time: number) => {
    set({ bestTime: time });
  },
  setRaceMode: (mode: RaceMode) => set({ mode }),
}));

export { useGame };
