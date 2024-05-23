import { useMemo, useCallback } from "react";

import { getContract, zeroAddress, type TransactionReceipt } from "viem";
import { usePublicClient, useWalletClient, useWatchContractEvent } from "wagmi";

import { RACING_CONTRACT } from "@/data";
import { useAnim } from "@/stores/useAnim";
import { useGameStates } from "@/stores/useGameStates";
import { logError } from "@/utils/errorUtil";
import { generateRandomAttributes } from "@/utils/generateCarAttributes";

import { useNotify, useReadContract } from ".";

type ContractCallResponse = {
  success: boolean;
  data: TransactionReceipt | null;
  error: string | null;
};

const circuitId = 1;

export const useWriteContract = () => {
  const publicClient = usePublicClient();
  const client = useWalletClient()?.data;
  const { setLoading, setIsWaiting, setTransactionHash } = useGameStates();
  const { carData } = useAnim();
  const { notifyError } = useNotify();
  const { mode, setRaceId } = useGameStates();
  const { getSoloRaceCount, getFreeRaceCount, getTournamentRaceCount } = useReadContract();

  const racingInstance = useMemo(() => {
    return client ? getContract({ address: RACING_CONTRACT.address, abi: RACING_CONTRACT.ABI, client }) : null;
  }, [client]);

  useWatchContractEvent({
    address: RACING_CONTRACT.address,
    abi: RACING_CONTRACT.ABI,
    eventName: "RandomnessReceived",
    onLogs(logs) {
      console.log("RandomnessReceived!", logs);
    },
  });

  /* Join Race Handler:
   *********************/
  const handleTransaction = useCallback(
    async (methodName: string, getCount: () => Promise<bigint>, setWaiting: boolean, ...args: any[]) => {
      if (!racingInstance || !publicClient) {
        return { success: false, data: null, error: "The contract instance is missing." };
      }

      setLoading(true);
      try {
        const raceId = await getCount();
        setRaceId(raceId);

        // Simulate transaction
        await publicClient.simulateContract({
          address: RACING_CONTRACT.address,
          abi: RACING_CONTRACT.ABI,
          functionName: methodName,
          args,
        });

        // Run transaction
        const hash: `0x${string}` = await racingInstance.write[methodName](args);

        setTransactionHash(hash);

        const receipt = await publicClient.waitForTransactionReceipt({
          confirmations: 1,
          hash,
          retryCount: 2,
        });

        if (setWaiting) {
          setIsWaiting(true);
        }

        return { success: true, data: receipt, error: null };
      } catch (error: unknown) {
        const msg = logError(error);
        notifyError({
          title: "An error occurred.",
          message: `Something went wrong while joining the race: ${msg}`,
        });
        return { success: false, data: null, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [racingInstance, publicClient, setLoading, setRaceId, setTransactionHash, setIsWaiting, notifyError],
  );

  /* Join Solo Race:
   ******************/
  const joinSoloRace = useCallback(async (): Promise<ContractCallResponse> => {
    return await handleTransaction(
      "joinSoloRace",
      getSoloRaceCount,
      false,
      carData.attributes,
      generateRandomAttributes(),
      circuitId,
    );
  }, [handleTransaction, getSoloRaceCount, carData]);

  /* Join Free Race (1v1):
   **************************/
  const joinFreeRace = useCallback(async (): Promise<ContractCallResponse> => {
    return await handleTransaction("joinFreeRace", getFreeRaceCount, true, carData.attributes, circuitId);
  }, [handleTransaction, getFreeRaceCount, carData]);

  /* Join Tournament Race (1v1):
   ******************************/
  const joinTournamentRace = useCallback(async (): Promise<ContractCallResponse> => {
    return await handleTransaction("joinRace", getTournamentRaceCount, true, carData.attributes, circuitId);
  }, [handleTransaction, getTournamentRaceCount, carData]);

  /* Wait for Player:
   *******************/
  const waitForPlayer = useCallback(
    (raceId: bigint, onPlayer2Joined: () => void): void => {
      if (!racingInstance || !publicClient || !mode) return;

      const interval = setInterval(async () => {
        try {
          let raceInfo;

          if (mode === "FREE") {
            raceInfo = (await racingInstance.read.getFreeRaceFromRaceID([raceId])) as RaceInfo;
          } else {
            raceInfo = (await racingInstance.read.getTournamentRaceFromRaceID([raceId])) as RaceInfo;
          }

          if (raceInfo.player2 !== zeroAddress) {
            onPlayer2Joined();
            clearInterval(interval);
            setIsWaiting(false);
          }
        } catch (error: unknown) {
          logError(error);
        }
      }, 2000); // Check every 2 seconds
    },
    [racingInstance, publicClient, mode, setIsWaiting],
  );

  return {
    joinSoloRace,
    joinFreeRace,
    joinTournamentRace,
    waitForPlayer,
  };
};
