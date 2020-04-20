let Project = artifacts.require('Project');
let Token = artifacts.require('Token');
let ImpactRegistry = artifacts.require('ImpactRegistry');

require('./test-setup');

contract('Multiple donations', function(accounts) {
	let main = accounts[0];
	let validator = accounts[1];
	let beneficiary = accounts[2];
	let project, token;

	it('should create a project', async function() {
		project = await Project.new('Project', 0);
	});

	it('should link the project to token', async function() {
		token = await Token.new();
		await project.setToken(token.address, { from: main });
	});

	it('should link the project to validator', async function() {
		await project.setValidator(validator);
		(await project.validatorAddress()).should.be.equal(validator);
	});

	it('should link project to beneficiary', async function() {
		await project.setBeneficiary(beneficiary);
		(await project.beneficiaryAddress()).should.be.equal(beneficiary);
	});

	it('should link project to impact registry', async function() {
		impactRegistry = await ImpactRegistry.new(project.address);
		await project.setImpactRegistry(impactRegistry.address, { from: main });
	});
});
