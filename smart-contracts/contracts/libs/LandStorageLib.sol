// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {LandInterface} from "../interfaces/LandInterface.sol";

library LandStorageLib {
    // ---------------------------------------------------------------------
    // STORAGE SLOT
    // ---------------------------------------------------------------------
    bytes32 internal constant STORAGE_SLOT = keccak256("cleanup.land.storage");

    // ---------------------------------------------------------------------
    // STORAGE STRUCT
    // ---------------------------------------------------------------------
    struct Storage {
        address validator;
        bool isEnded;
        LandInterface.LandData data;
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
    function initialize(LandInterface.LandData memory data) internal {
        Storage storage ls = s();
        ls.isEnded = false;
        ls.validator = address(0);
        ls.data = data;
    }

    function close(address validator) internal {
        Storage storage ls = s();
        ls.isEnded = true;
        ls.validator = validator;
    }
}
