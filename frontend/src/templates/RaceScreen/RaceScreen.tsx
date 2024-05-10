import { type FC } from "react";

import { Button, Center, HStack, VStack } from "@chakra-ui/react";

import { useGame } from "@/stores/useGame";

const RaceScreen: FC = () => {
  const { setScreen } = useGame();

  return (
    <Center h={"100%"}>
      <VStack align="center" justify="center">
        <>THE RACE IS ON!</>
        <HStack>
          <Button onClick={() => setScreen("LEADERBOARD")} className="custom-button">
            Leaderboard
          </Button>
          <Button onClick={() => setScreen("HOME")} className="custom-button">
            Home
          </Button>
        </HStack>
      </VStack>
    </Center>
  );
};

export default RaceScreen;
