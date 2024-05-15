import { FollowCamera, Vector3, type Scene } from "@babylonjs/core";

export const initializeCamera = (scene: Scene, track: TrackAnim, gridTileSize: number) => {
  const gridWidth = track.tiles.trim().split(/\r?\n|\r|\n/g)[0].length;
  const gridHeight = track.tiles.trim().split(/\r?\n|\r|\n/g).length;

  const camera = new FollowCamera(
    "camera1",
    new Vector3((gridWidth * gridTileSize) / 2, 5, (gridHeight * gridTileSize) / 2),
    scene,
  );

  camera.radius = 24;
  camera.heightOffset = 6;
  camera.rotationOffset = 180;
  camera.cameraAcceleration = 0.025;
  camera.maxCameraSpeed = 10;
  camera.lowerHeightOffsetLimit = -1;
  camera.upperHeightOffsetLimit = 24;

  camera.attachControl(true);
  camera.inputs.attached.keyboard.detachControl();

  return camera;
};
