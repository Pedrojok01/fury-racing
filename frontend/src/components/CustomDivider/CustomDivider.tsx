import type { FC } from "react";

import { Divider } from "@chakra-ui/react";

const CustomDivider: FC = () => {
  return (
    <>
      <Divider mt={5} mb={1} />
      <Divider mt={1} mb={5} />
    </>
  );
};

export default CustomDivider;
