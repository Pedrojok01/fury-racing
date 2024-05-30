import { type FC } from "react";

import { Center, Flex, HStack } from "@chakra-ui/react";

import { AttributesRace, CarRace, ResultModal } from "@/components";
import { useRace } from "@/hooks";

const RaceScreen: FC = () => {
  const { address, raceInfo, mode, attributes, luck, hasRaceFinished, isWinner } = useRace();

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

      {hasRaceFinished && raceInfo && <ResultModal raceInfo={raceInfo} isWinner={!!isWinner} mode={mode ?? "SOLO"} />}
    </>
  );
};

export default RaceScreen;
