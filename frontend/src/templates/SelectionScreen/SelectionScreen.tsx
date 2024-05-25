import { useCallback, useEffect, useMemo, type FC } from "react";

import { Button, Center, VStack, Wrap, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { isMobile } from "react-device-detect";

import { AttributesSelector, CarAnim, CustomBox, Track, WaitingScreen, Weather } from "@/components";
import { images, tracks } from "@/data";
import { useWriteContract } from "@/hooks";
import { useAnim, useGameStates } from "@/stores";

const SelectionScreen: FC = () => {
  const { carData } = useAnim();
  const { joinSoloRace, joinFreeRace, joinTournamentRace, waitForPlayer } = useWriteContract();
  const { loading, mode, isWaiting, raceId } = useGameStates();
  const router = useRouter();

  const handlePlayer2Joined = useCallback(() => {
    router.push("/race");
  }, [router]);

  useEffect(() => {
    if (isWaiting && raceId !== null) {
      waitForPlayer(raceId, handlePlayer2Joined);
    }
  }, [isWaiting, raceId, waitForPlayer, handlePlayer2Joined]);

  const handleRaceStart = useCallback(async () => {
    let res;

    if (mode === "SOLO") {
      res = await joinSoloRace();
      if (res.success) {
        router.push("/race");
      }
    } else if (mode === "FREE") {
      res = await joinFreeRace();
      if (res.success) {
        return;
      }
    } else {
      res = await joinTournamentRace();
      if (res.success) {
        return;
      }
    }
  }, [mode, joinSoloRace, joinFreeRace, joinTournamentRace, router]);

  const mainContent = useMemo(
    () => (
      <>
        <VStack flex="1" align="center" justify="center" spacing={4} minW={330}>
          <CustomBox>
            <VStack alignItems={"flex-start"} className="select-car">
              <Text textAlign={"left"} className="subtitle">
                1. Choose Your Car
              </Text>
              <CarAnim />
            </VStack>
          </CustomBox>
          <AttributesSelector
            defaultAttributes={carData.attributes}
            walktrough={{ attributes: "select-attributes", luck: "select-luck" }}
          />
        </VStack>

        <VStack flex="1" minW={330}>
          <Weather />
          <Track map={images.track} data={tracks[0]} />
          <Button
            mt={"2rem"}
            paddingBlock={"2.5rem"}
            paddingInline={"5rem"}
            fontSize={"2rem"}
            fontWeight={"bold"}
            className="custom-button start-race"
            isLoading={loading}
            onClick={handleRaceStart}
          >
            Go
          </Button>
        </VStack>
      </>
    ),
    [carData.attributes, loading, handleRaceStart],
  );

  return (
    <Center p={isMobile ? 0 : "2rem"} h={isWaiting ? "100%" : "auto"}>
      <Wrap w={"100%"} direction="row" justify="space-between" gap={0}>
        {isWaiting ? <WaitingScreen /> : mainContent}
      </Wrap>
    </Center>
  );
};

export default SelectionScreen;
