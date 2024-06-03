"use client";
import React, { createContext, useState, useContext, type FC, type ReactNode, useEffect, useMemo } from "react";

import { usePathname } from "next/navigation";
import Joyride, { type CallBackProps, STATUS, type Step } from "react-joyride";
import { useAccount } from "wagmi";

import { stepsData } from "@/utils/walkthroughSteps";

type WalkthroughContextType = {
  run: boolean;
  steps: Step[];
  startWalkthrough: () => void;
};

const WalkthroughContext = createContext<WalkthroughContextType | undefined>(undefined);

export const useWalkthrough = () => {
  const context = useContext(WalkthroughContext);
  if (!context) {
    throw new Error("useWalkthrough must be used within a WalkthroughProvider");
  }
  return context;
};

type WalkthroughProviderProps = {
  children: ReactNode;
};

export const WalkthroughProvider: FC<WalkthroughProviderProps> = ({ children }) => {
  const { isConnected } = useAccount();
  const pathname = usePathname();

  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);

  const startWalkthrough = () => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setRun(true);
      localStorage.setItem("hasVisited", "true");
    }
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
    }
  };

  useEffect(() => {
    // Determine the steps based on the current route
    if (pathname === "/") {
      if (isConnected) {
        const filteredSteps = stepsData.home.filter((step) => step.target !== ".connect-wallet");
        setSteps(filteredSteps);
      } else {
        setSteps(stepsData.home);
      }
    } else if (pathname === "/mode") {
      setSteps(stepsData.mode);
    } else if (pathname === "/selection") {
      setSteps(stepsData.select);
    } else if (pathname === "/race") {
      setSteps(stepsData.race);
    }
  }, [isConnected, pathname]);

  useEffect(() => {
    startWalkthrough();
  }, [steps]);

  const value = useMemo(() => ({ run, steps, startWalkthrough }), [run, steps]);

  return (
    <WalkthroughContext.Provider value={value}>
      <Joyride
        steps={steps}
        run={run}
        continuous={false}
        showSkipButton={false}
        hideBackButton
        hideCloseButton
        styles={{ options: { zIndex: 10000, primaryColor: "var(--secondary-color)" } }}
        callback={handleJoyrideCallback}
      />
      {children}
    </WalkthroughContext.Provider>
  );
};
