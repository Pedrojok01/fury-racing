import { type FC } from "react";

import { Button, Center, VStack, Link, Wrap } from "@chakra-ui/react";
import NextLink from "next/link";

import { AttributesSelector, CarAnim, Track, Weather } from "@/components";
import { images } from "@/data/images";
import { tracks } from "@/data/tracks";
import { useGame } from "@/stores/useGame";

const SelectionScreen: FC = () => {
  const { setScreen } = useGame();

  return (
    <Center h={"auto"}>
      <Wrap w={"100%"} direction="row" justify="space-between">
        <VStack flex="1" align="center" justify="center" spacing={4} minW={330}>
          <CarAnim />
          <AttributesSelector />
        </VStack>

        <VStack flex="1" minW={330}>
          <Weather />
          <Track map={images.track} data={tracks[0]} />

          <Link
            as={NextLink}
            href="/race"
            style={{ textDecoration: "none" }}
            onClick={() => setScreen("RACE")}
          >
            <Button
              mt={"2rem"}
              paddingBlock={"2.5rem"}
              paddingInline={"5rem"}
              fontSize={"2rem"}
              fontWeight={"bold"}
              className="custom-button"
            >
              Go
            </Button>
          </Link>
        </VStack>
      </Wrap>
    </Center>
  );
};

export default SelectionScreen;
