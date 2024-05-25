import { Mesh, MeshBuilder, MultiMaterial, StandardMaterial, SubMesh, Texture, type Scene } from "@babylonjs/core";

/**
 * Helper function to create a StandardMaterial with a texture.
 * @param name - The name of the material.
 * @param texturePath - The path to the texture image.
 * @param scene - The Babylon.js scene.
 * @returns The created StandardMaterial.
 */
const createMaterial = (name: string, texture: Texture, scene: Scene): StandardMaterial => {
  const material = new StandardMaterial(name, scene);
  material.diffuseTexture = texture;
  return material;
};

/**
 * Initializes the track in the given scene based on the provided track configuration.
 * @param scene - The Babylon.js scene.
 * @param track - The track configuration.
 * @param gridTileSize - The size of each grid tile.
 * @param gridTextures - The textures for ground tiles.
 * @param decorationMeshes - The map of track decoration meshes.
 */
export const initializeTrack = (
  scene: Scene,
  track: TrackAnim,
  gridTileSize: number,
  gridTextures: Texture[],
  decorationMeshes: Record<string, Mesh[]>,
) => {
  const tileRows = track.tiles.trim().split(/\r?\n|\r|\n/g);
  const gridWidth = track.tiles.trim().split(/\r?\n|\r|\n/g)[0].length;
  const gridHeight = track.tiles.trim().split(/\r?\n|\r|\n/g).length;

  const tiledGround = MeshBuilder.CreateTiledGround("track", {
    xmin: 0,
    zmin: 0,
    xmax: gridWidth * gridTileSize,
    zmax: gridHeight * gridTileSize,
    subdivisions: { w: gridWidth, h: gridHeight },
    precision: { w: 2, h: 2 },
  });

  const materials = {
    empty: createMaterial("empty", gridTextures[0], scene),
    roadEn: createMaterial("roadEn", gridTextures[1], scene),
    roadEs: createMaterial("roadEs", gridTextures[2], scene),
    roadEw: createMaterial("roadEw", gridTextures[3], scene),
    roadNs: createMaterial("roadNs", gridTextures[4], scene),
    roadNw: createMaterial("roadNw", gridTextures[5], scene),
    roadSw: createMaterial("roadSw", gridTextures[6], scene),
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

      tiledGround.subMeshes.push(new SubMesh(materialIndex, 0, verticesCount, base, tileIndicesLength, tiledGround));

      base += tileIndicesLength;
    }
  }

  const createdClones: Mesh[] = [];
  let cityIndex = 0;
  let houseIndex = 0;
  let treeIndex = 0;
  for (let row = gridHeight - 1; row >= 0; row--) {
    const tileRow = tileRows[row].trim();
    for (let col = 0; col < tileRow.length; col++) {
      const tileChar = tileRow[col];

      // Add decorations, where applicable.
      let decoName;
      let rotationY = 0;
      switch (tileChar) {
        // Billboard.
        case "B":
        case "˼":
        case "˻":
        case "˹":
        case "˺":
          decoName = `billboard`;

          switch (tileChar) {
            case "˻":
              rotationY = Math.PI / 2;
              break;
            case "˹":
              rotationY = Math.PI;
              break;
            case "˺":
              rotationY = -(Math.PI / 2);
              break;
          }

          break;

        // Buildings.
        case "C":
        case "╠":
        case "╦":
        case "╣":
        case "╩":
          decoName = `building${cityIndex + 1}`;

          switch (tileChar) {
            case "╦":
              rotationY = Math.PI / 2;
              break;
            case "╣":
              rotationY = Math.PI;
              break;
            case "╩":
              rotationY = -(Math.PI / 2);
              break;
          }

          // Increment index.
          cityIndex++;
          cityIndex %= 3;
          break;

        // House.
        case "H":
        case "├":
        case "┬":
        case "┤":
        case "┴":
          decoName = `house${houseIndex + 1}`;

          switch (tileChar) {
            case "┬":
              rotationY = Math.PI / 2;
              break;
            case "┤":
              rotationY = Math.PI;
              break;
            case "┴":
              rotationY = -(Math.PI / 2);
              break;
          }

          // Increment index.
          houseIndex++;
          houseIndex %= 3;
          break;

        // Trees.
        case "V":
          decoName = `tree${treeIndex + 1}`;

          // Increment index.
          treeIndex++;
          treeIndex %= 3;
          break;
      }

      if (decoName) {
        const currClone = decorationMeshes[decoName][0].clone();
        currClone.position.x = col * gridTileSize + gridTileSize / 2;
        currClone.position.z = (gridHeight - 1 - row) * gridTileSize + gridTileSize / 2;
        currClone.rotation.y += rotationY;

        createdClones.push(currClone);
      }
    }
  }

  // Completion.
  return {
    tiledGround: tiledGround,
    gridWidth: gridWidth,
    gridHeight: gridHeight,
    decoCloneMeshes: createdClones,
  };
};
