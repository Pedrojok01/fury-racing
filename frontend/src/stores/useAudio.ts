import { create } from "zustand";

type AudioState = {
  audio: boolean;
  setAudio: (value: boolean) => void;
  songIndex: number;
  setSongIndex: (index: number | ((prevIndex: number) => number)) => void;
  audioElement: HTMLAudioElement | null;
  setAudioElement: (element: HTMLAudioElement) => void;
};

const useAudio = create<AudioState>((set) => ({
  audio: false,
  setAudio: (audio: boolean) => set({ audio }),
  songIndex: Math.floor(Math.random() * 3),
  setSongIndex: (index) =>
    set((state) => ({
      songIndex: typeof index === "function" ? index(state.songIndex) : index,
    })),
  audioElement: null,
  setAudioElement: (element) => set({ audioElement: element }),
}));

export { useAudio };
