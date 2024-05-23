import { type FC, useEffect } from "react";

import { useAudio } from "@/stores/useAudio";

const songs = [
  "/music/gym-phonk-187854.mp3",
  "/music/night-phonk-203960.mp3",
  "/music/the_final_race_epic_sport_action_trailer_cinematic_music_198690.mp3",
];

const SoundManager: FC = () => {
  const { audio, songIndex, setSongIndex, audioElement, setAudioElement } = useAudio((state) => ({
    audio: state.audio,
    songIndex: state.songIndex,
    setSongIndex: state.setSongIndex,
    audioElement: state.audioElement,
    setAudioElement: state.setAudioElement,
  }));

  useEffect(() => {
    let sound: HTMLAudioElement;

    if (!audioElement) {
      sound = new Audio(songs[songIndex]);
      setAudioElement(sound);
      const handleEnded = () => {
        setSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
      };

      sound.addEventListener("ended", handleEnded);

      return () => {
        sound.removeEventListener("ended", handleEnded);
      };
    } else {
      sound = audioElement;
    }

    if (audio) {
      sound.volume = 0.1;
      sound.play().catch((error) => console.error("Failed to play audio:", error));
    } else {
      sound.pause();
    }
  }, [audio, audioElement, setAudioElement, setSongIndex, songIndex]);

  useEffect(() => {
    if (audioElement) {
      audioElement.pause();
      audioElement.src = songs[songIndex];
      audioElement.load();
      if (audio) {
        audioElement.play().catch((error) => console.error("Failed to play audio:", error));
      }
    }
  }, [songIndex, audio, audioElement]);

  useEffect(() => {
    if (audioElement) {
      audioElement.muted = !audio;
    }
  }, [audio, audioElement]);

  return null;
};

export default SoundManager;
