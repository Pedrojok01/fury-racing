"use client";
import { type ReactNode, useState, useEffect } from "react";

import { CacheProvider } from "@chakra-ui/next-js";
import { extendTheme, ChakraProvider } from "@chakra-ui/react";
import { RainbowKitProvider, lightTheme, type Theme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import merge from "lodash.merge";
import { WagmiProvider } from "wagmi";

import { AudioProvider, WalkthroughProvider } from "@/context";
import { t } from "@/utils/i18";
import { wagmiConfig } from "@/wagmi";

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const queryClient = new QueryClient();

  const theme = extendTheme({ initialColorMode: "dark", useSystemColorMode: false });

  const customTheme: Theme = merge(lightTheme(), {
    colors: {
      accentColor: "var(--primary-color)",
      closeButton: "var(--primary-color)",
      connectButtonBackground: "var(--primary-color)",
      connectButtonInnerBackground: "var(--primary-color)",
      profileAction: "var(--primary-color)",
    },
  } as Theme);

  const appInfo = {
    appName: t("common.title"),
  };

  if (!mounted) return null;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <CacheProvider>
          <ChakraProvider resetCSS theme={theme}>
            <RainbowKitProvider coolMode appInfo={appInfo} theme={customTheme}>
              <AudioProvider>
                <WalkthroughProvider>{mounted && children}</WalkthroughProvider>
              </AudioProvider>
            </RainbowKitProvider>
          </ChakraProvider>
        </CacheProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
