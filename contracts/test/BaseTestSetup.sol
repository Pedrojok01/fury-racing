// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "../src/Errors.sol";
import { IRacing } from "../src/interface/IRacing.sol";
import { MockRacing } from "./mocks/MockRacing.sol";

import { LinkTokenInterface } from "@chainlink/v0.8/shared/interfaces/LinkTokenInterface.sol";
import { VRFCoordinatorV2_5Mock } from "@chainlink/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";

import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { Test, console2 } from "forge-std/Test.sol";

import { FunctionsRequest } from "@chainlink/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

contract BaseTestSetup is Test, IRacing {
    MockRacing public racing;
    VRFCoordinatorV2_5Mock public vrfCoordinator;

    address public owner = address(0x1);
    address public player1 = address(0x2);
    address public player2 = address(0x3);
    address public player3 = address(0x4);

    PlayerAttributes public attributes1;
    PlayerAttributes public attributes2;
    PlayerAttributes public attributes3;
    PlayerAttributes public attributesAfterLuck1;
    PlayerAttributes public attributesAfterLuck2;

    struct InitialBalances {
        uint256 contractBalance;
        uint256 player1Balance;
        uint256 player2Balance;
        uint256 prizePool;
    }

    function setUpBase() public {
        vm.deal(owner, 10 ether);
        vm.deal(player1, 10 ether);
        vm.deal(player2, 10 ether);
        vm.deal(player3, 10 ether);

        vm.startPrank(owner);
        vrfCoordinator = new VRFCoordinatorV2_5Mock(0.002 ether, 40 gwei, 0.004 ether);
        uint256 vrf_sub_id = vrfCoordinator.createSubscription();
        vrfCoordinator.fundSubscription(vrf_sub_id, 1 ether);

        racing = new MockRacing(
            address(0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0), // router
            address(vrfCoordinator), // vrfCoordinator
            vrf_sub_id, // vrfSubscriptionId
            8170, // functionSubscriptionId
            bytes32(0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887), // keyHash
            bytes32("fun-avalanche-fuji-1") // donID
        );

        vrfCoordinator.addConsumer(vrf_sub_id, address(racing));
        vm.stopPrank();

        attributes1 = PlayerAttributes({
            reliability: 5,
            maniability: 5,
            speed: 5,
            breaks: 5,
            car_balance: 5,
            aerodynamics: 5,
            driver_skills: 5,
            luck: 5
        });

        attributesAfterLuck1 = PlayerAttributes({
            reliability: 50,
            maniability: 50,
            speed: 50,
            breaks: 50,
            car_balance: 50,
            aerodynamics: 50,
            driver_skills: 50,
            luck: 50
        });

        attributes2 = PlayerAttributes({
            reliability: 8,
            maniability: 7,
            speed: 6,
            breaks: 5,
            car_balance: 4,
            aerodynamics: 3,
            driver_skills: 3,
            luck: 4
        });

        attributesAfterLuck2 = PlayerAttributes({
            reliability: 80,
            maniability: 70,
            speed: 60,
            breaks: 50,
            car_balance: 40,
            aerodynamics: 30,
            driver_skills: 30,
            luck: 40
        });

        attributes3 = PlayerAttributes({
            reliability: 4,
            maniability: 7,
            speed: 6,
            breaks: 5,
            car_balance: 4,
            aerodynamics: 3,
            driver_skills: 3,
            luck: 8
        });
    }
}
