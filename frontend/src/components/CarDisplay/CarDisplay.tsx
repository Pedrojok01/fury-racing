// Import(s).
import { type FC } from "react";
import React, { useRef, useEffect } from "react";

import {
  Color4,
  Engine,
  HemisphericLight,
  Observer,
  Scene,
  SceneLoader,
  TargetCamera,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { Button, HStack, VStack } from "@chakra-ui/react";

import { useBabylon } from "@/hooks";

// Prepare working variable(s).
const carMetadata = [
  {
    path: "car1",
    scale: 1.0,
  },
  {
    path: "car2",
    scale: 1.25,
  },
];

let isEngineInitialized = false;
let currEngine: Engine;
let currScene: Scene;
let currSceneRenderObserver: Observer<Scene>;
const currCarNodes: TransformNode[] = [];

// Define component(s).
const CarDisplay: FC = () => {
  // Prepare component variable(s).
  const ref = useRef(null);
  const { carIdx, incrementCarIdx, decrementCarIdx } = useBabylon();

  // Mounting/initialization callback.
  useEffect(() => {
    if (!isEngineInitialized) {
      // Fetch reference to canvas.
      const canvas = ref.current;

      // Initialize the engine.
      const engine = new Engine(canvas);
      engine.resize();

      // Initialize the scene.
      const scene = new Scene(engine);
      scene.clearColor = new Color4(0, 0, 0, 0); // Transparent background.

      // -- Create the camera.
      const camera = new TargetCamera("camera1", new Vector3(0, 5, -12), scene);
      camera.setTarget(Vector3.Zero());
      camera.attachControl(canvas, true);

      // -- Create light.
      const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
      light.intensity = 0.7;

      // -- Load the car models.
      for (let i = 0; i < carMetadata.length; i++) {
        const currCarMetadata = carMetadata[i];
        const currCar = new TransformNode("carRoot");
        currCar.rotation.y = 90;
        SceneLoader.LoadAssetContainer(
          `./assets/${currCarMetadata.path}/`,
          "scene.gltf",
          scene,
          (container) => {
            // Assign the root node to imported mesh objects.
            container.meshes.forEach((currMesh) => {
              if (!currMesh.parent) {
                currMesh.parent = currCar;
              }
            });

            currCar.scaling = new Vector3(
              currCarMetadata.scale,
              currCarMetadata.scale,
              currCarMetadata.scale,
            );

            // Collect the handle for that node.
            currCarNodes.push(currCar);
            console.log(currCarNodes);

            // Add the ndoe to the scene.
            container.addAllToScene();
          },
        );
      }

      // Start engine/scene rendering process.
      engine.runRenderLoop(() => {
        if (scene && scene.activeCamera) {
          scene.render();
        }
      });

      // Update references and initialization flag.
      currEngine = engine;
      currScene = scene;
      isEngineInitialized = true;
    }

    // Define the rendering loop.
    if (currSceneRenderObserver) {
      currScene.onBeforeRenderObservable.remove(currSceneRenderObserver);
    }

    currSceneRenderObserver = currScene.onBeforeRenderObservable.add(() => {
      const deltaTimeInMillis = currEngine.getDeltaTime();

      // For each car model...
      for (let i = 0; i < currCarNodes.length; i++) {
        const currCar = currCarNodes[i];

        // Make the mesh visible/invisible based on status.
        currCar.setEnabled(i === carIdx);

        // Rotate the car slowly.
        currCar.rotation.y =
          currCar.rotation.y +
          ((0.0002 * deltaTimeInMillis) % // Rotation speed is defined here.
            360);
      }
    });
  }, [carIdx]);

  // Return component.
  return (
    <VStack>
      <div style={{ width: "40rem", height: "20rem" }}>
        <canvas style={{ width: "100%", height: "100%" }} ref={ref} />
      </div>
      <HStack>
        <Button onClick={decrementCarIdx}>Prev</Button>
        <Button onClick={incrementCarIdx}>Next</Button>
      </HStack>
    </VStack>
  );
};

export default CarDisplay;
