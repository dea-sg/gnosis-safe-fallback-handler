// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.9;

// solhint-disable reason-string
// solhint-disable no-inline-assembly

import "../interfaces/ERC223Contract.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DummyDeap is ERC20 {
	constructor() ERC20("DEP", "DEAP Coin") {
		_mint(msg.sender, 10000000000000000000);
	}

	function transfer(address _to, uint256 _value)
		public
		override
		returns (bool)
	{
		address owner = _msgSender();
		_transfer(owner, _to, _value);

		bool isUserAddress = false;
		assembly {
			isUserAddress := iszero(extcodesize(_to))
		}
		bytes memory empty;
		if (isUserAddress == false) {
			ERC223Contract receiver = ERC223Contract(_to);
			receiver.tokenFallback(msg.sender, _value, empty);
		}
		return true;
	}
}
