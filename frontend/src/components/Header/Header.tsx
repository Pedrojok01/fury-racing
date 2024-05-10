"use client";
import { type FC } from "react";

import { HStack, Heading } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

import { TITLE } from "@/data/constants";

import logo from "../../../public/img/logo.png";
import { DarkModeButton } from "../DarkModeButton";

const Header: FC = () => {
  return (
    <HStack
      as="header"
      p={"1rem"}
      position="sticky"
      top={0}
      zIndex={10}
      justifyContent={"space-between"}
    >
      <HStack>
        <Image src={logo.src} alt="logo" width={45} height={45} />
        <Heading as="h1" fontSize={"1.5rem"} pb={"0.3rem"} className="text-shadow">
          {TITLE}
        </Heading>
      </HStack>

      <HStack>
        <ConnectButton />
        <DarkModeButton />
      </HStack>
    </HStack>
  );
};

export default Header;
