// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {LandInterface} from "../interfaces/LandInterface.sol";

library LandPaymentLib {
    function validatePayment(int64 required, int64 provided) internal pure {
        if (provided < required)
            revert LandInterface.InsufficientPayment(required, provided);
    }

    function refundExcess(
        address payer,
        int64 required,
        int64 provided
    ) internal {
        if (provided > required) {
            (bool sent, ) = payer.call{
                value: uint256(int256(provided - required))
            }("");
            require(sent, "Refund failed");
        }
    }
}
