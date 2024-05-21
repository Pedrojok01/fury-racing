import React, { useRef, useEffect, useMemo, type FC } from "react";

import {
  AbstractMesh,
  Color3,
  CubeTexture,
  DirectionalLight,
  Engine,
  HemisphericLight,
  KeyboardEventTypes,
  ParticleSystem,
  Scene,
  SceneLoader,
  ShadowGenerator,
  Texture,
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
  const targetNodeRef = useRef<TransformNode | null>(null);
  const { carIdx, carData, skybox, weatherFx } = useAnim();
  const track = tracks[0].animData;
  const isKeyboardControlEnabled = false;

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

    // Initialize the camera.
    const camera = initializeCamera(scene, track, gridTileSize);

    // Initialize the sky box.
    const skyTexture = new CubeTexture(`/assets/skybox_${skybox}/skybox`, scene);
    scene.createDefaultSkybox(skyTexture, true, 10000);

    // Initialize the track.
    const trackInfo = initializeTrack(scene, track, gridTileSize);

    // Initialize lighting.
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    switch (skybox) {
      default:
        light.intensity = 0.6;
        break;
      case "cloudy":
        light.intensity = 0.5;
        break;
      case "storm":
        light.intensity = 0.3;
        break;
      case "night":
        light.intensity = 0.1;
        break;
    }

    const lightForShadows = new DirectionalLight("dir01", new Vector3(-1, -2, -1), scene);
    lightForShadows.position = new Vector3(
      (trackInfo["gridWidth"] * gridTileSize) / 2,
      40, // High in the sky.
      (trackInfo["gridHeight"] * gridTileSize) / 2,
    );

    lightForShadows.intensity = 0.3;

    // Load and place the car model.
    const target = new TransformNode("target");
    const car = new TransformNode("car");
    SceneLoader.LoadAssetContainer(
      `./assets/${carData.path}/`,
      "scene.gltf",
      scene,
      (container) => {
        // Adjust the loaded meshes.
        container.meshes.forEach((mesh) => {
          mesh.position.x += carData.offset.x;
          mesh.position.y += carData.offset.y;
          mesh.position.z += carData.offset.z;

          if (!mesh.parent) {
            mesh.parent = car;
          }
        });

        car.scaling = new Vector3(carData.scale, carData.scale, carData.scale);
        car.position.y += 1.3; // Lift the car so that it sits on the road.

        // Group the adjusted car within a camera target object.
        car.parent = target;

        // Place the car on the track.
        target.position.x += track.startPosition.x * gridTileSize;
        target.position.z += track.startPosition.y * gridTileSize;
        switch (track.startPosition.direction) {
          case "north":
            target.position.x += gridTileSize / 2;
            break;

          case "south":
            target.position.x += gridTileSize / 2;
            target.rotation.y += Math.PI;
            break;

          case "west":
            target.position.x += gridTileSize;
            target.position.z += gridTileSize / 2;
            target.rotation.y += 1.5 * Math.PI;
            break;

          case "east":
            target.position.z += gridTileSize / 2;
            target.rotation.y += 0.5 * Math.PI;
            break;
        }

        // Collect the handle for that node.
        targetNodeRef.current = target;

        // Add the node to the scene.
        container.addAllToScene();

        // Update camera target.
        const cameraTarget = new AbstractMesh("cameraTarget", scene);
        cameraTarget.parent = target;
        cameraTarget.position.y = 5; // Have the camera aim a bit higher than the car.
        camera.lockedTarget = cameraTarget;

        if (!isKeyboardControlEnabled) {
          // Trigger animation process.
          triggerCurrentTileAnim(scene, track, target);
        }

        // Initialize the weather effect.
        switch (weatherFx) {
          case "fog":
            scene.fogMode = Scene.FOGMODE_EXP;
            scene.fogColor = new Color3(0.5, 0.5, 0.6);
            scene.fogDensity = 0.0125;
            break;

          case "rain":
            const particleSystem = new ParticleSystem("rain", 4000, scene);

            particleSystem.particleTexture = new Texture("/assets/particle-rain.png");
            particleSystem.emitter = new Vector3(0, 0, 0);
            particleSystem.createCylinderEmitter(15, 0, 1, 0);
            particleSystem.emitRate = 400;
            particleSystem.updateSpeed = 0.05;
            particleSystem.minLifeTime = 4;
            particleSystem.maxLifeTime = 4;
            particleSystem.gravity = new Vector3(0, -20, 0);

            particleSystem.minSize = 0.35;
            particleSystem.maxSize = 0.4;

            particleSystem.minScaleX = 0.1;
            particleSystem.maxScaleX = 0.15;

            particleSystem.minScaleY = 1;
            particleSystem.maxScaleY = 1;

            particleSystem.start();

            scene.onBeforeRenderObservable.add(() => {
              // Make the emitter follow the camera.
              if (particleSystem.emitter instanceof Vector3) {
                particleSystem.emitter.x =
                  camera.position.x + 0.6 * (target.position.x - camera.position.x);
                particleSystem.emitter.y = camera.position.y + 14;
                particleSystem.emitter.z =
                  camera.position.z + 0.6 * (target.position.z - camera.position.z);
              }
            });
            break;
        }

        // Initialize shadows.
        const shadowGenerator = new ShadowGenerator(1024, lightForShadows);
        container.meshes.forEach((mesh) => shadowGenerator.addShadowCaster(mesh));
        shadowGenerator.useExponentialShadowMap = true;
        trackInfo["tiledGround"].receiveShadows = true;
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
      if (!isKeyboardControlEnabled || !targetNodeRef.current) return;

      const target = targetNodeRef.current;

      // -- Rotation.
      const isRotatingLeft = controlState.left && !controlState.right;
      const isRotatingRight = controlState.right && !controlState.left;
      if (isRotatingLeft) {
        target.rotation.y += -carRotateFactor;
      } else if (isRotatingRight) {
        target.rotation.y += carRotateFactor;
      }

      // -- Throttle.
      const isThrottlingForward = controlState.up && !controlState.down;
      const isThrottlingBackward = controlState.down && !controlState.up;
      if (isThrottlingForward) {
        target.position.x += Math.sin(target.rotation.y) * carThrottleFactor;
        target.position.z += Math.cos(target.rotation.y) * carThrottleFactor;
      } else if (isThrottlingBackward) {
        target.position.x += Math.sin(target.rotation.y) * -carThrottleFactor;
        target.position.z += Math.cos(target.rotation.y) * -carThrottleFactor;
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
  }, [carIdx, carData, skybox, weatherFx, controlState, isKeyboardControlEnabled, track]);

  return (
    <Box w={"70vw"}>
      <canvas ref={ref} style={{ width: "100%", height: "100%" }} />
    </Box>
  );
};

export default CarRace;
