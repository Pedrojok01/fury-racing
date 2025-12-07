"use client";
import {
  createContext,
  useState,
  useContext,
  type FC,
  type ReactNode,
  useLayoutEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";

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
  const startedRef = useRef(false);

  // Compute steps based on pathname and connection status using useMemo instead of state + effect
  const steps = useMemo(() => {
    if (pathname === "/") {
      if (isConnected) {
        return stepsData.home.filter((step) => step.target !== ".connect-wallet");
      }
      return stepsData.home;
    }
    if (pathname === "/mode") {
      return stepsData.mode;
    }
    if (pathname === "/selection") {
      return stepsData.select;
    }
    if (pathname === "/race") {
      return stepsData.race;
    }
    return [];
  }, [isConnected, pathname]);

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

  const handleStartWalkthrough = useCallback(() => {
    if (steps.length > 0 && !startedRef.current) {
      const hasVisited = localStorage.getItem("hasVisited");
      if (!hasVisited) {
        // Defer state update to avoid synchronous setState in effect
        setTimeout(() => {
          setRun(true);
          localStorage.setItem("hasVisited", "true");
        }, 0);
      }
      startedRef.current = true;
    }
    // Reset ref when steps change significantly (different route)
    if (steps.length === 0) {
      startedRef.current = false;
    }
  }, [steps]);

  // Start walkthrough when steps are available, but only once per steps change
  useLayoutEffect(() => {
    handleStartWalkthrough();
  }, [handleStartWalkthrough]);

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
