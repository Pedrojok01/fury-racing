import { create } from "zustand";

type AudioState = {
  audio: boolean;
  toggleAudio: () => void;
};

const useAudio = create<AudioState>((set) => ({
  audio: true,
  toggleAudio: () => set((state: { audio: boolean }) => ({ audio: !state.audio })),
}));

export { useAudio };
