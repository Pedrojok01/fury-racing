import type { FC, ReactNode } from "react";

import { Box, useColorMode } from "@chakra-ui/react";

interface CustomBoxProps {
  children: ReactNode;
}

const CustomBox: FC<CustomBoxProps> = ({ children }) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      p={4}
      shadow="md"
      borderWidth="1px"
      borderRadius="12px"
      w="90%"
      bg={colorMode === "light" ? "var(--background-light)" : "var(--background-dark)"}
      alignItems={"center"}
      alignContent={"center"}
      justifyContent={"center"}
    >
      {children}
    </Box>
  );
};

export default CustomBox;
