pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import '../Project.sol';


contract ProjectWithBonds is Project {
	uint256 public interestRate;
	uint256 public liability;
	uint256 public validatedLiability;

	constructor(
		string _name,
		uint8 _upfrontPaymentPercentage,
		uint256 _couponNominalPrice,
		uint256 _interestRate
	) public Project(_name, _upfrontPaymentPercentage) {
		interestRate = _interestRate;
	}

	function investFromWallet(uint256 _amount) public {
		require(getToken().transferFrom(msg.sender, beneficiaryAddress, _amount));
		liability = liability.add(getPriceWithInterest(_amount));
	}

	function validateOutcome(bytes32 _claimId, uint256 _value) public {
		require(msg.sender == validatorAddress);
		require(_value <= total);
		uint256 unvalidatedLiability = liability.sub(validatedLiability);

		if (_value > unvalidatedLiability) {
			uint256 surplus = _value.sub(unvalidatedLiability);
			getToken().transfer(beneficiaryAddress, surplus);
			validatedLiability = validatedLiability.add(unvalidatedLiability);
		} else {
			validatedLiability = validatedLiability.add(_value);
		}

		total = total.sub(_value);

		ImpactRegistry(IMPACT_REGISTRY_ADDRESS).registerOutcome(_claimId, _value);

		emit OutcomeEvent(_claimId, _value);
	}

	function getPriceWithInterest(uint256 _value) public view returns (uint256) {
		return _value.add(_value.mul(interestRate).div(10000));
	}

	function getLiability() public view returns (uint256) {
		return liability;
	}

	function getValidatedLiability() public view returns (uint256) {
		return validatedLiability;
	}
}
