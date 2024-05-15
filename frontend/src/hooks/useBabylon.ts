import { useState } from "react";

import { carMetadata } from "@/data/game";

export const useBabylon = (initialCarIdx = 0) => {
  const [carIdx, setCarIdx] = useState(
    Math.min(carMetadata.length - 1, Math.max(0, initialCarIdx)),
  );

  const incrementCarIdx = () => {
    setCarIdx((currCarIdx) => (currCarIdx + 1) % carMetadata.length);
  };

  const decrementCarIdx = () => {
    setCarIdx((currCarIdx) => (currCarIdx === 0 ? carMetadata.length - 1 : currCarIdx - 1));
  };

  return { carIdx, setCarIdx, incrementCarIdx, decrementCarIdx };
};
