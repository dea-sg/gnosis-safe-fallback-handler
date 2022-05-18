// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.9;

contract SelfAuthorized {
	function requireSelfCall() private view {
		require(msg.sender == address(this), "GS031");
	}

	modifier authorized() {
		requireSelfCall();
		_;
	}
}
