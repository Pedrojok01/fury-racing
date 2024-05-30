import { useEffect, useState, type FC } from "react";

import { Center, Flex, HStack } from "@chakra-ui/react";
import { useAccount } from "wagmi";

import { AttributesRace, CarRace, ResultModal } from "@/components";
import { useReadContract } from "@/hooks";
import { useGameStates } from "@/stores";

const RaceScreen: FC = () => {
  const { address } = useAccount();
  const { raceId, raceInfo, mode, attributes } = useGameStates();
  const { getRaceInfo, getRandomWords } = useReadContract();
  const [luck, setLuck] = useState({ player1: 0, player2: 0 });

  useEffect(() => {
    if (!raceId || !mode) return;

    const fetchLuck = async () => {
      const luck = await getRandomWords(raceId, mode);
      if (luck.length > 0) {
        setLuck({ player1: luck[0], player2: luck[1] });
        clearInterval(intervalId);
      }
    };

    const intervalId = setInterval(fetchLuck, 3000); // fetchLuck every 3 seconds

    return () => clearInterval(intervalId);
  }, [raceId, mode, getRandomWords]);

  // Fetch race result after 30 seconds, then every 10 seconds
  useEffect(() => {
    if (!raceId || !mode) return;

    let interval: NodeJS.Timeout;

    const initialTimeout = setTimeout(() => {
      interval = setInterval(async () => {
        const currentRaceInfo = await getRaceInfo(raceId, mode);
        if (currentRaceInfo?.player1Time !== 0 && currentRaceInfo?.player2Time !== 0) {
          clearInterval(interval);
        }
      }, 10000);
    }, 30000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [raceId, getRaceInfo, mode]);

  const hasRaceFinished = raceInfo && raceInfo.player1Time !== 0 && raceInfo.player2Time !== 0;
  const isWinner =
    address &&
    hasRaceFinished &&
    ((address === raceInfo.player1 && raceInfo.player1Time < raceInfo.player2Time) ||
      (address === raceInfo.player2 && raceInfo.player2Time < raceInfo.player1Time));

  return (
    <>
      <Center h="inherit" alignItems={"flex-start"} alignContent={"flex-start"} justifyContent={"center"}>
        <HStack h={"inherit"} width={"100%"} gap={0}>
          <Flex w={"30%"} minW={"17rem"}>
            <AttributesRace
              attributes={attributes}
              extraLuck={address === raceInfo?.player1 ? luck.player1 : luck.player2}
            />
          </Flex>
          <Flex w={"70%"}>
            <CarRace />
          </Flex>
        </HStack>
      </Center>

      {hasRaceFinished && <ResultModal raceInfo={raceInfo} isWinner={!!isWinner} mode={mode ?? "SOLO"} />}
    </>
  );
};

export default RaceScreen;
