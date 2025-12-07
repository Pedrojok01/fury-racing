"use client";
import { type ReactNode, useState, useLayoutEffect } from "react";

import { RainbowKitProvider, lightTheme, type Theme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import merge from "lodash.merge";
import { ThemeProvider } from "next-themes";
import { WagmiProvider } from "wagmi";

import { Toaster } from "@/components/Toaster";
import { Provider as ChakraProvider } from "@/components/ui/provider";
import { AudioProvider, WalkthroughProvider } from "@/context";
import { config } from "@/wagmi";

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    // Defer state update to avoid synchronous setState in effect
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

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

  if (!mounted) return null;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <RainbowKitProvider theme={customTheme} initialChain={43113}>
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
