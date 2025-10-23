// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {LandInterface} from "./interfaces/LandInterface.sol";

import {LandValidationLib} from "./libs/LandValidationLib.sol";
import {LandPaymentLib} from "./libs/LandPaymentLib.sol";
import {LandStorageLib} from "./libs/LandStorageLib.sol";
import {LandGovernanceLib} from "./libs/LandGovernanceLib.sol";

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

import {IHederaTokenService} from "./hts-precompile/IHederaTokenService.sol";
import {HederaTokenService} from "./hts-precompile/HederaTokenService.sol";
import {HederaResponseCodes} from "./hts-precompile/HederaResponseCodes.sol";
import {KeyHelper} from "./hts-precompile/KeyHelper.sol";
import {ExpiryHelper} from "./hts-precompile/ExpiryHelper.sol";

contract Land is
    LandInterface,
    AccessControl,
    Pausable,
    KeyHelper,
    ExpiryHelper,
    HederaTokenService
{
    using LandStorageLib for LandStorageLib.Storage;
    using LandGovernanceLib for *;

    address public underlying;
    LandData public data;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    constructor(
        address admin,
        int64 autoRenewPeriod,
        LandInterface.CreateParams memory params
    ) payable {
        LandValidationLib.checkAddress(admin);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);

        LandStorageLib.initialize();
        LandGovernanceLib.initialize(params.votingPowerBps);

        data = LandData({
            squareMeters: params.squareMeters,
            latitude: params.latitude,
            longitude: params.longitude,
            maxSupply: params.maxSupply,
            unitValue: params.unitValue
        });

        IHederaTokenService.TokenKey[]
            memory keys = new IHederaTokenService.TokenKey[](1);

        // Set this contract as supply
        keys[0] = getSingleKey(
            KeyType.SUPPLY,
            KeyValueType.CONTRACT_ID,
            address(this)
        );

        // Token details
        IHederaTokenService.HederaToken memory token;
        token.name = params.name;
        token.symbol = params.symbol;
        token.memo = "Non-fungible Token";
        token.treasury = address(this);
        token.tokenSupplyType = true; // finite supply
        token.maxSupply = params.maxSupply;
        token.tokenKeys = keys;
        token.freezeDefault = false;
        token.expiry = createAutoRenewExpiry(address(this), autoRenewPeriod);

        // Call HTS to create the token
        (int256 responseCode, address tokenAddress) = createNonFungibleToken(
            token
        );

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert TokenCreationFailed(responseCode);
        }

        underlying = tokenAddress;

        emit LandInitialized(
            params.name,
            params.symbol,
            params.squareMeters,
            params.latitude,
            params.longitude,
            params.unitValue,
            params.maxSupply,
            params.votingPowerBps
        );
    }

    function mint(
        bytes[] memory metadata,
        address validator,
        address behalfOf
    )
        external
        payable
        whenNotPaused
        returns (int64 votingPower, int64[] memory tokenSerial)
    {
        int64 required = data.unitValue * int64(int256(metadata.length));

        int64 value = int64(int256(msg.value));

        LandPaymentLib.validatePayment(required, value);
        LandPaymentLib.refundExcess(msg.sender, required, value);

        address receiver = behalfOf == address(0) ? msg.sender : behalfOf;

        (int responseCode, , int64[] memory serial) = mintToken(
            underlying,
            0,
            metadata
        );

        tokenSerial = serial;

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert TokenMintFailed(responseCode);
        }

        votingPower = LandGovernanceLib.vote(validator, required, receiver);

        emit Minted(receiver, msg.sender, serial, required, votingPower);
    }

    function close() external whenPaused onlyRole(DEFAULT_ADMIN_ROLE) {
        address validator = LandGovernanceLib.end();
        LandStorageLib.close(validator);

        emit Closed(LandGovernanceLib.getSelectedValidator());
    }

    function registerValidator(
        address validator
    ) external onlyRole(MANAGER_ROLE) {
        LandGovernanceLib.registerValidator(validator);

        emit ValidatorRegistered(validator);
    }

    function deregisterValidator(
        address validator
    ) external onlyRole(MANAGER_ROLE) {
        LandGovernanceLib.deregisterValidator(validator);

        emit ValidatorDeregistered(validator);
    }

    function pause() external onlyRole(MANAGER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(MANAGER_ROLE) {
        _unpause();
    }

    function withdraw(
        address to,
        int64 amount,
        string memory reason
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        (bool sent, ) = to.call{value: uint256(int256(amount))}("");
        require(sent, "Failed to withdraw");

        emit Withdrawn(to, amount, reason);
    }
}
