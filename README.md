# Overview

Smart contracts to implement a crowdfunding donation model, where donors pay if
the charitable projects they give to reach their goals.

A charity has charitable goals, and each goal requires a certain amount of funds
to be crowdfunded to achieve the goal. The funds are released from escrow to the
charity, if the goal is verified as achieved.

When a donor sends funds to a charity, tokens representing the donation are
minted.. These tokens are held in escrow until a project goal is achieved and
validated. Once validated, funds are transferred to the charity's account. If
seed capital was provided by an investor, the investor is first paid back + 10%
interest. Any residual donations are transferred to the charity. If the charity
does not achieve their goals, funds are returned to donors.

### Installation

This application requires the node-js runtime and uses truffle as the Ethereum
smart contract dev environment.

Install truffle:

    npm install -g truffle

Install all of the node-js dependencies:

    npm install

Connection to a blockchain node is defined in truffle.js:
```
    networks: {
        dev: {
          network_id: "*",
          gas: 4000000,
          host: 'localhost',
          port: '8545'
        }
    }
```
Use Ganache as the default node:

    npm install -g ganache-cli

### Running tests

To run the smart contract test scripts:

    truffle test

### Demo the DApp

Deploy the smart contracts to Ganache blockchain:

    truffle migrate

Launch the demo server:

    npm run dev
