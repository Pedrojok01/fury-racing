import { type FC } from "react";

import { Button, Center, VStack } from "@chakra-ui/react";

import { useGame } from "@/stores/useGame";

const LeaderboardScreen: FC = () => {
  const { setScreen } = useGame();

  return (
    <Center h={"100%"}>
      <VStack align="center" justify="center">
        <>LEADERBOARD</>
        <Button onClick={() => setScreen("HOME")} className="custom-button">
          Back
        </Button>
      </VStack>
    </Center>
  );
};

export default LeaderboardScreen;
