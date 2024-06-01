"use client";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import type { Transport } from "viem";
import { createConfig, http } from "wagmi";
import { avalancheFuji } from "wagmi/chains";

import { t } from "./utils/i18";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("WalletConnect project ID is not defined. Please check your environment variables.");
}

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        walletConnectWallet,
        ledgerWallet,
        rabbyWallet,
        coinbaseWallet,
        argentWallet,
        safeWallet,
      ],
    },
  ],
  { appName: t("common.title"), projectId: walletConnectProjectId },
);

const transports: Record<number, Transport> = {
  [avalancheFuji.id]: http(),
};
export const wagmiConfig = createConfig({
  chains: [avalancheFuji],
  connectors,
  transports,
  ssr: true,
});
