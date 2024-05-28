import type { Abi } from "viem";

import { RACING_ABI } from "./abi";

export const TITLE = "Fury Racing";
export const DESCRIPTION = "Onchain racing manager leveraging Chainlink VRF V2.5 and Chainlink Functions.";

export const URL = "https://fury-racing.vercel.app/";
export const GITHUB_REPO = "https://github.com/Pedrojok01/fury-racing";
export const GITBOOK = "https://fury-racing.gitbook.io/fury-racing";

export const LINK_TOKEN = {
  tesnet: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
  mainnet: "0x5947BB275c521040051D82396192181b413227A3",
};

export const RACING_CONTRACT = {
  address: "0x5a46363a08146fb5d93C687afb4C69D2EeB33412" as `0x${string}`,
  ABI: RACING_ABI as Abi,
};
