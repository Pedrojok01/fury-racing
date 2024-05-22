"use client";
import { type FC } from "react";

import { Flex, HStack, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";

import { GITHUB_REPO } from "@/data/constants";
import { images } from "@/data/images";

const Footer: FC = () => {
  return (
    <Flex
      as="footer"
      h={"2.5rem"}
      position="sticky"
      bottom={0}
      zIndex={10}
      justify={"center"}
      align={"center"}
      fontSize={"0.8rem"}
    >
      <HStack>
        <Text>Powered by </Text>

        <Link href="https://chain.link/" target="_blank" rel="noopener noreferrer">
          <HStack>
            <Image src={images.chainlinkLogo.src} alt="logo" width={25} height={25} />
            <Text fontWeight={800}>Chainlink</Text>
          </HStack>
        </Link>

        <Text> and </Text>
        <Link href="https://www.avax.network/" target="_blank" rel="noopener noreferrer">
          <HStack>
            <Image src={images.avaxLogo.src} alt="logo" width={25} height={25} />
            <Text fontWeight={800}>Avalanche</Text>
          </HStack>
        </Link>

        <Text> | </Text>

        <Link href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
          <Text fontWeight={800}>GitHub</Text>
        </Link>
      </HStack>
    </Flex>
  );
};

export default Footer;
