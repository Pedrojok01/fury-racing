// WaitingScreen.tsx
import { type FC } from "react";

import { VStack, Text, Button, Link } from "@chakra-ui/react";
import NextLink from "next/link";

import { useGameStates } from "@/stores";

import { CustomBox } from "../CustomBox";
import { CustomSpinner } from "../CustomSpinner";

const WaitingScreen: FC = () => {
  const { reset } = useGameStates();

  return (
    <CustomBox>
      <VStack gap={4} justify={"center"} minW={"300px"} textAlign={"center"}>
        <Text fontSize="xl" pb={10}>
          Waiting for another player to join...
        </Text>
        <CustomSpinner size="xl" thickness="2px" />
        <Text>Loading...</Text>

        <Text fontSize="xs" mt={10}>
          * You do not have to wait if it takes too long. You will miss the race, but your result will be updated as
          soon as the race is over! Play another mode or come back later.
        </Text>
        <Link as={NextLink} href="/mode">
          <Button className="custom-button" w={150} onClick={() => reset()} css={{ color: "initial" }}>
            Back
          </Button>
        </Link>
      </VStack>
    </CustomBox>
  );
};

export default WaitingScreen;
