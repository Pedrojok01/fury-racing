import React, { Suspense, type FC, type ReactNode } from "react";

import {
  Vector3,
  SceneLoader,
  ArcRotateCamera,
  HemisphericLight,
  Scene as SceneCore,
} from "@babylonjs/core";
import { Box } from "@chakra-ui/react";
import { Scene, Engine } from "react-babylonjs";

import "@babylonjs/loaders/glTF";

interface CarSpinProps {
  children?: ReactNode;
}

const CarSpin: FC<CarSpinProps> = ({ children }) => {
  const onSceneReady = (scene: SceneCore) => {
    // Create a hemispheric light
    const light = new HemisphericLight("light", Vector3.Up(), scene);
    light.intensity = 0.7;

    // Create and configure the camera
    const camera = new ArcRotateCamera(
      "camera",
      0, // alpha
      Math.PI / 2, // beta
      13, // radius
      Vector3.Zero(), // target
      scene,
    );
    camera.attachControl(scene.getEngine().getRenderingCanvas(), true);

    // Load the car model and set its initial position
    SceneLoader.ImportMesh("", "./assets/low-poly/", "scene.gltf", scene, (newMeshes) => {
      if (newMeshes.length > 0) {
        const car = newMeshes[0];
        car.position = new Vector3(0, 1, 0);

        // Add a rotation animation to the car
        scene.onBeforeRenderObservable.add(() => {
          car.rotation.y += 0.002;
          car.rotation.y %= 2 * Math.PI;
        });
      }
    });
  };

  return (
    <Box w="500px" h="300px">
      <Engine antialias adaptToDeviceRatio canvasId="babylonJS" width="500" height="300">
        <Suspense fallback={null}>
          <Scene onSceneMount={({ scene }) => onSceneReady(scene)}>{children}</Scene>
        </Suspense>
      </Engine>
    </Box>
  );
};

export default CarSpin;
