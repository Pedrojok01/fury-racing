"use client";
import { useEffect, useState } from "react";

import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";

import RootLayout from "./layout";

import "@babylonjs/loaders/glTF";

function MyApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <RootLayout>
      {mounted && <Component {...pageProps} />}
      <Analytics />
    </RootLayout>
  );
}

export default MyApp;
