// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
	networks: {
		development: {
			host: 'localhost',
			gas: 4000000,
			port: '7545',
			network_id: '5777'
		}
	},
	compilers: {
		solc: {
			// Solidity compiler version or constraint
			version: "^0.4.24"
			
		}
	}
}

