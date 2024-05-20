import { create } from "zustand";

type GameState = {
  lastTime: number;
  bestTime: number;
  screen: CurrentScreen;
  mode: RaceMode | undefined;
  setLastTime: (time: number) => void;
  setBestTime: (time: number) => void;
  setScreen: (screen: CurrentScreen) => void;
  setRaceMode: (mode: RaceMode) => void;
};

const useGame = create<GameState>((set) => ({
  lastTime: 0,
  bestTime: 0,
  screen: "HOME",
  mode: undefined,
  setLastTime: (time: number) => set({ lastTime: time }),
  setBestTime: (time: number) => {
    set({ bestTime: time });
  },
  setScreen: (screen: CurrentScreen) => set({ screen }),
  setRaceMode: (mode: RaceMode) => set({ mode }),
}));

export { useGame };
