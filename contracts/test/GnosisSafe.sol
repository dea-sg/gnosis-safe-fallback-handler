// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.9;

import "./FallbackManager.sol";

contract GnosisSafe is FallbackManager {
	function setup(address fallbackHandler) external {
		if (fallbackHandler != address(0))
			internalSetFallbackHandler(fallbackHandler);
	}
}
