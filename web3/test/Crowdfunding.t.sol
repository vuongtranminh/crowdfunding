// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {Crowdfunding} from "../src/Crowdfunding.sol";

contract CrowdfundingTest is Test {
    Crowdfunding cf;

    address owner = address(0x1);
    address alice = address(0x2);
    address bob   = address(0x3);

    function setUp() public {
        cf = new Crowdfunding();
        vm.deal(owner, 10 ether);
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function createCampaign() internal returns (uint256) {
        vm.prank(owner);
        return cf.createCampaign(
            "Save Earth",
            "Climate action",
            5 ether,
            block.timestamp + 7 days
        );
    }

    /* ───────── CREATE ───────── */
    function testCreateCampaign() public {
        uint256 id = createCampaign();
        Crowdfunding.Campaign memory c = cf.getCampaign(id);

        assertEq(c.owner, owner);
        assertEq(c.target, 5 ether);
        assertEq(uint(c.state), uint(Crowdfunding.CampaignState.Active));
    }

    /* ───────── DONATE ───────── */
    function testDonateSuccess() public {
        uint256 id = createCampaign();

        vm.prank(alice);
        cf.donate{value: 2 ether}(id);

        vm.prank(bob);
        cf.donate{value: 3 ether}(id);

        Crowdfunding.Campaign memory c = cf.getCampaign(id);
        assertEq(c.amountCollected, 5 ether);
        assertEq(uint(c.state), uint(Crowdfunding.CampaignState.Successful));
    }

    function testCannotOverDonate() public {
        uint256 id = createCampaign();

        vm.prank(alice);
        cf.donate{value: 5 ether}(id);

        vm.prank(bob);
        vm.expectRevert("Not active");
        cf.donate{value: 1 ether}(id);
    }

    /* ───────── WITHDRAW ───────── */
    function testWithdraw() public {
        uint256 id = createCampaign();

        vm.prank(alice);
        cf.donate{value: 5 ether}(id);

        uint256 before = owner.balance;

        vm.prank(owner);
        cf.withdraw(id);

        assertEq(owner.balance, before + 5 ether);
    }

    function testOnlyOwnerWithdraw() public {
        uint256 id = createCampaign();

        vm.prank(alice);
        cf.donate{value: 5 ether}(id);

        vm.prank(alice);
        vm.expectRevert("Not owner");
        cf.withdraw(id);
    }

    /* ───────── FINALIZE + REFUND ───────── */
    function testRefundFlow() public {
        uint256 id = createCampaign();

        vm.prank(alice);
        cf.donate{value: 2 ether}(id);

        vm.warp(block.timestamp + 8 days);
        cf.finalize(id);

        uint256 before = alice.balance;

        vm.prank(alice);
        cf.refund(id);

        assertEq(alice.balance, before + 2 ether);
    }

    function testCannotRefundIfSuccessful() public {
        uint256 id = createCampaign();

        vm.prank(alice);
        cf.donate{value: 5 ether}(id);

        vm.prank(alice);
        vm.expectRevert("Not failed");
        cf.refund(id);
    }
}