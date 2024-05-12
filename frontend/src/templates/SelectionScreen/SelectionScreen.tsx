import { type FC } from "react";

import { Button, Center, HStack, VStack, Link, Flex } from "@chakra-ui/react";
import NextLink from "next/link";

import { AttributesSelector, CarAnim, Track } from "@/components";
import { images } from "@/data/images";
import { tracks } from "@/data/tracks";
import { useGame } from "@/stores/useGame";

const SelectionScreen: FC = () => {
  const { setScreen } = useGame();

  return (
    <Center h={"100%"}>
      <Flex w={"95%"} direction="row" justify="space-between">
        <VStack flex="1" align="center" justify="center" spacing={4}>
          <>CUSTOMISE YOUR CAR</>

          <CarAnim />

          <HStack>
            <Link
              as={NextLink}
              href="/"
              m={"auto"}
              style={{ textDecoration: "none" }}
              onClick={() => setScreen("HOME")}
            >
              <Button className="custom-button">Back</Button>
            </Link>

            <Link
              as={NextLink}
              href="/race"
              m={"auto"}
              style={{ textDecoration: "none" }}
              onClick={() => setScreen("RACE")}
            >
              <Button className="custom-button">Go</Button>
            </Link>
          </HStack>
        </VStack>

        <VStack flex="1">
          <Track map={images.track} data={tracks[0]} />
          <AttributesSelector />
        </VStack>
      </Flex>
    </Center>
  );
};

export default SelectionScreen;
