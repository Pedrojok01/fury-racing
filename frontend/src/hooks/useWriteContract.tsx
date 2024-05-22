import { useMemo } from "react";

import { getContract } from "viem";
import { usePublicClient, useWalletClient, useWatchContractEvent } from "wagmi";

import { RACING_CONTRACT } from "@/data";
import { useAnim } from "@/stores/useAnim";
import { useContract } from "@/stores/useContract";
import { logError } from "@/utils/errorUtil";
import { generateRandomAttributes } from "@/utils/generateCarAttributes";

import { useNotify } from ".";

export const useWriteContract = () => {
  const publicClient = usePublicClient();
  const client = useWalletClient()?.data;
  const { setLoading, setTransactionHash } = useContract();
  const { carData } = useAnim();
  const { notifyError } = useNotify();
  const { setRaceId } = useContract();

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
  const joinSoloRace = async (): Promise<any> => {
    if (!racingInstance?.write.joinSoloRace || !publicClient) return;

    setLoading(true);
    try {
      const raceId = (await racingInstance.read.soloRaceCounter()) as bigint;
      setRaceId(raceId);

      // Simulate transaction
      await publicClient.simulateContract({
        address: RACING_CONTRACT.address,
        abi: RACING_CONTRACT.ABI,
        functionName: "joinSoloRace",
        args: [carData.attributes, generateRandomAttributes(), 1],
      });

      // Run transaction
      const hash: `0x${string}` = await racingInstance.write.joinSoloRace([
        carData.attributes,
        generateRandomAttributes(),
        1,
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
    } finally {
      setLoading(false);
    }
  };

  return {
    joinSoloRace,
  };
};
