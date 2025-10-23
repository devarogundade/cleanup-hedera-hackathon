// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {LandInterface} from "../interfaces/LandInterface.sol";

library LandValidationLib {
    function checkAddress(address addr) internal pure {
        if (addr == address(0)) revert LandInterface.ZeroAddress();
    }
}
