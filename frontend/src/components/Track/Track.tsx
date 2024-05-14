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
            <VStack spacing={1} align={"left"} minW={"175px"}>
              <TrackData label="Track Length" data={data.lengthFormatted} />
              <TrackData label="Best Time" data={data.bestTimeFormatted} />
              <TrackData label="Max Speed" data={`${data.maxSpeed} km/h`} />
              <TrackData label="Full Throttle" data={`${data.fullThrottle}%`} />
              <TrackData label="Downforce" data={`${data.downforce}`} />
            </VStack>
          </StatGroup>
        </VStack>
      </HStack>
    </CustomBox>
  );
};

export default Track;

interface TrackDataProps {
  label: string;
  data: string;
}

const TrackData: FC<TrackDataProps> = ({ label, data }) => (
  <Stat>
    <HStack>
      <StatLabel>{label}</StatLabel>
      <StatNumber fontSize="large">{data}</StatNumber>
    </HStack>
  </Stat>
);
