// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.9;

import "./SelfAuthorized.sol";

contract FallbackManager is SelfAuthorized {
	event ChangedFallbackHandler(address handler);

	bytes32 internal constant FALLBACK_HANDLER_STORAGE_SLOT =
		0x6c9a6c4a39284e37ed1cf53d337577d14212a4870fb976a4366c693b939918d5;

	function internalSetFallbackHandler(address handler) internal {
		bytes32 slot = FALLBACK_HANDLER_STORAGE_SLOT;
		// solhint-disable-next-line no-inline-assembly
		assembly {
			sstore(slot, handler)
		}
	}

	function setFallbackHandler(address handler) public authorized {
		internalSetFallbackHandler(handler);
		emit ChangedFallbackHandler(handler);
	}

	// solhint-disable-next-line payable-fallback,no-complex-fallback
	fallback() external {
		bytes32 slot = FALLBACK_HANDLER_STORAGE_SLOT;
		// solhint-disable-next-line no-inline-assembly
		assembly {
			let handler := sload(slot)
			if iszero(handler) {
				return(0, 0)
			}
			calldatacopy(0, 0, calldatasize())
			mstore(calldatasize(), shl(96, caller()))
			let success := call(
				gas(),
				handler,
				0,
				0,
				add(calldatasize(), 20),
				0,
				0
			)
			returndatacopy(0, 0, returndatasize())
			if iszero(success) {
				revert(0, returndatasize())
			}
			return(0, returndatasize())
		}
	}
}
