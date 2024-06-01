import { useEffect, useCallback } from "react";

import { useDebounce } from "@/hooks";
import { useGameStates } from "@/stores";

const totalPoints = 40;

export const useAttributes = (defaultAttributes: CarAttributes) => {
  const { attributes, setAttributes, setRemainingPoints } = useGameStates();

  const debouncedAttributes = useDebounce(attributes, 1000);

  useEffect(() => {
    setAttributes(defaultAttributes);
  }, [defaultAttributes, setAttributes]);

  useEffect(() => {
    const totalUsedPoints = Object.values(debouncedAttributes).reduce((acc, cur) => acc + cur, 0);
    setRemainingPoints(totalPoints - totalUsedPoints);
  }, [debouncedAttributes, setRemainingPoints]);

  const handleAttributeChange = useCallback(
    (value: number, attribute: keyof CarAttributes) => {
      setAttributes((prev) => {
        const newValue = Math.max(1, Math.min(value, 10)); // Ensure values are within 1-10
        const newAttributes = { ...prev, [attribute]: newValue };
        const totalUsedPoints = Object.values(newAttributes).reduce((acc, cur) => acc + cur, 0);

        if (totalUsedPoints <= totalPoints) {
          return newAttributes;
        }
        return prev;
      });
    },
    [setAttributes],
  );

  const handleSliderChange = useCallback((value: number, min: number, max: number) => {
    return Math.max(min, Math.min(value, max));
  }, []);

  return { handleAttributeChange, handleSliderChange };
};
