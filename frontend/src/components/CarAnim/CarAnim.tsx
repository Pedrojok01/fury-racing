import React, { useRef, useEffect } from "react";

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

import { useBabylon } from "@/hooks";

import "@babylonjs/loaders/glTF";

const carMetadata = [
  { path: "car1", scale: 1.0 },
  { path: "car2", scale: 1.25 },
];

const CarAnim = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const carNodesRef = useRef<TransformNode[]>([]);
  const { carIdx, incrementCarIdx, decrementCarIdx } = useBabylon();

  // Initialization
  useEffect(() => {
    // Initialize the engine.
    const engine = new Engine(ref.current, true);
    engine.resize();

    // Initialize the scene.
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 0); // Transparent background

    // Initialize the camera.
    const camera = new TargetCamera("camera1", new Vector3(0, 5, -12), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(true);

    // Initialize the light.
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // -- Load the car models.
    carMetadata.forEach((meta) => {
      SceneLoader.LoadAssetContainer(`./assets/${meta.path}/`, "scene.gltf", scene, (container) => {
        const car = new TransformNode("carRoot");
        // Assign the root node to imported mesh objects.
        container.meshes.forEach((mesh) => {
          if (!mesh.parent) {
            mesh.parent = car;
          }
        });
        car.scaling = new Vector3(meta.scale, meta.scale, meta.scale);

        // Collect the handle for that node.
        carNodesRef.current.push(car);
        console.log(carNodesRef);

        // Add the ndoe to the scene.
        container.addAllToScene();
      });
    });

    // Start engine/scene rendering process.
    engine.runRenderLoop(() => scene.render());

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
        <canvas ref={ref} style={{ width: "100%", height: "100%" }} />
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
