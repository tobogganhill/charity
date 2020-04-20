let Project = artifacts.require('Project');
let ProjectCatalog = artifacts.require('ProjectCatalog');
let ImpactRegistry = artifacts.require('ImpactRegistry');

require('./test-setup');

contract('DonationWallet', function() {
	let project;
	let projectCatalog;

	before('register project in catalog', async function() {
		project = await Project.new('Test project', 0);
		let registry = await ImpactRegistry.new(project.address);
		await project.setImpactRegistry(registry.address);
		projectCatalog = await ProjectCatalog.new();
		await projectCatalog.addProject('PROJECT', project.address);
	});
});
