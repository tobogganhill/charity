let Token = artifacts.require('Token');

module.exports = async function(deployer) {
	await deployer.deploy(Token).then(function() {
		console.log('Token deployed to: ' + Token.address);
	});
};
