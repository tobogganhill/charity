// Implements ERC 20 Token standard

pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';


contract Token is StandardToken, Ownable {
	using SafeMath for uint256;

	string public name = 'Token';
	uint8 public decimals = 2;
	string public symbol = 'TOK';
	string public version = 'TOK 1.0';

	function mint(address _to, uint256 _value) public onlyOwner {
		totalSupply_ = totalSupply_.add(_value);
		balances[_to] = balances[_to].add(_value);

		emit MintEvent(_to, _value);
	}

	function destroy(address _from, uint256 _value) public onlyOwner {
		totalSupply_ = totalSupply_.sub(_value);
		balances[_from] = balances[_from].sub(_value);

		emit DestroyEvent(_from, _value);
	}

	event MintEvent(address indexed to, uint256 value);
	event DestroyEvent(address indexed from, uint256 value);
}
