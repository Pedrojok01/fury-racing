import type { Abi } from "viem";

import { RACING_ABI } from "./abi";

export const URL = "https://fury-racing.vercel.app/";
export const GITHUB_REPO = "https://github.com/Pedrojok01/fury-racing";
export const GITBOOK = "https://fury-racing.gitbook.io/fury-racing";

export const RACING_CONTRACT = {
  address: "0x143989DeA4CdB29b452b241eF3134d2554E583Bc" as `0x${string}`,
  ABI: RACING_ABI as Abi,
};
