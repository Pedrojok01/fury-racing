import { useRef, useEffect, useMemo, type FC } from "react";

import {
  AbstractAssetTask,
  AnimationGroup,
  AssetsManager,
  AssetTaskState,
  Color3,
  DirectionalLight,
  Engine,
  HemisphericLight,
  KeyboardEventTypes,
  Mesh,
  MeshAssetTask,
  Observer,
  ParticleSystem,
  Scene,
  ShadowGenerator,
  Texture,
  TextureAssetTask,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

import { decorations, tracks } from "@/data";
import "@babylonjs/loaders/glTF";
import { useAnim, useGameStates } from "@/stores";

import { initializeCamera, initializeTrack, getCurrentTileAnim } from "./helper";
import { carAnimAccelRate, carAnimMaxRate, carRotateFactor, carThrottleFactor, gridTileSize } from "./helper/constants";

const CarRace: FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const targetNodeRef = useRef<TransformNode | null>(null);
  const animRef = useRef<AnimationGroup | null>(null);
  const animSpeedRef = useRef<number>(0);
  const animObserverRef = useRef<Observer<Scene> | null>(null);
  const { carIdx, carData, skybox, weatherFx } = useAnim();
  const { raceInfo } = useGameStates();
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

    // Load all the assets in one go.
    const assetTasks: Record<string, AbstractAssetTask> = {};
    const assetsManager = new AssetsManager(scene);

    // -- Track materials.
    assetTasks["texture_grid_empty"] = assetsManager.addTextureTask(
      `task_texture_grid_empty`,
      "assets/texture-grass.webp",
    );
    assetTasks["texture_grid_road_en"] = assetsManager.addTextureTask(
      `task_texture_grid_road_en`,
      "assets/texture-road-en.webp",
    );
    assetTasks["texture_grid_road_es"] = assetsManager.addTextureTask(
      `task_texture_grid_road_es`,
      "assets/texture-road-es.webp",
    );
    assetTasks["texture_grid_road_ew"] = assetsManager.addTextureTask(
      `task_texture_grid_road_ew`,
      "assets/texture-road-ew.webp",
    );
    assetTasks["texture_grid_road_ns"] = assetsManager.addTextureTask(
      `task_texture_grid_road_ns`,
      "assets/texture-road-ns.webp",
    );
    assetTasks["texture_grid_road_nw"] = assetsManager.addTextureTask(
      `task_texture_grid_road_nw`,
      "assets/texture-road-nw.webp",
    );
    assetTasks["texture_grid_road_sw"] = assetsManager.addTextureTask(
      `task_texture_grid_road_sw`,
      "assets/texture-road-sw.webp",
    );

    // -- Car.
    assetTasks["mesh_car"] = assetsManager.addMeshTask(`task_mesh_car`, "", `./assets/${carData.path}/`, "scene.gltf");

    // -- Decorations.
    decorations.forEach((decoration) => {
      assetTasks[`mesh_${decoration.path}`] = assetsManager.addMeshTask(
        `task_mesh_${decoration.path}`,
        "",
        `./assets/${decoration.path}/`,
        "scene.gltf",
      );
    });

    // -- Skybox texture.
    assetTasks["cube_texture_skybox"] = assetsManager.addCubeTextureTask(
      `task_cube_texture_${skybox}`,
      `/assets/skybox_${skybox}/skybox`,
    );

    // -- Rain particle texture.
    assetTasks["texture_rain"] = assetsManager.addTextureTask(`task_texture_rain`, "/assets/particle-rain.png");

    assetsManager.onTasksDoneObservable.add(function (tasks) {
      // Abort immediately if any error occurred.
      const errors = tasks.filter(function (task) {
        return task.taskState === AssetTaskState.ERROR;
      });

      if (errors.length > 0) {
        errors.forEach((error) => console.error("error", error));
        return;
      }

      // Initialize the sky box.
      const skyTexture = (assetTasks["cube_texture_skybox"] as TextureAssetTask).texture;
      scene.createDefaultSkybox(skyTexture, true, 10000);

      // Prepare track decorations.
      const decorationMeshes: Record<string, Mesh[]> = {};
      decorations.forEach((decoration) => {
        // Initialize our own parent mesh for this decoration.
        const decorationParentMesh = new Mesh(`${decoration.path}`, scene);

        // Process each loaded mesh...
        const meshTask = assetTasks[`mesh_${decoration.path}`] as MeshAssetTask;
        meshTask.loadedMeshes.forEach((mesh) => {
          // If the mesh is a root mesh...
          if (!mesh.parent) {
            // Apply the offset.
            mesh.position.x += decoration.offset.x;
            mesh.position.y += decoration.offset.y;
            mesh.position.z += decoration.offset.z;

            // Anchor to our own parent mesh.
            mesh.parent = decorationParentMesh;
          }
        });

        // Set the scaling and rotation on the whole object.
        decorationParentMesh.scaling = new Vector3(decoration.scale, decoration.scale, decoration.scale);
        decorationParentMesh.rotation.y = decoration.rotation.y;

        // Store reference to mesh array.
        decorationMeshes[decoration.path] = [decorationParentMesh, ...(meshTask.loadedMeshes as Mesh[])];
      });

      // Initialize the track.
      const gridTextures = [
        (assetTasks["texture_grid_empty"] as TextureAssetTask).texture,
        (assetTasks["texture_grid_road_en"] as TextureAssetTask).texture,
        (assetTasks["texture_grid_road_es"] as TextureAssetTask).texture,
        (assetTasks["texture_grid_road_ew"] as TextureAssetTask).texture,
        (assetTasks["texture_grid_road_ns"] as TextureAssetTask).texture,
        (assetTasks["texture_grid_road_nw"] as TextureAssetTask).texture,
        (assetTasks["texture_grid_road_sw"] as TextureAssetTask).texture,
      ];

      const trackInfo = initializeTrack(scene, track, gridTileSize, gridTextures, decorationMeshes);
      for (const key in decorationMeshes) {
        decorationMeshes[key].forEach((mesh) => (mesh.isVisible = false));
      }

      // Initialize lighting.
      // -- Global lighting.
      const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
      switch (skybox) {
        case "cloudy":
          light.intensity = 0.5;
          break;
        case "storm":
          light.intensity = 0.3;
          break;
        case "night":
          light.intensity = 0.1;
          break;
        default:
          light.intensity = 0.6;
          break;
      }

      // -- Light for shadows.
      const lightForShadows = new DirectionalLight("dir01", new Vector3(-1, -2, -1), scene);
      lightForShadows.position = new Vector3(
        (trackInfo["gridWidth"] * gridTileSize) / 2,
        400, // High in the sky.
        (trackInfo["gridHeight"] * gridTileSize) / 2,
      );

      lightForShadows.intensity = 0.3;

      // Initialize the car.
      const target = new TransformNode("target");
      const car = new TransformNode("car");
      (assetTasks["mesh_car"] as MeshAssetTask).loadedMeshes.forEach((mesh) => {
        mesh.position.x += carData.offset.x;
        mesh.position.y += carData.offset.y;
        mesh.position.z += carData.offset.z;

        if (!mesh.parent) {
          mesh.parent = car;
        }
      });

      car.scaling = new Vector3(carData.scale, carData.scale, carData.scale);
      car.position.y += 1.3; // Lift the car so that it sits on the road.

      // -- Group the adjusted car within a target object (for the camera).
      car.parent = target;

      // -- Place the car on the track.
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

      // -- Collect the handle for that node.
      targetNodeRef.current = target;

      // Initialize the camera.
      const camera = initializeCamera(scene, track, gridTileSize);
      // const cameraTarget = new AbstractMesh("cameraTarget", scene);
      const cameraTarget = new Mesh("cameraTarget", scene);
      cameraTarget.parent = target;
      cameraTarget.position.y = 5; // Have the camera aim a bit higher than the car.
      camera.lockedTarget = cameraTarget;

      // Initialize the weather effect.
      switch (weatherFx) {
        case "fog":
          scene.fogMode = Scene.FOGMODE_EXP;
          scene.fogColor = new Color3(0.5, 0.5, 0.6);
          scene.fogDensity = 0.01;
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
              particleSystem.emitter.x = camera.position.x + 0.6 * (target.position.x - camera.position.x);
              particleSystem.emitter.y = camera.position.y + 14;
              particleSystem.emitter.z = camera.position.z + 0.6 * (target.position.z - camera.position.z);
            }
          });
          break;
      }

      // Initialize shadows.
      const shadowGenerator = new ShadowGenerator(1024, lightForShadows);

      // -- Car shadow.
      (assetTasks["mesh_car"] as MeshAssetTask).loadedMeshes.forEach((mesh) => {
        shadowGenerator.addShadowCaster(mesh);
      });

      // -- Decoration shadows. Disabled for now. Costs too much performance.
      // trackInfo.decoCloneMeshes.forEach((mesh) => {
      //   shadowGenerator.addShadowCaster(mesh);
      // });

      shadowGenerator.useExponentialShadowMap = true;
      trackInfo["tiledGround"].receiveShadows = true;

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

      // Configure animation.
      animSpeedRef.current = 0;
      const triggerCurrentTileAnim = () => {
        animRef.current = getCurrentTileAnim(track, target);
        animRef.current.speedRatio = animSpeedRef.current;

        let animEndCallbackInvoked = false;
        animRef.current.onAnimationEndObservable.add(() => {
          if (!animEndCallbackInvoked) {
            triggerCurrentTileAnim();
            animEndCallbackInvoked = true;
          }
        });

        animRef.current.play();
      };

      // Trigger animation process, if applicable.
      if (!isKeyboardControlEnabled) {
        setTimeout(() => triggerCurrentTileAnim(), 4000); // How long to wait before the car starts moving.
      }

      // Start engine/scene rendering process.
      engine.runRenderLoop(() => scene.render());
    });

    // Begin the loading process.
    assetsManager.load();

    // Cleanup when component unmounts.
    return () => {
      engine.stopRenderLoop();
      scene.dispose();
      engine.dispose();
    };
  }, [carIdx, carData, skybox, weatherFx, controlState, isKeyboardControlEnabled, track]);

  useEffect(() => {
    // Abort if the scene isn't set up yet.
    if (!ref.current || !sceneRef.current) return;

    // Implement acceleration/deceleration.
    if (animObserverRef.current) sceneRef.current.onBeforeRenderObservable.remove(animObserverRef.current);
    animObserverRef.current = sceneRef.current.onBeforeRenderObservable.add(() => {
      // Abort if no animation is ongoing yet.
      if (!animRef.current) return;

      const hasRaceFinished = raceInfo && raceInfo.player1Time !== 0 && raceInfo.player2Time !== 0;
      if (!hasRaceFinished) {
        if (animSpeedRef.current < carAnimMaxRate) {
          animSpeedRef.current += carAnimAccelRate;
          animRef.current.speedRatio = animSpeedRef.current;
        }
      } else {
        if (animSpeedRef.current > 0) {
          animSpeedRef.current = Math.max(0, animSpeedRef.current - carAnimAccelRate * 2);
          animRef.current.speedRatio = animSpeedRef.current;
        }
      }
    });
  }, [raceInfo]);

  return <canvas ref={ref} style={{ width: "100%", height: "100%" }} />;
};

export default CarRace;
