import { create } from "zustand";

type Screen = "HOME" | "SELECTION" | "RACE" | "ENDED" | "LEADERBOARD";

type GameState = {
  lastTime: number;
  bestTime: number;
  screen: Screen;
  setLastTime: (time: number) => void;
  setBestTime: (time: number) => void;
  setScreen: (screen: Screen) => void;
};

const useGame = create<GameState>((set) => ({
  lastTime: 0,
  bestTime: 0,
  screen: "HOME",
  setLastTime: (time: number) => set({ lastTime: time }),
  setBestTime: (time: number) => {
    set({ bestTime: time });
  },
  setScreen: (screen: Screen) => set({ screen }),
}));

export { useGame };
