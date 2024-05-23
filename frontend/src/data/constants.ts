import type { Abi } from "viem";

import { RACING_ABI } from "./abi";

export const TITLE = "Fury Racing";
export const DESCRIPTION = "Onchain racing simulator leveraging Chainlink VRF and Chainlink API.";

export const URL = "https://fury-racing.vercel.app/";
export const GITHUB_REPO = "https://github.com/Pedrojok01/chainlink-hackathon";

export const GLTF_PATH_CAR = "./assets/low-poly/scene.gltf";

export const LINK_TOKEN = {
  tesnet: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
  mainnet: "0x5947BB275c521040051D82396192181b413227A3",
};

export const RACING_CONTRACT = {
  address: "0x854c1E1EC8199A0F20050350c00fdCb84C3bc338" as `0x${string}`,
  ABI: RACING_ABI as Abi,
};
