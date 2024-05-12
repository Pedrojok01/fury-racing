import { useEffect, useRef, type FC } from "react";

import { Vector3, SceneLoader, AbstractMesh } from "@babylonjs/core";
import { useBeforeRender, useScene } from "react-babylonjs";

import "@babylonjs/loaders/glTF";

const CarModel: FC = () => {
  const scene = useScene();
  const carRef = useRef<AbstractMesh | null>(null);

  // This will rotate the box on every Babylon frame.
  const rpm = 5;
  useBeforeRender((scene) => {
    if (carRef.current) {
      const deltaTimeInMillis = scene.getEngine().getDeltaTime();
      carRef.current.rotation.y += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
    }
  });

  useEffect(() => {
    if (scene) {
      SceneLoader.ImportMesh("", "./assets/low-poly/", "scene.gltf", scene, (newMeshes) => {
        if (newMeshes.length > 0) {
          const car = newMeshes[0];
          car.position = new Vector3(0, 1, 0);
          carRef.current = car;
          console.log("Car mesh loaded and assigned", car); // Debugging mesh load

          if (car.getChildMeshes().length > 0) {
            console.log("Car has child meshes: ", car.getChildMeshes());
          }
        }
      });
    }
  }, [scene]);

  return null;
};

export default CarModel;
