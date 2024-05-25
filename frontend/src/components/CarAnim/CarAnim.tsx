import React, { useRef, useEffect, type FC } from "react";

import {
  Engine,
  Scene,
  SceneLoader,
  TargetCamera,
  HemisphericLight,
  TransformNode,
  Vector3,
  Color4,
} from "@babylonjs/core";
import { Button, VStack, HStack, Box } from "@chakra-ui/react";

import { carMetadata } from "@/data/cars";
import "@babylonjs/loaders/glTF";
import { useAnim } from "@/stores";

import { CustomToolTip } from "../CustomToolTip";

const CarAnim: FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const carNodesRef = useRef<TransformNode[]>([]);
  const { carIdx, carData, incrementCarIdx, decrementCarIdx } = useAnim();

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
    scene.clearColor = new Color4(0, 0, 0, 0); // Transparent background

    // Initialize the camera.
    const camera = new TargetCamera("camera1", new Vector3(0, 5, -13), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(true);

    // Initialize the light.
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Load the car models.
    carMetadata.forEach((meta) => {
      // console.log("Loading car model:", meta);
      SceneLoader.LoadAssetContainer(`./assets/${meta.path}/`, "scene.gltf", scene, (container) => {
        const car = new TransformNode(`${meta.path}`);

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

        // Collect the handle for that node.
        carNodesRef.current.push(car);

        // Add the node to the scene.
        container.addAllToScene();

        // If we finished loading the last car...
        if (carNodesRef.current.length === carMetadata.length) {
          // Sort the array at the end, to ensure order is preserved, as loading
          // assets is performed asynchronously and some models will load faster
          // than others.
          carNodesRef.current.sort((firstNode, secondNode) => firstNode.name.localeCompare(secondNode.name));

          // Start engine/scene rendering process.
          engine.runRenderLoop(() => scene.render());
        }
      });
    });

    // Cleanup when component unmounts.
    return () => {
      engine.stopRenderLoop();
      scene.dispose();
      engine.dispose();
    };
  }, []);

  // Handle car visibility and rotation
  useEffect(() => {
    // Define the rendering loop.
    const observer = sceneRef.current?.onBeforeRenderObservable.add(() => {
      // For each car model...
      carNodesRef.current.forEach((car, index) => {
        // Make the mesh visible/invisible based on status.
        car.setEnabled(index === carIdx);

        // Rotate the car slowly.
        const deltaTimeInMillis = engineRef.current?.getDeltaTime() ?? 0;
        car.rotation.y += 0.0002 * deltaTimeInMillis;
      });
    });

    return () => {
      if (observer && sceneRef.current) {
        sceneRef.current.onBeforeRenderObservable.remove(observer);
      }
    };
  }, [carIdx]);

  return (
    <VStack justify={"center"} align={"center"} w={"100%"}>
      <Box w={"34rem"} h={"17rem"}>
        <CustomToolTip label={carData.description}>
          <canvas ref={ref} style={{ width: "100%", height: "100%" }} />
        </CustomToolTip>
      </Box>
      <HStack>
        <Button onClick={incrementCarIdx} size="sm">
          Prev
        </Button>
        <Button onClick={decrementCarIdx} size="sm">
          Next
        </Button>
      </HStack>
    </VStack>
  );
};

export default CarAnim;
