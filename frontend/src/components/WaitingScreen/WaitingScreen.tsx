// WaitingScreen.tsx
import { type FC } from "react";

import { Center, VStack, Text, Spinner } from "@chakra-ui/react";

import { CustomBox } from "../CustomBox";

const WaitingScreen: FC = () => {
  return (
    <Center h="100%" w={"100vw"} alignContent={"center"}>
      <CustomBox>
        <VStack h="100%" spacing={4} justify={"center"} minW={"300px"} textAlign={"center"}>
          <Text fontSize="xl">Waiting for another player to join...</Text>
          <Spinner
            size="xl"
            color={"var(--primary-color)"}
            thickness="4px"
            emptyColor="gray.200"
            speed="0.85s"
            label="Loading..."
          />

          <Text fontSize="xs" mt={10}>
            * You do not have to wait if it takes too long. You will miss the race, but your result will be updated as
            soon as the race is over!
          </Text>
        </VStack>
      </CustomBox>
    </Center>
  );
};

export default WaitingScreen;
