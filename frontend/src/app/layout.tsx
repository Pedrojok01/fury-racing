import type { ReactNode } from "react";

import "@/styles/globals.css";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";

import "@rainbow-me/rainbowkit/styles.css";
import { t } from "@/utils/i18";

import { Providers } from "./providers";

const open_sans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: t("common.title"),
  applicationName: t("common.title"),
  description: t("common.description"),
  authors: [
    { name: "Pedrojok01", url: "https://github.com/Pedrojok01" },
    { name: "hbCyber", url: "https://github.com/hbCyber" },
  ],
  keywords: [
    "Next.js",
    "babylonjs",
    "TypeScript",
    "Zustand",
    "wagmi",
    "viem",
    "chainlink",
    "chakra-ui",
    "RainbowKit",
    "ethereum-dapp",
    "web3-game",
  ],
  icons: "favicon.ico",
  manifest: "site.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={open_sans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
