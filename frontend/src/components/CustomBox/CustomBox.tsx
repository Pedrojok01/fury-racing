import type { FC, ReactNode } from "react";

import { Box } from "@chakra-ui/react";
import { useTheme } from "next-themes";
interface CustomBoxProps {
  children: ReactNode;
}

const CustomBox: FC<CustomBoxProps> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <Box
      p={4}
      shadow="md"
      borderWidth="1px"
      borderRadius="12px"
      w="90%"
      bg={theme === "light" ? "var(--background-light)" : "var(--background-dark)"}
      alignItems={"center"}
      alignContent={"center"}
      justifyContent={"center"}
    >
      {children}
    </Box>
  );
};

export default CustomBox;
