import { useEffect, type FC } from "react";

import { MeshBuilder } from "@babylonjs/core";
import { useScene } from "react-babylonjs";

const Ground: FC = () => {
  const scene = useScene();

  useEffect(() => {
    if (scene) {
      MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);
    }
  }, [scene]);

  return null;
};

export default Ground;
