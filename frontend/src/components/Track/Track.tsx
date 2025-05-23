import { type FC } from "react";

import { Flex, HStack, Heading, Separator, StatGroup, Text, VStack } from "@chakra-ui/react";
import Image, { type StaticImageData } from "next/image";

import { t } from "@/utils/i18";

import { CustomBox } from "../CustomBox";
import { DisplayStatData } from "../DisplayStatData";

interface TrackProps {
  map: StaticImageData;
  data: DisplayStatData;
}

const Track: FC<TrackProps> = ({ map, data }) => {
  return (
    <CustomBox>
      <VStack alignItems="flex-start">
        <Text textAlign={"left"} className="subtitle">
          {t("selection.subtitles.track")}
        </Text>

        <HStack w="100%" h={"100%"} justifyContent="space-between">
          <Flex flex={1} justifyContent="center" alignItems="center" minW={120}>
            <Image src={map.src} alt="Race data" width={400} height={337} />
          </Flex>

          <VStack flex={1} justifyContent="center" alignItems="center">
            <Heading fontSize="xl">{data.name}</Heading>
            <Separator my={2} />
            <StatGroup>
              <VStack gap={1} align={"flex-start"} minW={"175px"}>
                <DisplayStatData label="Track Length" data={data.lengthFormatted} />
                <DisplayStatData label="Best Time" data={data.bestTimeFormatted} />
                <DisplayStatData label="Max Speed" data={`${data.maxSpeed} km/h`} />
                <DisplayStatData label="Full Throttle" data={`${data.fullThrottle}%`} />
                <DisplayStatData label="Downforce" data={`${data.downforce}`} />
              </VStack>
            </StatGroup>
          </VStack>
        </HStack>
      </VStack>
    </CustomBox>
  );
};

export default Track;
