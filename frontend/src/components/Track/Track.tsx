import { type FC } from "react";

import {
  Divider,
  HStack,
  Heading,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from "@chakra-ui/react";
import Image, { type StaticImageData } from "next/image";

import { CustomBox } from "../CustomBox";

interface TrackProps {
  map: StaticImageData;
  data: TrackData;
}

const Track: FC<TrackProps> = ({ map, data }) => {
  return (
    <CustomBox>
      <HStack
        h={"100%"}
        justify={"flex-start"}
        alignContent={"flex-start"}
        alignItems={"flex-start"}
      >
        <VStack alignItems={"flex-start"}>
          <Text textAlign={"left"} className="subtitle">
            Track Information
          </Text>
          <Image src={map.src} alt="Race data" width={400} height={337} />
        </VStack>

        <VStack spacing={2}>
          <Heading fontSize="xl">{data.name}</Heading>
          <Divider my={2} />
          <StatGroup>
            <VStack spacing={1} align={"left"}>
              <Stat>
                <HStack>
                  <StatLabel>Track Length</StatLabel>
                  <StatNumber>{data.lengthFormatted}</StatNumber>
                </HStack>
              </Stat>
              <Stat>
                <HStack>
                  <StatLabel>Best Time</StatLabel>
                  <StatNumber>{data.bestTimeFormatted}</StatNumber>
                </HStack>
              </Stat>
              <Stat>
                <HStack>
                  <StatLabel>Max Speed</StatLabel>
                  <StatNumber>{data.maxSpeed} km/h</StatNumber>
                </HStack>
              </Stat>
              <Stat>
                <HStack>
                  <StatLabel>Full Throttle</StatLabel>
                  <StatNumber>{data.fullThrottle}%</StatNumber>
                </HStack>
              </Stat>
              <Stat>
                <HStack>
                  <StatLabel>Downforce</StatLabel>
                  <StatNumber>{data.downforce}</StatNumber>
                </HStack>
              </Stat>
            </VStack>
          </StatGroup>
        </VStack>
      </HStack>
    </CustomBox>
  );
};

export default Track;
