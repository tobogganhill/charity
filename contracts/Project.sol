pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

import './ImpactRegistry.sol';
import './ContractProvider.sol';
import './StringUtils.sol';


contract Project is Ownable {
	using SafeMath for uint256;

	string public name;
	address public validatorAddress;
	address public beneficiaryAddress;
	address public IMPACT_REGISTRY_ADDRESS;
	// percentage of funds to transfer to a charity immediately
	uint8 public upfrontPaymentPercentage;

	/* iterate over donations */
	address[] accountIndex;

	mapping(bytes32 => bool) public isClaimValidated;

	/* Total amount of all donations */
	uint256 public total;

	ERC20 private token;

	event OutcomeEvent(bytes32 claimId, uint256 value);
	event DonationEvent(address indexed from, uint256 value);

	constructor(string _name, uint8 _upfrontPaymentPercentage) public {
		require(_upfrontPaymentPercentage >= 0 && _upfrontPaymentPercentage < 100);
		name = _name;
		upfrontPaymentPercentage = _upfrontPaymentPercentage;
	}

	function setValidator(address _validatorAddress) public onlyOwner {
		validatorAddress = _validatorAddress;
	}

	function setBeneficiary(address _beneficiaryAddress) public onlyOwner {
		beneficiaryAddress = _beneficiaryAddress;
	}

	function setImpactRegistry(address impactRegistryAddress) public onlyOwner {
		IMPACT_REGISTRY_ADDRESS = impactRegistryAddress;
	}

	function setToken(ERC20 _token) public onlyOwner {
		token = _token;
	}

	function notify(address _from, uint256 _amount) public onlyOwner {
		require(_from != 0x0);
		require(_amount > 0);
		registerDonation(_from, _amount);
	}

	function registerDonation(address _from, uint256 _amount) internal {
		(uint256 upfront, uint256 remainder) = calculateUpfrontSplit(_amount);
		if (upfront > 0) {
			getToken().transfer(beneficiaryAddress, upfront);
		}
		total = total.add(remainder);
		ImpactRegistry(IMPACT_REGISTRY_ADDRESS).registerDonation(_from, remainder);

		emit DonationEvent(_from, _amount);
	}

	function donateFromWallet(uint256 _amount) public {
		getToken().transferFrom(msg.sender, address(this), _amount);
		registerDonation(msg.sender, _amount);
	}

	function fund(uint256 _value) public onlyOwner {
		total = total.add(_value);
	}

	function validateOutcome(bytes32 _claimId, uint256 _value) public {
		require(msg.sender == validatorAddress);
		getToken().transfer(beneficiaryAddress, _value);
		total = total.sub(_value);

		ImpactRegistry(IMPACT_REGISTRY_ADDRESS).registerOutcome(_claimId, _value);
	}

	function payBack(address account) public onlyOwner {
		uint256 balance = getBalance(account);
		if (balance > 0) {
			getToken().transfer(account, balance);
			total = total.sub(balance);
			ImpactRegistry(IMPACT_REGISTRY_ADDRESS).payBack(account);
		}
	}

	function getBalance(address donor) public view returns (uint256) {
		return ImpactRegistry(IMPACT_REGISTRY_ADDRESS).getBalance(donor);
	}

	function getToken() public view returns (ERC20) {
		return token;
	}

	function calculateUpfrontSplit(uint256 _amount)
		private
		view
		returns (uint256 upfront, uint256 remainder)
	{
		upfront = _amount.mul(upfrontPaymentPercentage).div(100);
		remainder = _amount.sub(upfront);
	}
}
