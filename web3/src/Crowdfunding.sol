// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";

contract Crowdfunding is ReentrancyGuard {
    enum CampaignState {
        Active,
        Successful,
        Failed,
        Withdrawn
    }

    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        // string image;
        CampaignState state;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    uint256 public numberOfCampaigns;

    /* ───────── EVENTS ───────── */
    event CampaignCreated(uint256 indexed id, address indexed owner);
    event DonationMade(uint256 indexed id, address indexed donator, uint256 amount);
    event CampaignSuccessful(uint256 indexed id);
    event CampaignFailed(uint256 indexed id);
    event Withdrawn(uint256 indexed id, uint256 amount);
    event Refunded(uint256 indexed id, address indexed user, uint256 amount);

    /* ───────── CREATE ───────── */
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline
        // string memory _image
    ) external returns (uint256) {
        require(_target > 0, "Target = 0");
        require(_deadline > block.timestamp, "Invalid deadline");

        uint256 id = numberOfCampaigns++;

        campaigns[id] = Campaign({
            owner: msg.sender,
            title: _title,
            description: _description,
            target: _target,
            deadline: _deadline,
            amountCollected: 0,
            // image: _image,
            state: CampaignState.Active
        });

        emit CampaignCreated(id, msg.sender);
        return id;
    }

    /* ───────── DONATE ───────── */
    function donate(uint256 _id) external payable nonReentrant {
        Campaign storage c = campaigns[_id];

		require(msg.sender != c.owner, "Owner cannot donate");
        require(c.state == CampaignState.Active, "Not active");
        require(block.timestamp < c.deadline, "Ended");
        require(msg.value > 0, "Zero ETH");
        require(c.amountCollected + msg.value <= c.target, "Target reached");

        c.amountCollected += msg.value;
        contributions[_id][msg.sender] += msg.value;

        emit DonationMade(_id, msg.sender, msg.value);

        if (c.amountCollected == c.target) {
            c.state = CampaignState.Successful;
            emit CampaignSuccessful(_id);
        }
    }

    /* ───────── FINALIZE ───────── */
    function finalize(uint256 _id) external {
        Campaign storage c = campaigns[_id];

        require(c.state == CampaignState.Active, "Not active");
        require(block.timestamp >= c.deadline, "Not ended");

        if (c.amountCollected >= c.target) {
            c.state = CampaignState.Successful;
            emit CampaignSuccessful(_id);
        } else {
            c.state = CampaignState.Failed;
            emit CampaignFailed(_id);
        }
    }

    /* ───────── WITHDRAW ───────── */
    function withdraw(uint256 _id) external nonReentrant {
        Campaign storage c = campaigns[_id];

        require(msg.sender == c.owner, "Not owner");
        require(c.state == CampaignState.Successful, "Not successful");

        uint256 amount = c.amountCollected;
        c.amountCollected = 0;
        c.state = CampaignState.Withdrawn;

        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "Transfer failed");

        emit Withdrawn(_id, amount);
    }

    /* ───────── REFUND ───────── */
    function refund(uint256 _id) external nonReentrant {
        Campaign storage c = campaigns[_id];

        require(c.state == CampaignState.Failed, "Not failed");

        uint256 amount = contributions[_id][msg.sender];
        require(amount > 0, "Nothing to refund");

        contributions[_id][msg.sender] = 0;

        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "Refund failed");

        emit Refunded(_id, msg.sender, amount);
    }

    /* ───────── READ ───────── */
    function getCampaign(uint256 _id) external view returns (Campaign memory) {
        return campaigns[_id];
    }
}