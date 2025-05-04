import { type FC } from "react";

import { Box, Separator, Flex, HStack, Heading, Spinner, StatGroup, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";

import useWeather from "@/hooks/useWeather";
import { t } from "@/utils/i18";

import { CustomBox } from "../CustomBox";
import { DisplayStatData } from "../DisplayStatData";

const Loading: FC = () => (
  <VStack w="100%" justifyContent="center">
    <Spinner size="md" />
    <Text>Loading...</Text>
  </VStack>
);

const ErrorDisplay: FC<{ message: string }> = ({ message }) => (
  <Flex w="100%" justifyContent="center">
    <Text color="red" fontWeight={600}>
      {message}
    </Text>
  </Flex>
);

const WeatherDisplay: FC<{ weather: Weather }> = ({ weather }) => {
  const {
    current: {
      condition: { icon, text },
      temp_c,
      precip_mm,
      wind_kph,
    },
  } = weather;

  return (
    <HStack w="100%" justifyContent="space-between">
      <Flex flex={1} justifyContent="center" alignItems="center" minW={120}>
        {icon ? <Image src={`https:${icon}`} alt="Weather Icon" width={80} height={80} /> : <Box w="80px" h="80px" />}
      </Flex>
      <VStack flex={1} justifyContent="center" alignItems="center">
        <Heading fontSize="xl">{text}</Heading>
        <Separator my={2} />
        <StatGroup>
          <VStack gap={1} alignItems="flex-start" minW="175px">
            <DisplayStatData label="Temperature:" data={`${temp_c}°C`} />
            <DisplayStatData label="Precipitation:" data={`${precip_mm}mm`} />
            <DisplayStatData label="Wind:" data={`${wind_kph}km/h`} />
          </VStack>
        </StatGroup>
      </VStack>
    </HStack>
  );
};

const Weather: FC = () => {
  const { weather, isLoading, isError } = useWeather("Monaco");

  return (
    <CustomBox>
      <VStack alignItems="flex-start">
        <Text textAlign="left" className="subtitle">
          {t("selection.subtitles.weather")}
        </Text>

        {isLoading ? (
          <Loading />
        ) : isError ? (
          <ErrorDisplay message={isError.message} />
        ) : (
          weather && <WeatherDisplay weather={weather} />
        )}
      </VStack>
    </CustomBox>
  );
};

export default Weather;
