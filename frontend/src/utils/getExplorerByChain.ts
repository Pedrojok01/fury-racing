import { networks } from "@/data/networks";

export const getExplorer = (chainId: number) => {
  switch (chainId) {
    case 43114:
      return networks.avalanche.blockExplorers?.default.url;
    case 43113:
      return networks.avalancheFuji.blockExplorers?.default.url;
    default:
      return networks.avalanche.blockExplorers?.default.url;
  }
};
