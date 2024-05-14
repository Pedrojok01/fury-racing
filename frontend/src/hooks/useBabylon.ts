import { useState } from "react";

export const useBabylon = (initialCarIdx = 0) => {
  const [carIdx, setCarIdx] = useState(initialCarIdx);

  const incrementCarIdx = () => {
    setCarIdx((currCarIdx) => (currCarIdx + 1) % 2);
  };

  const decrementCarIdx = () => {
    setCarIdx((currCarIdx) => (currCarIdx === 0 ? 1 : currCarIdx - 1));
  };

  return { carIdx, setCarIdx, incrementCarIdx, decrementCarIdx };
};
