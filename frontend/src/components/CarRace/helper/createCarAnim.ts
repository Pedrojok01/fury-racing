import { Animation, type IAnimationKey } from "@babylonjs/core";

import { carAnimNumFrames } from "./constants";

export const createCarAnim = (property: string, keyframes: IAnimationKey[]) => {
  const anim = new Animation(
    "anim",
    property,
    carAnimNumFrames,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT,
  );
  anim.setKeys(keyframes);
  return anim;
};
