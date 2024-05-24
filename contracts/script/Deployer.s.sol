// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Racing } from "../src/Racing.sol";
import { Script, console2 } from "forge-std/Script.sol";

contract DeployerTest is Script {
    address immutable ROUTER = 0x9f82a6A0758517FD0AfA463820F586999AF314a0; // AVAX MAINNET
    address immutable VRF_COORDINATOR = 0xE40895D055bccd2053dD0638C9695E326152b1A4; // AVAX MAINNET
    uint256 immutable VRF_SUBSCRIPTION_ID = 1234; // TODO: Fill this in
    uint64 immutable FUNCTIONS_SUBSCRIPTION_ID = 1234; // TODO: Fill this in
    bytes32 immutable KEY_HASH = 0x84213dcadf1f89e4097eb654e3f284d7d5d5bda2bd4748d8b7fada5b3a6eaa0d; // AVAX
        // MAINNET
    bytes32 immutable DON_ID = "fun-avalanche-mainnet-1"; // AVAX MAINNET

    function run() public {
        vm.startBroadcast();

        // Deploy Racing:
        Racing racing = new Racing(
            ROUTER,
            VRF_COORDINATOR,
            VRF_SUBSCRIPTION_ID,
            FUNCTIONS_SUBSCRIPTION_ID,
            KEY_HASH,
            DON_ID
        );

        console2.log("Racing deployed at:", address(racing));

        vm.stopBroadcast();
    }
}
