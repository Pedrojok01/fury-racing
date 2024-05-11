// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";

contract Deployer is Script {
    function run() public {
        vm.startBroadcast();
        vm.stopBroadcast();
    }
}
