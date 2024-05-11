import { type FC } from "react";

import { Button, Center, HStack, VStack, Link } from "@chakra-ui/react";
import NextLink from "next/link";

const RaceScreen: FC = () => {
  return (
    <Center h={"100%"}>
      <VStack align="center" justify="center">
        <>THE RACE IS ON!</>
        <HStack>
          <Link as={NextLink} href="/leaderboard" m={"auto"} style={{ textDecoration: "none" }}>
            <Button className="custom-button">Leaderboard</Button>
          </Link>

          <Link as={NextLink} href="/" m={"auto"} style={{ textDecoration: "none" }}>
            <Button className="custom-button">Home</Button>
          </Link>
        </HStack>
      </VStack>
    </Center>
  );
};

export default RaceScreen;
