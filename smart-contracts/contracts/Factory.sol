// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {LandInterface} from "./interfaces/LandInterface.sol";

import {Land} from "./Land.sol";

contract Factory is Ownable {
    int64 public latestRoundId;
    int64 public totalLands;

    /// @dev Mapping from round ID to deployed Land contracts.
    mapping(int64 => address[]) public lands;

    /// @notice Emitted when a new round is created.
    event NewRound(int64 indexed roundId);

    /// @notice Emitted when a new Land is deployed.
    event CreateLand(int64 indexed roundId, address indexed land);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @notice Starts a new round for grouping new Land contracts.
    /// @return roundId The ID of the newly created round.
    function newRound() external onlyOwner returns (int64 roundId) {
        latestRoundId++;
        roundId = latestRoundId;

        emit NewRound(roundId);
    }

    /// @notice Deploys a new Land contract within the current round.
    /// @param autoRenewPeriod NFT renew-ing.
    /// @param params Struct defining land creation parameters.
    /// @return land The address of the newly deployed Land contract.
    function createLand(
        int64 autoRenewPeriod,
        LandInterface.CreateParams memory params
    ) external payable onlyOwner returns (address land) {
        require(latestRoundId > 0, "Factory: no active round");

        // Deploy new Land contract
        land = address(
            new Land{value: msg.value}(owner(), autoRenewPeriod, params)
        );

        // Track it under the current round
        lands[latestRoundId].push(land);
        totalLands++;

        emit CreateLand(latestRoundId, land);
    }
}
