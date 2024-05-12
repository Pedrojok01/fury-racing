import type { FC, ReactNode } from "react";

import { Box } from "@chakra-ui/react";

interface CustomBoxProps {
  children: ReactNode;
}

const CustomBox: FC<CustomBoxProps> = ({ children }) => {
  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="12px"
      w="90%"
      bg="gray.50"
      alignItems={"center"}
      alignContent={"center"}
      justifyContent={"center"}
    >
      {children}
    </Box>
  );
};

export default CustomBox;
