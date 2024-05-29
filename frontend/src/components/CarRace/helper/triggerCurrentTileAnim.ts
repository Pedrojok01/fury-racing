import { AnimationGroup, TransformNode } from "@babylonjs/core";

import { carAnimNumFrames, carAnimDriftRatioPos, carAnimDriftRatioRot, gridTileSize } from "./constants";
import { createCarAnim } from "./createCarAnim";

type CarDirection = "north" | "south" | "east" | "west";

/**
 * Determines the direction the car is facing based on its rotation.
 * @param car - The car TransformNode.
 * @returns The direction the car is facing.
 */
const getCarDirection = (car: TransformNode): CarDirection => {
  const rotationFactorX = Math.sin(car.rotation.y);
  const rotationFactorZ = Math.cos(car.rotation.y);

  if (Math.abs(rotationFactorX) > Math.abs(rotationFactorZ)) {
    return rotationFactorX <= 0 ? "west" : "east";
  } else {
    return rotationFactorZ <= 0 ? "south" : "north";
  }
};

/**
 * Calculates the tile position of the car based on its direction and position.
 * @param car - The car TransformNode.
 * @param carDirection - The direction the car is facing.
 * @returns The x and y coordinates of the tile the car is on.
 */
const getCarTilePosition = (car: TransformNode, carDirection: CarDirection): { x: number; y: number } => {
  const carTileX = Math.floor(
    (car.position.x +
      (carDirection === "east" ? gridTileSize / 2 : carDirection === "west" ? -(gridTileSize / 2) : 0)) /
      gridTileSize,
  );
  const carTileY = Math.floor(
    (car.position.z +
      (carDirection === "north" ? gridTileSize / 2 : carDirection === "south" ? -(gridTileSize / 2) : 0)) /
      gridTileSize,
  );

  return { x: carTileX, y: carTileY };
};

/**
 * Triggers the current tile animation for the car.
 * @param scene - The Babylon.js scene.
 * @param track - The track configuration.
 * @param car - The car TransformNode.
 */
export const getCurrentTileAnim = (track: TrackAnim, car: TransformNode) => {
  const carDirection = getCarDirection(car);
  const { x: carTileX, y: carTileY } = getCarTilePosition(car, carDirection);

  const tileRows = track.tiles.trim().split(/\r?\n|\r|\n/g);
  const tileRow = tileRows[tileRows.length - 1 - carTileY].trim();
  const tileChar = tileRow[carTileX];

  const animationGroup = new AnimationGroup("car");

  const addAnimation = (property: string, startValue: number, endValue: number, drift: number | null = null) => {
    const keyframes = [
      { frame: 0, value: startValue },
      { frame: carAnimNumFrames, value: endValue },
    ];

    if (drift) {
      const driftValue = startValue + (endValue - startValue) * drift;

      keyframes.splice(carAnimNumFrames - 1, 0, { frame: carAnimNumFrames - 1, value: driftValue });
    }

    animationGroup.addTargetedAnimation(createCarAnim(property, keyframes), car);
  };

  switch (tileChar) {
    case "─":
      if (carDirection === "east") {
        addAnimation("position.x", car.position.x, car.position.x + gridTileSize);
      } else if (carDirection === "west") {
        addAnimation("position.x", car.position.x, car.position.x - gridTileSize);
      }
      break;
    case "│":
      if (carDirection === "north") {
        addAnimation("position.z", car.position.z, car.position.z + gridTileSize);
      } else if (carDirection === "south") {
        addAnimation("position.z", car.position.z, car.position.z - gridTileSize);
      }
      break;
    case "┌":
      if (carDirection === "north") {
        addAnimation("position.x", car.position.x, car.position.x + gridTileSize / 2);
        addAnimation("position.z", car.position.z, car.position.z + gridTileSize / 2, carAnimDriftRatioPos);
        addAnimation("rotation.y", car.rotation.y, car.rotation.y + Math.PI / 2, carAnimDriftRatioRot);
      } else if (carDirection === "west") {
        addAnimation("position.x", car.position.x, car.position.x - gridTileSize / 2, carAnimDriftRatioPos);
        addAnimation("position.z", car.position.z, car.position.z - gridTileSize / 2);
        addAnimation("rotation.y", car.rotation.y, car.rotation.y - Math.PI / 2, carAnimDriftRatioRot);
      }
      break;
    case "┐":
      if (carDirection === "north") {
        addAnimation("position.x", car.position.x, car.position.x - gridTileSize / 2);
        addAnimation("position.z", car.position.z, car.position.z + gridTileSize / 2, carAnimDriftRatioPos);
        addAnimation("rotation.y", car.rotation.y, car.rotation.y - Math.PI / 2, carAnimDriftRatioRot);
      } else if (carDirection === "east") {
        addAnimation("position.x", car.position.x, car.position.x + gridTileSize / 2, carAnimDriftRatioPos);
        addAnimation("position.z", car.position.z, car.position.z - gridTileSize / 2);
        addAnimation("rotation.y", car.rotation.y, car.rotation.y + Math.PI / 2, carAnimDriftRatioRot);
      }
      break;
    case "└":
      if (carDirection === "south") {
        addAnimation("position.x", car.position.x, car.position.x + gridTileSize / 2);
        addAnimation("position.z", car.position.z, car.position.z - gridTileSize / 2, carAnimDriftRatioPos);
        addAnimation("rotation.y", car.rotation.y, car.rotation.y - Math.PI / 2, carAnimDriftRatioRot);
      } else if (carDirection === "west") {
        addAnimation("position.x", car.position.x, car.position.x - gridTileSize / 2, carAnimDriftRatioPos);
        addAnimation("position.z", car.position.z, car.position.z + gridTileSize / 2);
        addAnimation("rotation.y", car.rotation.y, car.rotation.y + Math.PI / 2, carAnimDriftRatioRot);
      }
      break;
    case "┘":
      if (carDirection === "south") {
        addAnimation("position.x", car.position.x, car.position.x - gridTileSize / 2);
        addAnimation("position.z", car.position.z, car.position.z - gridTileSize / 2, carAnimDriftRatioPos);
        addAnimation("rotation.y", car.rotation.y, car.rotation.y + Math.PI / 2, carAnimDriftRatioRot);
      } else if (carDirection === "east") {
        addAnimation("position.x", car.position.x, car.position.x + gridTileSize / 2, carAnimDriftRatioPos);
        addAnimation("position.z", car.position.z, car.position.z + gridTileSize / 2);
        addAnimation("rotation.y", car.rotation.y, car.rotation.y - Math.PI / 2, carAnimDriftRatioRot);
      }
      break;
  }

  return animationGroup;
};
