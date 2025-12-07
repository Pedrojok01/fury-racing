"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { avalancheFuji } from "wagmi/chains";

import { t } from "./utils/i18";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  throw new Error("WalletConnect project ID is not defined. Please check your environment variables.");
}

export const config = getDefaultConfig({
  appName: t("common.title"),
  projectId: walletConnectProjectId,
  chains: [avalancheFuji],
  ssr: true,
});
