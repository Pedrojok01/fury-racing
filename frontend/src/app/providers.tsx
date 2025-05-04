"use client";
import { type ReactNode, useState, useEffect } from "react";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { RainbowKitProvider, lightTheme, type Theme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import merge from "lodash.merge";
import { ThemeProvider } from "next-themes";
import { WagmiProvider } from "wagmi";

import { Toaster } from "@/components/Toaster";
import { AudioProvider, WalkthroughProvider } from "@/context";
import { t } from "@/utils/i18";
import { wagmiConfig } from "@/wagmi";

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const queryClient = new QueryClient();

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
        <ChakraProvider value={defaultSystem}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <RainbowKitProvider coolMode appInfo={appInfo} theme={customTheme}>
              <AudioProvider>
                <WalkthroughProvider>{mounted && children}</WalkthroughProvider>
                <Toaster />
              </AudioProvider>
            </RainbowKitProvider>
          </ThemeProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
