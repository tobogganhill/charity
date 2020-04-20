let AliceToken = artifacts.require('AliceToken');

module.exports = async function(deployer) {
	await deployer.deploy(AliceToken).then(function() {
		console.log('Token deployed to: ' + AliceToken.address);
	});
};
