// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface LandInterface {
    error InvalidFractionId(int64 tokenId);
    error FractionAlreadyDonated(int64 tokenId);
    error InsufficientPayment(int64 required, int64 provided);
    error InvalidBPS();
    error InvalidAmount();
    error ZeroAddress();
    error ValidatorHasActiveVotes();
    error InvalidAddress();
    error AlreadyRegistered();
    error NotRegistered();
    error TokenCreationFailed(int256 responseCode);
    error TokenMintFailed(int256 responseCode);

    event LandInitialized(
        int32 squareMeters,
        int64 latitude,
        int64 longitude,
        int64 maxSupply,
        int64 unitValue,
        int64 votingPowerBps
    );
    event Minted(
        address indexed receiver,
        address indexed operator,
        int64[] tokenIds,
        int64 amount,
        int64 votingPower
    );
    event Burned(address indexed owner, int64[] tokenIds, int64 refund);
    event BurnedWithPermit(
        address indexed operator,
        int64[] tokenIds,
        int64 refund
    );
    event Withdrawn(address indexed to, int64 amount, string reason);
    event BaseURIChanged(string newBaseURI);
    event Closed(address validator);
    event Voted(
        address indexed voter,
        address indexed validator,
        int64 votingPower
    );
    event ValidatorRegistered(address indexed validator);
    event ValidatorDeregistered(address indexed validator);
    event Ended(address indexed winningValidator);
    event ValidatorAssigned(
        address indexed landAddress,
        address indexed validator
    );

    struct LandData {
        int32 squareMeters;
        int64 latitude;
        int64 longitude;
        int64 maxSupply;
        int64 unitValue;
    }

    struct CreateParams {
        int64 maxSupply;
        int64 unitValue;
        int32 squareMeters;
        int64 latitude;
        int64 longitude;
        int64 votingPowerBps;
    }

    function mint(
        bytes[] memory metadata,
        address validator,
        address behalfOf
    ) external payable returns (int64, int64[] memory);

    function close() external;

    function registerValidator(address validator) external;

    function deregisterValidator(address validator) external;

    function pause() external;

    function unpause() external;

    function withdraw(address to, int64 amount, string memory reason) external;
}
