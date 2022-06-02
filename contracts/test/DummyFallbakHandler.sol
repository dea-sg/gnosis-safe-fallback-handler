// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.9;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract DummyFallbakHandler is OwnableUpgradeable, UUPSUpgradeable {
	function initialize() public initializer {
		__Ownable_init();
		__UUPSUpgradeable_init();
	}

	function dummyTokenFallback(address) external {}

	function _authorizeUpgrade(address) internal override onlyOwner {}
}
