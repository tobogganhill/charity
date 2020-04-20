pragma solidity ^0.4.24;


contract MockValidation {
	event ValidationEvent(
		uint256 time,
		address indexed validator,
		string outcome,
		uint256 value
	);

	struct Validation {
		uint256 time;
		address validator;
		string outcome;
		uint256 value;
	}

	Validation[] validations;

	function validate(string outcome, uint256 value) public {
		Validation memory validation = Validation(now, msg.sender, outcome, value);
		validations.push(validation);
		emit ValidationEvent(
			validation.time,
			validation.validator,
			validation.outcome,
			validation.value
		);
	}

	function getValidationsCount() public constant returns (uint256 count) {
		return validations.length;
	}

	function getValidatorByIndex(uint256 index)
		public
		constant
		returns (address validator)
	{
		return validations[index].validator;
	}

	function getOutcomeByIndex(uint256 index)
		public
		constant
		returns (string outcome)
	{
		return validations[index].outcome;
	}

	function getValueByIndex(uint256 index)
		public
		constant
		returns (uint256 value)
	{
		return validations[index].value;
	}
}
