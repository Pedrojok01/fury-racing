import type { FC } from "react";

import { HStack, Stat, StatLabel, StatNumber } from "@chakra-ui/react";

interface DisplayStatDataProps {
  label: string;
  data: string;
}

const DisplayStatData: FC<DisplayStatDataProps> = ({ label, data }) => (
  <Stat>
    <HStack>
      <StatLabel>{label}</StatLabel>
      <StatNumber fontSize="large">{data}</StatNumber>
    </HStack>
  </Stat>
);

export default DisplayStatData;
