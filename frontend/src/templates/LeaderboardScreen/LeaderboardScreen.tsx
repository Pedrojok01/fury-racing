import { type FC } from "react";

import { Button, Center, Link, VStack } from "@chakra-ui/react";
import NextLink from "next/link";

const LeaderboardScreen: FC = () => {
  return (
    <Center h={"100%"}>
      <VStack align="center" justify="center">
        <>LEADERBOARD</>

        <Link as={NextLink} href="/" m={"auto"} style={{ textDecoration: "none" }}>
          <Button className="custom-button">Back</Button>
        </Link>
      </VStack>
    </Center>
  );
};

export default LeaderboardScreen;
