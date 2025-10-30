// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {LandInterface} from "../interfaces/LandInterface.sol";

library LandGovernanceLib {
    using Math for int64;

    // ---------------------------------------------------------------------
    // STORAGE SLOT
    // ---------------------------------------------------------------------
    bytes32 internal constant STORAGE_SLOT =
        keccak256("cleanup.land.governance.storage");

    // ---------------------------------------------------------------------
    // STORAGE STRUCT
    // ---------------------------------------------------------------------
    struct Storage {
        int64 votingPowerBps;
        int64 totalVotingPower;
        address[] validators;
        mapping(address => int64) validatorIndex;
        mapping(address => bool) isValidator;
        mapping(address => int64) delegatedVotingPowers;
        mapping(address => int64) votingPowerPerVoter;
        address selectedValidator;
    }

    // ---------------------------------------------------------------------
    // CONSTANTS
    // ---------------------------------------------------------------------
    int64 internal constant VOTING_POWER_BPS = 1_000;

    // ---------------------------------------------------------------------
    // INTERNAL FUNCTION TO ACCESS STORAGE
    // ---------------------------------------------------------------------
    function s() internal pure returns (Storage storage gs) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            gs.slot := slot
        }
    }

    // ---------------------------------------------------------------------
    // INITIALIZER
    // ---------------------------------------------------------------------
    function initialize(int64 _votingPowerBPS) internal {
        if (_votingPowerBPS == 0) revert LandInterface.InvalidBPS();

        Storage storage gs = s();
        gs.votingPowerBps = _votingPowerBPS;
    }

    // ---------------------------------------------------------------------
    // VALIDATOR MANAGEMENT
    // ---------------------------------------------------------------------
    function registerValidator(address validator) internal {
        Storage storage gs = s();

        if (validator == address(0)) revert LandInterface.InvalidAddress();
        if (gs.isValidator[validator]) revert LandInterface.AlreadyRegistered();

        gs.validatorIndex[validator] = int64(int256(gs.validators.length));
        gs.validators.push(validator);
        gs.isValidator[validator] = true;

        emit LandInterface.ValidatorRegistered(validator);
    }

    function deregisterValidator(address validator) internal {
        Storage storage gs = s();

        if (!gs.isValidator[validator]) revert LandInterface.NotRegistered();
        if (gs.delegatedVotingPowers[validator] > 0)
            revert LandInterface.ValidatorHasActiveVotes();

        gs.isValidator[validator] = false;

        int64 index = gs.validatorIndex[validator];
        address lastValidator = gs.validators[gs.validators.length - 1];

        if (index < int64(int256(gs.validators.length)) - 1) {
            gs.validators[uint256(int256(index))] = lastValidator;
            gs.validatorIndex[lastValidator] = index;
        }

        gs.validators.pop();
        delete gs.validatorIndex[validator];

        emit LandInterface.ValidatorDeregistered(validator);
    }

    // ---------------------------------------------------------------------
    // VOTING
    // ---------------------------------------------------------------------
    function vote(
        address validator,
        int64 amount,
        address voter
    ) internal returns (int64 votingPower) {
        Storage storage gs = s();

        if (validator == address(0)) revert LandInterface.InvalidAddress();
        if (!gs.isValidator[validator]) revert LandInterface.NotRegistered();

        votingPower = (amount * gs.votingPowerBps) / VOTING_POWER_BPS;

        gs.delegatedVotingPowers[validator] += votingPower;
        gs.votingPowerPerVoter[voter] += votingPower;
        gs.totalVotingPower += votingPower;

        emit LandInterface.Voted(voter, validator, votingPower);
    }

    // ---------------------------------------------------------------------
    // END ELECTION
    // ---------------------------------------------------------------------
    function end() internal returns (address winningValidator) {
        Storage storage gs = s();

        if (gs.selectedValidator != address(0)) return gs.selectedValidator;

        int64 maxVotingPower = 0;
        int64 len = int64(int256(gs.validators.length));

        for (int64 i = 0; i < len; i++) {
            address validator = gs.validators[uint256(int256(i))];
            int64 delegated = gs.delegatedVotingPowers[validator];

            if (delegated > maxVotingPower) {
                maxVotingPower = delegated;
                winningValidator = validator;
            }
        }

        gs.selectedValidator = winningValidator;

        emit LandInterface.Ended(winningValidator);
    }

    // ---------------------------------------------------------------------
    // VIEW HELPERS
    // ---------------------------------------------------------------------
    function getValidators() internal view returns (address[] memory) {
        return s().validators;
    }

    function getSelectedValidator() internal view returns (address) {
        return s().selectedValidator;
    }
}
