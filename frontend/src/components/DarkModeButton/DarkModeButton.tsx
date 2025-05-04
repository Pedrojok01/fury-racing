import { type FC } from "react";

import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { useTheme } from "next-themes";

const DarkModeButton: FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      w={"40px"}
      h={"40px"}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="custom-button"
      css={{ color: "initial" }}
    >
      {theme === "light" ? <SunIcon fontSize={20} /> : <MoonIcon fontSize={17} />}
    </Button>
  );
};

export default DarkModeButton;
