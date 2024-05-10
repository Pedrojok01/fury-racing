import { useRef, useState, type FC } from "react";

import { Vector3, Color3, Mesh } from "@babylonjs/core";
import { Engine, Scene, useBeforeRender, useClick, useHover } from "react-babylonjs";

const DefaultScale = new Vector3(1, 1, 1);
const BiggerScale = new Vector3(1.25, 1.25, 1.25);

const CarSpin: FC = () => {
  const boxRef = useRef<Mesh | null>(null);

  const [clicked, setClicked] = useState(false);
  useClick(() => setClicked((clicked) => !clicked), boxRef);

  const [hovered, setHovered] = useState(false);
  useHover(
    () => setHovered(true),
    () => setHovered(false),
    boxRef,
  );

  // This will rotate the box on every Babylon frame.
  const rpm = 5;
  useBeforeRender((scene) => {
    if (boxRef.current) {
      // Delta time smoothes the animation.
      const deltaTimeInMillis = scene.getEngine().getDeltaTime();
      boxRef.current.rotation.y += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
    }
  });

  return (
    <Engine antialias adaptToDeviceRatio canvasId="babylonJS">
      <Scene>
        <arcRotateCamera
          name="camera1"
          target={Vector3.Zero()}
          alpha={Math.PI / 2}
          beta={Math.PI / 4}
          radius={8}
        />
        <hemisphericLight name="light1" intensity={0.7} direction={Vector3.Up()} />
        <box
          name={"CAR"}
          ref={boxRef}
          size={2}
          position={new Vector3(0, 1, 0)}
          scaling={clicked ? BiggerScale : DefaultScale}
        >
          <standardMaterial
            name={"CAR"}
            diffuseColor={hovered ? Color3.Red() : Color3.Blue()}
            specularColor={Color3.Black()}
          />
        </box>
      </Scene>
    </Engine>
  );
};

export default CarSpin;
