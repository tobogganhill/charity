# Crowdfunding Charitable Donations

### Overview

Donors fund charitable projects to achieve their goals.

Each charitable project is funded when the project is verified as complete.

Donors give to projects and the corresponding amount of tokens is minted. These
tokens are held in escrow until a charitable project goal is verified. Once this
validation has been performed the funds are transferred to the charity.

### Installation

This project requires node-js runtime and uses truffle as the Ethereum smart
contract dev framework.

To run it, install truffle:

    npm install -g truffle

Then install all of the node-js dependencies

    npm install

Connection to blockchain node is defined in truffle.js:

    networks: {
        dev: {
          network_id: "*",
          gas: 4000000,
          host: 'localhost',
          port: '8545'
        }
    }

Use Ethereum test client ganache as a default node:

    npm install -g ganache-cli

### Running tests

To run smart contract tests, use the following truffle command in the console:

    truffle test

If you are using the testrpc client, remember to start it with a sufficient
number of test accounts:

    ganache-cli -a 100

You can also use an automated test script instead of the previous two commands:

    yarn test

### Demo DAPP

Deploy the smart contracts to your blockchain network:

    truffle migrate

Launch a demo server:

    npm run dev

DAPP is available at: http://localhost:8080/
