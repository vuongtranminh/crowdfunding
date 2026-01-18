// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {Crowdfunding} from "../src/Crowdfunding.sol";

contract CrowdfundingScript is Script {
    Crowdfunding public crowdfunding;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        crowdfunding = new Crowdfunding();

        vm.stopBroadcast();
    }
}
