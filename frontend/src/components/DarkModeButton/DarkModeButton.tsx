import { type FC } from "react";

import { Button } from "@chakra-ui/react";
import { useTheme } from "next-themes";
import { FiSun, FiMoon } from "react-icons/fi";

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
      {theme === "light" ? <FiSun size={20} /> : <FiMoon size={17} />}
    </Button>
  );
};

export default DarkModeButton;
