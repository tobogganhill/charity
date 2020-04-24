let Project = artifacts.require('Project');
let ProjectCatalog = artifacts.require('ProjectCatalog');
let ImpactRegistry = artifacts.require('ImpactRegistry');

module.exports = async function(deployer, network, accounts) {
	let validatorAccount = accounts[1];
	let beneficiaryAccount = accounts[2];

	//Deploy Project
	await deployer.deploy(Project, 'Charity', 0);
	let project = await Project.deployed();

	//Setup Impact Registry
	// await deployer.deploy(ImpactRegistry, Project.address);
	// console.log('Impact Registry deployed to: ' + ImpactRegistry.address);

	//Configure project
	// await project.setImpactRegistry(ImpactRegistry.address);
	await project.setValidator(validatorAccount);
	await project.setBeneficiary(beneficiaryAccount);

	//Register project in catalog
	await deployer.deploy(ProjectCatalog);
	let projectCatalog = await ProjectCatalog.deployed();
	await projectCatalog.addProject('project', Project.address);
};
