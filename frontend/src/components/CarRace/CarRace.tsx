import React, { useRef, useEffect } from "react";

import {
  AbstractMesh,
  Animation,
  AnimationGroup,
  Engine,
  FollowCamera,
  KeyboardEventTypes,
  MeshBuilder,
  MultiMaterial,
  Scene,
  SceneLoader,
  SubMesh,
  Texture,
  HemisphericLight,
  TransformNode,
  Vector3,
  StandardMaterial,
} from "@babylonjs/core";
import { Box } from "@chakra-ui/react";

import { carMetadata, trackEaglesCanyonRaceway, trackMonaco } from "@/data/game";
import { useBabylon } from "@/hooks";

import "@babylonjs/loaders/glTF";

const gridTileSize = 28;
const carRotateFactor = 0.015;
const carThrottleFactor = 0.5;
const carAnimNumFrames = 2;

const createCarAnim = (property, keyframes) => {
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

const triggerCurrentTileAnim = (scene, track, car) => {
  // Determine in which direction the car is facing.
  let carDirection;
  const rotationFactorX = Math.sin(car.rotation.y);
  const rotationFactorZ = Math.cos(car.rotation.y);

  if (Math.abs(rotationFactorX) > Math.abs(rotationFactorZ)) {
    carDirection = rotationFactorX <= 0 ? "west" : "east";
  } else {
    carDirection = rotationFactorZ <= 0 ? "south" : "north";
  }

  // Determine on which tile the car currently is.
  const carTileX = Math.floor(
    (car.position.x +
      (carDirection === "east"
        ? gridTileSize / 2
        : carDirection === "west"
          ? -(gridTileSize / 2)
          : 0)) /
      gridTileSize,
  );

  const carTileY = Math.floor(
    (car.position.z +
      (carDirection === "north"
        ? gridTileSize / 2
        : carDirection === "south"
          ? -(gridTileSize / 2)
          : 0)) /
      gridTileSize,
  );

  const tileRows = track.tiles.trim().split(/\r?\n|\r|\n/g);
  const tileRow = tileRows[tileRows.length - 1 - carTileY].trim();
  const tileChar = tileRow[carTileX];

  // Initiate an animation that takes the car to the next tile.
  const animationGroup = new AnimationGroup("car");
  animationGroup.speedRatio = 2.0;

  switch (tileChar) {
    case "─":
      switch (carDirection) {
        case "east":
          animationGroup.addTargetedAnimation(
            createCarAnim("position.x", [
              {
                frame: 0,
                value: car.position.x,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.x + gridTileSize,
              },
            ]),
            car,
          );
          break;

        case "west":
          animationGroup.addTargetedAnimation(
            createCarAnim("position.x", [
              {
                frame: 0,
                value: car.position.x,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.x - gridTileSize,
              },
            ]),
            car,
          );
          break;
      }
      break;

    case "│":
      switch (carDirection) {
        case "north":
          animationGroup.addTargetedAnimation(
            createCarAnim("position.z", [
              {
                frame: 0,
                value: car.position.z,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.z + gridTileSize,
              },
            ]),
            car,
          );
          break;

        case "south":
          animationGroup.addTargetedAnimation(
            createCarAnim("position.z", [
              {
                frame: 0,
                value: car.position.z,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.z - gridTileSize,
              },
            ]),
            car,
          );
          break;
      }
      break;

    case "┌":
      switch (carDirection) {
        case "north":
          animationGroup.addTargetedAnimation(
            createCarAnim("position.x", [
              {
                frame: 0,
                value: car.position.x,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.x + gridTileSize / 2,
              },
            ]),
            car,
          );

          animationGroup.addTargetedAnimation(
            createCarAnim("position.z", [
              {
                frame: 0,
                value: car.position.z,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.z + gridTileSize / 2,
              },
            ]),
            car,
          );

          animationGroup.addTargetedAnimation(
            createCarAnim("rotation.y", [
              {
                frame: 0,
                value: car.rotation.y,
              },
              {
                frame: carAnimNumFrames,
                value: car.rotation.y + Math.PI / 2,
              },
            ]),
            car,
          );
          break;

        case "west":
          animationGroup.addTargetedAnimation(
            createCarAnim("position.x", [
              {
                frame: 0,
                value: car.position.x,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.x - gridTileSize / 2,
              },
            ]),
            car,
          );

          animationGroup.addTargetedAnimation(
            createCarAnim("position.z", [
              {
                frame: 0,
                value: car.position.z,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.z - gridTileSize / 2,
              },
            ]),
            car,
          );

          animationGroup.addTargetedAnimation(
            createCarAnim("rotation.y", [
              {
                frame: 0,
                value: car.rotation.y,
              },
              {
                frame: carAnimNumFrames,
                value: car.rotation.y - Math.PI / 2,
              },
            ]),
            car,
          );
          break;
      }
      break;

    case "┐":
      switch (carDirection) {
        case "north":
          animationGroup.addTargetedAnimation(
            createCarAnim("position.x", [
              {
                frame: 0,
                value: car.position.x,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.x - gridTileSize / 2,
              },
            ]),
            car,
          );

          animationGroup.addTargetedAnimation(
            createCarAnim("position.z", [
              {
                frame: 0,
                value: car.position.z,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.z + gridTileSize / 2,
              },
            ]),
            car,
          );

          animationGroup.addTargetedAnimation(
            createCarAnim("rotation.y", [
              {
                frame: 0,
                value: car.rotation.y,
              },
              {
                frame: carAnimNumFrames,
                value: car.rotation.y - Math.PI / 2,
              },
            ]),
            car,
          );
          break;

        case "east":
          animationGroup.addTargetedAnimation(
            createCarAnim("position.x", [
              {
                frame: 0,
                value: car.position.x,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.x + gridTileSize / 2,
              },
            ]),
            car,
          );

          animationGroup.addTargetedAnimation(
            createCarAnim("position.z", [
              {
                frame: 0,
                value: car.position.z,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.z - gridTileSize / 2,
              },
            ]),
            car,
          );

          animationGroup.addTargetedAnimation(
            createCarAnim("rotation.y", [
              {
                frame: 0,
                value: car.rotation.y,
              },
              {
                frame: carAnimNumFrames,
                value: car.rotation.y + Math.PI / 2,
              },
            ]),
            car,
          );
          break;
      }
      break;

    case "└":
      switch (carDirection) {
        case "south":
          animationGroup.addTargetedAnimation(
            createCarAnim("position.x", [
              {
                frame: 0,
                value: car.position.x,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.x + gridTileSize / 2,
              },
            ]),
            car,
          );

          animationGroup.addTargetedAnimation(
            createCarAnim("position.z", [
              {
                frame: 0,
                value: car.position.z,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.z - gridTileSize / 2,
              },
            ]),
            car,
          );

          animationGroup.addTargetedAnimation(
            createCarAnim("rotation.y", [
              {
                frame: 0,
                value: car.rotation.y,
              },
              {
                frame: carAnimNumFrames,
                value: car.rotation.y - Math.PI / 2,
              },
            ]),
            car,
          );
          break;

        case "west":
          animationGroup.addTargetedAnimation(
            createCarAnim("position.x", [
              {
                frame: 0,
                value: car.position.x,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.x - gridTileSize / 2,
              },
            ]),
            car,
          );

          animationGroup.addTargetedAnimation(
            createCarAnim("position.z", [
              {
                frame: 0,
                value: car.position.z,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.z + gridTileSize / 2,
              },
            ]),
            car,
          );

          animationGroup.addTargetedAnimation(
            createCarAnim("rotation.y", [
              {
                frame: 0,
                value: car.rotation.y,
              },
              {
                frame: carAnimNumFrames,
                value: car.rotation.y + Math.PI / 2,
              },
            ]),
            car,
          );
          break;
      }
      break;

    case "┘":
      switch (carDirection) {
        case "south":
          animationGroup.addTargetedAnimation(
            createCarAnim("position.x", [
              {
                frame: 0,
                value: car.position.x,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.x - gridTileSize / 2,
              },
            ]),
            car,
          );

          animationGroup.addTargetedAnimation(
            createCarAnim("position.z", [
              {
                frame: 0,
                value: car.position.z,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.z - gridTileSize / 2,
              },
            ]),
            car,
          );

          animationGroup.addTargetedAnimation(
            createCarAnim("rotation.y", [
              {
                frame: 0,
                value: car.rotation.y,
              },
              {
                frame: carAnimNumFrames,
                value: car.rotation.y + Math.PI / 2,
              },
            ]),
            car,
          );
          break;

        case "east":
          animationGroup.addTargetedAnimation(
            createCarAnim("position.x", [
              {
                frame: 0,
                value: car.position.x,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.x + gridTileSize / 2,
              },
            ]),
            car,
          );

          animationGroup.addTargetedAnimation(
            createCarAnim("position.z", [
              {
                frame: 0,
                value: car.position.z,
              },
              {
                frame: carAnimNumFrames,
                value: car.position.z + gridTileSize / 2,
              },
            ]),
            car,
          );

          animationGroup.addTargetedAnimation(
            createCarAnim("rotation.y", [
              {
                frame: 0,
                value: car.rotation.y,
              },
              {
                frame: carAnimNumFrames,
                value: car.rotation.y - Math.PI / 2,
              },
            ]),
            car,
          );
          break;
      }
      break;
  }

  let animEndCallbackInvoked = false;
  animationGroup.onAnimationEndObservable.add(() => {
    // Make sure to only invoke the callback once, as the observable may trigger
    // multiple times if the animation group contains multiple animations.
    if (!animEndCallbackInvoked) {
      triggerCurrentTileAnim(scene, track, car);
      animEndCallbackInvoked = true;
    }
  });

  animationGroup.play();
};

const CarRace = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const carNodeRef = useRef<TransformNode | null>(null);
  const { carIdx } = useBabylon();
  const track = trackMonaco;
  //trackEaglesCanyonRaceway;

  const isKeyboardControlEnabled = false;
  const controlState = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  // Initialization
  useEffect(() => {
    // Initialize the engine.
    const engine = new Engine(ref.current, true);
    engine.resize();

    // Initialize the scene.
    const scene = new Scene(engine);

    // Initialize the light.
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Initialize the track.
    const gridWidth = track.tiles.trim().split(/\r?\n|\r|\n/g)[0].length;
    const gridHeight = track.tiles.trim().split(/\r?\n|\r|\n/g).length;

    // -- Create the ground mesh as a grid.
    const tiledGround = new MeshBuilder.CreateTiledGround("track", {
      xmin: 0,
      zmin: 0,
      xmax: gridWidth * gridTileSize,
      zmax: gridHeight * gridTileSize,
      subdivisions: {
        w: gridWidth,
        h: gridHeight,
      },
    });

    // -- Create the texture materials.
    const emptyMaterial = new StandardMaterial("empty");
    emptyMaterial.diffuseTexture = new Texture("assets/texture-grass.png");

    const roadEnMaterial = new StandardMaterial("road");
    roadEnMaterial.diffuseTexture = new Texture("assets/texture-road-en.png");

    const roadEsMaterial = new StandardMaterial("road");
    roadEsMaterial.diffuseTexture = new Texture("assets/texture-road-es.png");

    const roadEwMaterial = new StandardMaterial("road");
    roadEwMaterial.diffuseTexture = new Texture("assets/texture-road-ew.png");

    const roadNsMaterial = new StandardMaterial("road");
    roadNsMaterial.diffuseTexture = new Texture("assets/texture-road-ns.png");

    const roadNwMaterial = new StandardMaterial("road");
    roadNwMaterial.diffuseTexture = new Texture("assets/texture-road-nw.png");

    const roadSwMaterial = new StandardMaterial("road");
    roadSwMaterial.diffuseTexture = new Texture("assets/texture-road-sw.png");

    const multimat = new MultiMaterial("multi", scene);
    multimat.subMaterials.push(emptyMaterial); // 0
    multimat.subMaterials.push(roadEnMaterial); // 1
    multimat.subMaterials.push(roadEsMaterial); // 2
    multimat.subMaterials.push(roadEwMaterial); // 3
    multimat.subMaterials.push(roadNsMaterial); // 4
    multimat.subMaterials.push(roadNwMaterial); // 5
    multimat.subMaterials.push(roadSwMaterial); // 6
    tiledGround.material = multimat;

    // -- Apply the textures.
    const verticesCount = tiledGround.getTotalVertices();
    const tileIndicesLength = tiledGround.getIndices().length / (gridWidth * gridHeight);

    tiledGround.subMeshes = [];
    let base = 0;
    const tileRows = track.tiles.trim().split(/\r?\n|\r|\n/g);
    for (let row = gridHeight - 1; row >= 0; row--) {
      const tileRow = tileRows[row].trim();
      for (let col = 0; col < tileRow.length; col++) {
        const tileChar = tileRow[col];
        let materialIndex;
        switch (tileChar) {
          default:
            materialIndex = 0;
            break;
          case "─":
            materialIndex = 3;
            break;
          case "│":
            materialIndex = 4;
            break;
          case "┌":
            materialIndex = 2;
            break;
          case "┐":
            materialIndex = 6;
            break;
          case "└":
            materialIndex = 1;
            break;
          case "┘":
            materialIndex = 5;
            break;
        }

        tiledGround.subMeshes.push(
          new SubMesh(materialIndex, 0, verticesCount, base, tileIndicesLength, tiledGround),
        );
        base += tileIndicesLength;
      }
    }

    // Initialize the camera.
    const camera = new FollowCamera(
      "camera1",
      new Vector3((gridWidth * gridTileSize) / 2, 5, (gridHeight * gridTileSize) / 2),
      scene,
    );

    camera.radius = 24; // The goal distance of camera from target
    camera.heightOffset = 6; // The goal height of camera above local origin (centre) of target
    camera.rotationOffset = 180; // The goal rotation of camera around local origin (centre) of target in x y plane
    camera.cameraAcceleration = 0.025; // Acceleration of camera in moving from current to goal position
    camera.maxCameraSpeed = 10; // The speed at which acceleration is halted

    camera.lowerHeightOffsetLimit = -1; // Prevent setting camera angle below the road.
    camera.upperHeightOffsetLimit = 24; // Prevent setting camera angle too far high.

    camera.attachControl(true);
    camera.inputs.attached.keyboard.detachControl();

    // Load and place the car model.
    const meta = carMetadata[carIdx];
    const car = new TransformNode("carRoot");
    SceneLoader.LoadAssetContainer(`./assets/${meta.path}/`, "scene.gltf", scene, (container) => {
      // Assign the root node to imported mesh objects.
      container.meshes.forEach((mesh) => {
        mesh.position.x += meta.offset.x;
        mesh.position.y += meta.offset.y;
        mesh.position.z += meta.offset.z;

        if (!mesh.parent) {
          mesh.parent = car;
        }
      });

      car.scaling = new Vector3(meta.scale, meta.scale, meta.scale);

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
    });

    // Implement keyboard input logic (to drive car).
    scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          switch (kbInfo.event.key) {
            case "ArrowLeft":
              controlState.left = true;
              break;
            case "ArrowRight":
              controlState.right = true;
              break;
            case "ArrowUp":
              controlState.up = true;
              break;
            case "ArrowDown":
              controlState.down = true;
              break;
          }
          break;

        case KeyboardEventTypes.KEYUP:
          switch (kbInfo.event.key) {
            case "ArrowLeft":
              controlState.left = false;
              break;
            case "ArrowRight":
              controlState.right = false;
              break;
            case "ArrowUp":
              controlState.up = false;
              break;
            case "ArrowDown":
              controlState.down = false;
              break;
          }
          break;
      }
    });

    // Start engine/scene rendering process.
    engine.runRenderLoop(() => scene.render());

    scene.onBeforeRenderObservable.add(() => {
      // Modify the car's position based on keyboard controls.
      if (!isKeyboardControlEnabled) return;

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

    // Update references and initialization flag.
    engineRef.current = engine;
    sceneRef.current = scene;

    // Cleanup when component unmounts.
    return () => {
      engine.stopRenderLoop();
      scene.dispose();
      engine.dispose();
    };
  }, []);

  return (
    <Box w={"70vw"}>
      <canvas ref={ref} style={{ width: "100%", height: "100%" }} />
    </Box>
  );
};

export default CarRace;
