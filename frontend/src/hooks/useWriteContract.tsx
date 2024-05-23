import { useMemo } from "react";

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
  const { setRaceId } = useGameStates();
  const { getSoloRaceCount, getFreeRaceCount } = useReadContract();

  const racingInstance = useMemo(
    () =>
      client
        ? getContract({ address: RACING_CONTRACT.address, abi: RACING_CONTRACT.ABI, client })
        : null,
    [client],
  );

  // useWatchContractEvent({
  //   address: RACING_CONTRACT.address,
  //   abi: RACING_CONTRACT.ABI,
  //   eventName: "FinishedRace",
  //   onLogs(logs) {
  //     console.log("FinishedRace!", logs);
  //     if (logs.length > 0) {
  //       const event = logs[0];
  //       console.log("Event:", event);
  //       // const args = event.args as EventData;
  //       setEventData(event);
  //     }
  //   },
  // });

  useWatchContractEvent({
    address: RACING_CONTRACT.address,
    abi: RACING_CONTRACT.ABI,
    eventName: "RandomnessReceived",
    onLogs(logs) {
      console.log("RandomnessReceived!", logs);
    },
  });

  /* Join Solo Race:
   ******************/
  const joinSoloRace = async (): Promise<ContractCallResponse> => {
    if (!racingInstance?.write.joinSoloRace || !publicClient) {
      return { success: false, data: null, error: "The contract instance is missing." };
    }

    setLoading(true);
    try {
      const raceId = await getSoloRaceCount();
      setRaceId(raceId);

      // Simulate transaction
      await publicClient.simulateContract({
        address: RACING_CONTRACT.address,
        abi: RACING_CONTRACT.ABI,
        functionName: "joinSoloRace",
        args: [carData.attributes, generateRandomAttributes(), circuitId],
      });

      // Run transaction
      const hash: `0x${string}` = await racingInstance.write.joinSoloRace([
        carData.attributes,
        generateRandomAttributes(),
        circuitId,
      ]);

      setTransactionHash(hash);

      const receipt = await publicClient.waitForTransactionReceipt({
        confirmations: 1,
        hash,
        retryCount: 2,
      });

      return { success: true, data: receipt, error: null };
    } catch (error: unknown) {
      const msg = logError(error);
      notifyError({
        title: "An error occured.",
        message: `Something went wrong while launching the solo race: ${msg}`,
      });
      return { success: false, data: null, error: msg };
    } finally {
      setLoading(false);
    }
  };

  /* Join Free Race (1v1):
   **************************/
  const joinFreeRace = async (): Promise<ContractCallResponse> => {
    if (!racingInstance || !publicClient) {
      return { success: false, data: null, error: "The contract instance is missing." };
    }

    setLoading(true);
    try {
      const raceId = await getFreeRaceCount();
      setRaceId(raceId);

      // await getRaceInfo(raceId);

      // Simulate transaction
      await publicClient.simulateContract({
        address: RACING_CONTRACT.address,
        abi: RACING_CONTRACT.ABI,
        functionName: "joinFreeRace",
        args: [carData.attributes, circuitId],
      });

      // Run transaction
      const hash: `0x${string}` = await racingInstance.write.joinFreeRace([
        carData.attributes,
        circuitId,
      ]);

      setTransactionHash(hash);

      const receipt = await publicClient.waitForTransactionReceipt({
        confirmations: 1,
        hash,
        retryCount: 2,
      });

      // console.log("raceInfo", raceInfo);
      // if (raceInfo?.player1 === zeroAddress) {
      setIsWaiting(true);
      // }
      return { success: true, data: receipt, error: null };
    } catch (error: unknown) {
      const msg = logError(error);
      notifyError({
        title: "An error occurred.",
        message: `Something went wrong while launching the free race: ${msg}`,
      });
      return { success: false, data: null, error: msg };
    } finally {
      setLoading(false);
    }
  };

  /* Wait for Player 2:
   **********************/
  const waitForPlayer = (raceId: bigint): void => {
    if (!racingInstance || !publicClient) return;

    const interval = setInterval(async () => {
      try {
        const raceInfo = (await racingInstance.read.getFreeRaceFromRaceID([raceId])) as RaceInfo;
        if (raceInfo.player2 !== zeroAddress) {
          setIsWaiting(false); // Player 2 has joined, stop waiting
          clearInterval(interval);
        }
      } catch (error: unknown) {
        logError(error);
      }
    }, 5000); // Check every 5 seconds
  };

  return {
    joinSoloRace,
    joinFreeRace,
    waitForPlayer,
  };
};
