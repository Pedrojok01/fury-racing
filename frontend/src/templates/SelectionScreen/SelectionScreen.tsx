import { useEffect, type FC } from "react";

import { Button, Center, VStack, Wrap, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { isMobile } from "react-device-detect";

import {
  AttributesSelector,
  CarAnim,
  CustomBox,
  Track,
  WaitingScreen,
  Weather,
} from "@/components";
import { images, tracks } from "@/data";
import { useWriteContract } from "@/hooks";
import { useAnim } from "@/stores/useAnim";
import { useGameStates } from "@/stores/useGameStates";

const SelectionScreen: FC = () => {
  const { carData } = useAnim();
  const { joinSoloRace, joinFreeRace, waitForPlayer } = useWriteContract();
  const { loading, mode, isWaiting, raceId } = useGameStates();
  const router = useRouter();

  const handlePlayer2Joined = () => {
    router.push("/race");
  };

  useEffect(() => {
    if (isWaiting && raceId !== null) {
      waitForPlayer(raceId, handlePlayer2Joined);
    }
  }, [isWaiting, raceId, waitForPlayer]);

  const handleRaceStart = async () => {
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
      res = await joinSoloRace(); // TODO: Implement tournament mode
      if (res.success) {
        router.push("/race");
      }
    }
  };

  return (
    <Center p={isMobile ? 0 : "2rem"} h={isWaiting ? "100%" : "auto"}>
      <Wrap w={"100%"} direction="row" justify="space-between" gap={0}>
        {isWaiting ? (
          <WaitingScreen />
        ) : (
          <>
            <VStack flex="1" align="center" justify="center" spacing={4} minW={330}>
              <CustomBox>
                <VStack alignItems={"flex-start"}>
                  <Text textAlign={"left"} className="subtitle">
                    1. Choose Your Car
                  </Text>
                  <CarAnim />
                </VStack>
              </CustomBox>
              <AttributesSelector defaultAttributes={carData.attributes} />
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
                className="custom-button"
                isLoading={loading}
                onClick={handleRaceStart}
              >
                Go
              </Button>
            </VStack>
          </>
        )}
      </Wrap>
    </Center>
  );
};

export default SelectionScreen;
