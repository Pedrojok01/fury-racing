import { type FC } from "react";

import { Button, Center, VStack } from "@chakra-ui/react";

import { useGame } from "@/stores/useGame";

const HomeScreen: FC = () => {
  const { setScreen } = useGame();

  return (
    <Center h={"100%"}>
      <VStack align="center" justify="center">
        <>WELCOME</>
        <Button onClick={() => setScreen("SELECTION")}>Play</Button>
      </VStack>
    </Center>
  );
};

export default HomeScreen;
