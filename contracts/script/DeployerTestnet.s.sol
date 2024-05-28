// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Racing } from "../src/Racing.sol";
import { Script, console2 } from "forge-std/Script.sol";

contract DeployerTest is Script {
    address immutable ROUTER = 0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0; // AVAX FUJI
    address immutable VRF_COORDINATOR = 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE; // AVAX FUJI
    uint256 immutable VRF_SUBSCRIPTION_ID =
        63182375024664025614182093103599595821807504353169154921545397858162515508978; // AVAX FUJI
    uint64 immutable FUNCTIONS_SUBSCRIPTION_ID = 8775; // AVAX FUJI
    bytes32 immutable KEY_HASH = 0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887; // AVAX
        // FUJI
    bytes32 immutable DON_ID = "fun-avalanche-fuji-1"; // AVAX FUJI

    function run() public {
        uint256 deployer = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployer);

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
