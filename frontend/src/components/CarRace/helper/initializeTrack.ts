import {
  MeshBuilder,
  MultiMaterial,
  StandardMaterial,
  SubMesh,
  Texture,
  type Scene,
} from "@babylonjs/core";

/**
 * Helper function to create a StandardMaterial with a texture.
 * @param name - The name of the material.
 * @param texturePath - The path to the texture image.
 * @param scene - The Babylon.js scene.
 * @returns The created StandardMaterial.
 */
const createMaterial = (name: string, texturePath: string, scene: Scene): StandardMaterial => {
  const material = new StandardMaterial(name, scene);
  material.diffuseTexture = new Texture(texturePath, scene);
  return material;
};

/**
 * Initializes the track in the given scene based on the provided track configuration.
 * @param scene - The Babylon.js scene.
 * @param track - The track configuration.
 * @param gridTileSize - The size of each grid tile.
 */
export const initializeTrack = (scene: Scene, track: TrackAnim, gridTileSize: number) => {
  const tileRows = track.tiles.trim().split(/\r?\n|\r|\n/g);
  const gridWidth = track.tiles.trim().split(/\r?\n|\r|\n/g)[0].length;
  const gridHeight = track.tiles.trim().split(/\r?\n|\r|\n/g).length;

  const tiledGround = MeshBuilder.CreateTiledGround("track", {
    xmin: 0,
    zmin: 0,
    xmax: gridWidth * gridTileSize,
    zmax: gridHeight * gridTileSize,
    subdivisions: { w: gridWidth, h: gridHeight },
  });

  const materials = {
    empty: createMaterial("empty", "assets/texture-grass.png", scene),
    roadEn: createMaterial("roadEn", "assets/texture-road-en.png", scene),
    roadEs: createMaterial("roadEs", "assets/texture-road-es.png", scene),
    roadEw: createMaterial("roadEw", "assets/texture-road-ew.png", scene),
    roadNs: createMaterial("roadNs", "assets/texture-road-ns.png", scene),
    roadNw: createMaterial("roadNw", "assets/texture-road-nw.png", scene),
    roadSw: createMaterial("roadSw", "assets/texture-road-sw.png", scene),
  };

  const multimat = new MultiMaterial("multi", scene);
  multimat.subMaterials.push(materials.empty);
  multimat.subMaterials.push(materials.roadEn);
  multimat.subMaterials.push(materials.roadEs);
  multimat.subMaterials.push(materials.roadEw);
  multimat.subMaterials.push(materials.roadNs);
  multimat.subMaterials.push(materials.roadNw);
  multimat.subMaterials.push(materials.roadSw);
  tiledGround.material = multimat;

  const verticesCount = tiledGround.getTotalVertices();
  const indices = tiledGround.getIndices();

  if (!indices) {
    throw new Error("Failed to get indices from tiledGround");
  }

  const tileIndicesLength = indices.length / (gridWidth * gridHeight);
  tiledGround.subMeshes = [];

  const materialIndexMap: { [key: string]: number } = {
    "└": 1,
    "┌": 2,
    "─": 3,
    "│": 4,
    "┘": 5,
    "┐": 6,
  };

  let base = 0;
  for (let row = gridHeight - 1; row >= 0; row--) {
    const tileRow = tileRows[row].trim();
    for (let col = 0; col < tileRow.length; col++) {
      const tileChar = tileRow[col];
      const materialIndex = materialIndexMap[tileChar] || 0;

      tiledGround.subMeshes.push(
        new SubMesh(materialIndex, 0, verticesCount, base, tileIndicesLength, tiledGround),
      );
      base += tileIndicesLength;
    }
  }
};
