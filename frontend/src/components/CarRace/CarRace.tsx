import React, { useRef, useEffect, useMemo, type FC } from "react";

import {
  AbstractMesh,
  Engine,
  KeyboardEventTypes,
  Scene,
  SceneLoader,
  HemisphericLight,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { Box } from "@chakra-ui/react";

import { tracks } from "@/data";
import "@babylonjs/loaders/glTF";
import { useAnim } from "@/stores/useAnim";

import { initializeCamera, initializeTrack, triggerCurrentTileAnim } from "./helper";
import { carRotateFactor, carThrottleFactor, gridTileSize } from "./helper/constants";

const CarRace: FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const carNodeRef = useRef<TransformNode | null>(null);
  const { carIdx, carData } = useAnim();
  const track = tracks[0].animData;
  const isKeyboardControlEnabled = false;

  console.log("CarRace.tsx:", carIdx, carData);

  const controlState = useMemo(() => ({ up: false, down: false, left: false, right: false }), []);

  // Initialization
  useEffect(() => {
    if (!ref.current) return;

    // Initialize the engine.
    const engine = new Engine(ref.current, true);
    engineRef.current = engine;
    engine.resize();

    // Initialize the scene.
    const scene = new Scene(engine);
    sceneRef.current = scene;

    // Initialize the light.
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Initialize the track.
    initializeTrack(scene, track, gridTileSize);

    // Initialize the camera.
    const camera = initializeCamera(scene, track, gridTileSize);

    // Load and place the car model.
    // const meta = carMetadata[carIdx];
    const car = new TransformNode("carRoot");
    SceneLoader.LoadAssetContainer(
      `./assets/${carData.path}/`,
      "scene.gltf",
      scene,
      (container) => {
        // Assign the root node to imported mesh objects.
        container.meshes.forEach((mesh) => {
          mesh.position.x += carData.offset.x;
          mesh.position.y += carData.offset.y;
          mesh.position.z += carData.offset.z;

          if (!mesh.parent) {
            mesh.parent = car;
          }
        });

        car.scaling = new Vector3(carData.scale, carData.scale, carData.scale);

        // Place the car on the track.
        car.position.y += 1.3; // Lift the car so that it sits on the road.
        car.position.x += track.startPosition.x * gridTileSize;
        car.position.z += track.startPosition.y * gridTileSize;
        switch (track.startPosition.direction) {
          case "north":
            car.position.x += gridTileSize / 2;
            break;

          case "south":
            car.position.x += gridTileSize / 2;
            car.rotation.y += Math.PI;
            break;

          case "west":
            car.position.x += gridTileSize;
            car.position.z += gridTileSize / 2;
            car.rotation.y += 1.5 * Math.PI;
            break;

          case "east":
            car.position.z += gridTileSize / 2;
            car.rotation.y += 0.5 * Math.PI;
            break;
        }

        // Collect the handle for that node.
        carNodeRef.current = car;

        // Add the node to the scene.
        container.addAllToScene();

        // Update camera target.
        const cameraTarget = new AbstractMesh("cameraTarget", scene);
        cameraTarget.parent = car;
        cameraTarget.position.y = 5; // Have the camera aim a bit higher than the car.
        camera.lockedTarget = cameraTarget;

        if (!isKeyboardControlEnabled) {
          // Trigger animation process.
          triggerCurrentTileAnim(scene, track, car);
        }
      },
    );

    // Implement keyboard input logic (to drive car).
    scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          if (kbInfo.event.key === "ArrowLeft") controlState.left = true;
          if (kbInfo.event.key === "ArrowRight") controlState.right = true;
          if (kbInfo.event.key === "ArrowUp") controlState.up = true;
          if (kbInfo.event.key === "ArrowDown") controlState.down = true;
          break;
        case KeyboardEventTypes.KEYUP:
          if (kbInfo.event.key === "ArrowLeft") controlState.left = false;
          if (kbInfo.event.key === "ArrowRight") controlState.right = false;
          if (kbInfo.event.key === "ArrowUp") controlState.up = false;
          if (kbInfo.event.key === "ArrowDown") controlState.down = false;
          break;
      }
    });

    scene.onBeforeRenderObservable.add(() => {
      // Modify the car's position based on keyboard controls.
      if (!isKeyboardControlEnabled || !carNodeRef.current) return;

      const car = carNodeRef.current;

      // -- Rotation.
      const isRotatingLeft = controlState.left && !controlState.right;
      const isRotatingRight = controlState.right && !controlState.left;
      if (isRotatingLeft) {
        car.rotation.y += -carRotateFactor;
      } else if (isRotatingRight) {
        car.rotation.y += carRotateFactor;
      }

      // -- Throttle.
      const isThrottlingForward = controlState.up && !controlState.down;
      const isThrottlingBackward = controlState.down && !controlState.up;
      if (isThrottlingForward) {
        car.position.x += Math.sin(car.rotation.y) * carThrottleFactor;
        car.position.z += Math.cos(car.rotation.y) * carThrottleFactor;
      } else if (isThrottlingBackward) {
        car.position.x += Math.sin(car.rotation.y) * -carThrottleFactor;
        car.position.z += Math.cos(car.rotation.y) * -carThrottleFactor;
      }
    });

    // Start engine/scene rendering process.
    engine.runRenderLoop(() => scene.render());

    // Cleanup when component unmounts.
    return () => {
      engine.stopRenderLoop();
      scene.dispose();
      engine.dispose();
    };
  }, [carIdx, carData, controlState, isKeyboardControlEnabled, track]);

  return (
    <Box w={"70vw"}>
      <canvas ref={ref} style={{ width: "100%", height: "100%" }} />
    </Box>
  );
};

export default CarRace;
