import { Suspense, type FC } from "react";

import { Vector3 } from "@babylonjs/core";
import { Box } from "@chakra-ui/react";
import { Engine, Scene } from "react-babylonjs";

import CarModel from "./CarModel";


const CarAnim: FC = () => {
  return (
    <Box w="500px" h="300px">
      <Engine antialias adaptToDeviceRatio canvasId="babylonJS" width="500" height="300">
        <Suspense fallback={null}>
          <Scene>
            <arcRotateCamera
              name="camera"
              alpha={0}
              beta={Math.PI / 2}
              radius={13}
              target={Vector3.Zero()}
            />
            <hemisphericLight name="light" intensity={0.7} direction={Vector3.Up()} />
            <CarModel />
            {/* <Ground /> */}
          </Scene>
        </Suspense>
      </Engine>
    </Box>
  );
};

export default CarAnim;
