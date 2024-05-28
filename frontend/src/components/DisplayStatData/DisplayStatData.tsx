import type { FC } from "react";

import { HStack, Stat, StatLabel, StatNumber } from "@chakra-ui/react";
import { isMobile } from "react-device-detect";

interface DisplayStatDataProps {
  label: string;
  data: string;
}

const DisplayStatData: FC<DisplayStatDataProps> = ({ label, data }) => (
  <Stat>
    <HStack>
      <StatLabel fontSize={isMobile ? "12px" : "17px"}>{label}</StatLabel>
      <StatNumber fontSize={isMobile ? "medium" : "large"}>{data}</StatNumber>
    </HStack>
  </Stat>
);

export default DisplayStatData;
