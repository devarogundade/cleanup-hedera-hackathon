// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

library LandStorageLib {
    using Strings for int64;

    // ---------------------------------------------------------------------
    // STORAGE SLOT
    // ---------------------------------------------------------------------
    bytes32 internal constant STORAGE_SLOT = keccak256("earth3.land.storage");

    // ---------------------------------------------------------------------
    // STORAGE STRUCT
    // ---------------------------------------------------------------------
    struct Storage {
        address validator;
        bool isEnded;
    }

    // ---------------------------------------------------------------------
    // INTERNAL FUNCTION TO ACCESS STORAGE
    // ---------------------------------------------------------------------
    function s() internal pure returns (Storage storage ls) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            ls.slot := slot
        }
    }

    // ---------------------------------------------------------------------
    // INITIALIZER
    // ---------------------------------------------------------------------
    function initialize() internal {
        Storage storage ls = s();
        ls.isEnded = false;
        ls.validator = address(0);
    }

    function close(address validator) internal {
        Storage storage ls = s();
        ls.isEnded = true;
        ls.validator = validator;
    }
}
