import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type FC, useMemo } from "react";

const songs = [
  "/music/gym-phonk-187854.mp3",
  "/music/night-phonk-203960.mp3",
  "/music/the_final_race_epic_sport_action_trailer_cinematic_music_198690.mp3",
];

type AudioContextType = {
  audio: boolean;
  setAudio: (value: boolean) => void;
  songIndex: number;
  setSongIndex: (index: number) => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};

type AudioProviderProps = {
  children: ReactNode;
};

export const AudioProvider: FC<AudioProviderProps> = ({ children }) => {
  const [audio, setAudio] = useState(false);
  const [songIndex, setSongIndex] = useState(0);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(songs[songIndex]);
    }
    const sound = audioElementRef.current;

    const handleEnded = () => {
      setSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
    };

    sound.addEventListener("ended", handleEnded);

    return () => {
      sound.removeEventListener("ended", handleEnded);
    };
  }, [songIndex]);

  useEffect(() => {
    const sound = audioElementRef.current;
    if (!sound) return;

    sound.volume = 0.1;
    if (audio) {
      sound.play().catch((error) => console.error("Failed to play audio:", error));
    } else {
      sound.pause();
    }
  }, [audio]);

  useEffect(() => {
    const sound = audioElementRef.current;
    if (!sound) return;

    sound.pause();
    sound.src = songs[songIndex];
    sound.load();
    if (audio) {
      sound.play().catch((error) => console.error("Failed to play audio:", error));
    }
  }, [audio, songIndex]);

  useEffect(() => {
    const sound = audioElementRef.current;
    if (sound) {
      sound.muted = !audio;
    }
  }, [audio]);

  const value = useMemo(() => ({ audio, setAudio, songIndex, setSongIndex }), [audio, songIndex]);

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};
