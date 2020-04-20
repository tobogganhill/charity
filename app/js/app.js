// import stylesheet
import '../css/app.css';
// import libraries
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';
// import contract artifacts and turn them into usable abstractions
import token_artifacts from '../../build/contracts/Token.json';
import wallet_artifacts from '../../build/contracts/DonationWallet.json';
import bonds_artifacts from '../../build/contracts/ProjectWithBonds.json';
import catalog_artifacts from '../../build/contracts/ProjectCatalog.json';
import impact_registry_artifacts from '../../build/contracts/ImpactRegistry.json';
import linker_artifacts from '../../build/contracts/FlexibleImpactLinker.json';
import investor_artifacts from '../../build/contracts/InvestmentWallet.json';
// import coupon_artifacts from '../../build/contracts/Coupon.json';
// Contracts
let Token = contract(token_artifacts);
let Wallet = contract(wallet_artifacts);
let Bonds = contract(bonds_artifacts);
let Catalog = contract(catalog_artifacts);
let ImpactRegistry = contract(impact_registry_artifacts);
let Linker = contract(linker_artifacts);
let Investor = contract(investor_artifacts);
// let Coupon = contract(coupon_artifacts);

const PROJECT_NAME = 'DEMO_PROJECT';

let tokenAccount;
let donor1Account;
let donor2Account;
let donor3Account;
let beneficiaryAccount;
let validatorAccount;

let TokenContract;
let ImpactContract;
let CatalogContract;
let ProjectContract;
let InvestorContract;

let balances = {};
let wallets = {};

function refreshBalance() {
	showBalance(wallets[donor1Account].address, 'balance_donor_1');
	showBalance(wallets[donor2Account].address, 'balance_donor_2');
	showBalance(wallets[donor3Account].address, 'balance_donor_3');
	showBalance(InvestorContract.address, 'balance_investor');
	showProjectTotal('balance_charity');
	showBalance(beneficiaryAccount, 'balance_beneficiary');
	showLiability('liability');
}
function showBalance(account, element) {
	TokenContract.balanceOf(account).then(function(value) {
		lazyValueUpdate(element, value.valueOf());
		balances[account] = value;
	});
}
function showProjectTotal(element) {
	ProjectContract.total().then(function(total) {
		lazyValueUpdate(element, total.valueOf());
	});
}
function showLiability(element) {
	ProjectContract.getLiability().then(function(liability) {
		ProjectContract.getValidatedLiability().then(function(validated) {
			let value = liability.valueOf() + ' ETH: (incl 10% INT) owed to Investor';
			value =
				value +
				'<br>' +
				validated.valueOf() +
				' ETH: Verified and paid out to Investor';
			lazyValueUpdate(element, value);
		});
	});
}
function lazyValueUpdate(element, value) {
	let balance_element = document.getElementById(element);
	if (balance_element.innerHTML !== value.valueOf()) {
		balance_element.innerHTML = value.valueOf();
	}
}
function setTriggers() {
	$('.amount-changeable').on('DOMSubtreeModified', function(event) {
		blink($(event.currentTarget));
	});
}
function blink(el) {
	let timeout = 30;
	// wait until all events on the element finish
	el.promise().done(function() {
		// disable trigger for current element to avoid double blinking
		el.off('DOMSubtreeModified');
		let startFontSize = el.css('font-size');
		let increasedFontSize = parseInt(startFontSize) * 1.4 + 'px';
		el.animate(
			{
				'font-size': increasedFontSize
			},
			timeout,
			function() {
				el.animate(
					{
						'font-size': startFontSize
					},
					timeout,
					function() {
						el.on('DOMSubtreeModified', function() {
							// enable blinking handler for element again
							blink(el);
						});
					}
				);
			}
		);
	});
}
window.deposit = function(account, value) {
	TokenContract.mint(wallets[account].address, value, {
		from: tokenAccount,
		gas: 1000000
	}).then(function(tx) {
		refreshBalance();
		printTx('DONOR DEPOSIT: ', tx);
	});
};
window.depositToInvestor = async function(value) {
	TokenContract.mint(InvestorContract.address, value, {
		from: tokenAccount,
		gas: 1000000
	}).then(function(tx) {
		refreshBalance();
		printTx('INVESTOR DEPOSIT: ', tx);
	});
};
window.donate = async function(account, value) {
	wallets[account]
		.donate(value, PROJECT_NAME, { from: tokenAccount, gas: 1000000 })
		.then(function(tx) {
			refreshBalance();
			printTx('DONATION: ', tx);
		});
};
window.invest = async function(value) {
	InvestorContract.invest(value, PROJECT_NAME, {
		from: tokenAccount,
		gas: 1000000
	}).then(function(tx) {
		refreshBalance();
		printTx('INVESTMENT: ', tx);
	});
};
window.donateAll = async function(account) {
	let total = await TokenContract.balanceOf(wallets[account].address);
	donate(account, total.valueOf());
};
window.validateOutcome = async function(name, value) {
	let tx = await ProjectContract.validateOutcome(name, value, {
		from: validatorAccount,
		gas: 500000
	});
	printTx('VERIFICATION: ', tx);
	refreshBalance();
	return linkImpact(name);
};
window.payBack = async function(account) {
	let tx = await ProjectContract.payBack(wallets[account].address, {
		from: tokenAccount,
		gas: 1000000
	});
	refreshBalance();
	printTx('REFUND: ' + account, tx);
};
window.payBackAll = function() {
	payBack(donor1Account);
	payBack(donor2Account);
	payBack(donor3Account);
};
function linkImpact(name) {
	return ImpactContract.getImpactUnmatchedValue
		.call(name, { from: tokenAccount })
		.then(function(val) {
			if (val > 0) {
				return ImpactContract.linkImpact(name, {
					from: tokenAccount,
					gas: 3000000
				}).then(function() {
					return linkImpact(name);
				});
			}
		});
}
function mapAccounts(accounts) {
	tokenAccount = accounts[0];
	validatorAccount = accounts[1];
	beneficiaryAccount = accounts[2];
	donor1Account = accounts[3];
	donor2Account = accounts[4];
	donor3Account = accounts[5];
	window.donor1Account = donor1Account;
	window.donor2Account = donor2Account;
	window.donor3Account = donor3Account;
}
function printLog(text) {
	let logBox = document.getElementById('log');
	logBox.innerHTML = text + '<br/>' + logBox.innerHTML;
}
function printTx(name, tx) {
	printLog(
		'<span style="color:chocolate; font-weight: bold;">' +
			name +
			'</span><' +
			' Tx Hash: ' +
			tx.tx
	);
}
function printContract(name, contract) {
	printLog(
		'<span style="color:maroon; font-weight: bold;">' +
			name +
			'</span> Contract deployed to: ' +
			contract.address
	);
}
async function deployToken() {
	Token.setProvider(web3.currentProvider);
	TokenContract = await Token.new({ from: tokenAccount, gas: 3000000 });
	printContract('TOKEN: ', TokenContract);
}
async function deployProject() {
	Bonds.setProvider(web3.currentProvider);
	Catalog.setProvider(web3.currentProvider);
	ImpactRegistry.setProvider(web3.currentProvider);
	Linker.setProvider(web3.currentProvider);
	// Coupon.setProvider(web3.currentProvider);
	ProjectContract = await Bonds.new(PROJECT_NAME, 0, 100, 1000, {
		from: tokenAccount,
		gas: 5000000
	});
	printContract('PROJECT: ', ProjectContract);
	await ProjectContract.setValidator(validatorAccount, {
		from: tokenAccount,
		gas: 3000000
	});
	await ProjectContract.setBeneficiary(beneficiaryAccount, {
		from: tokenAccount,
		gas: 3000000
	});
	await ProjectContract.setToken(TokenContract.address, {
		from: tokenAccount,
		gas: 3000000
	});
	ImpactContract = await ImpactRegistry.new(ProjectContract.address, {
		from: tokenAccount,
		gas: 3000000
	});
	let linker = await Linker.new(ImpactContract.address, 10, {
		from: tokenAccount,
		gas: 3000000
	});
	await ImpactContract.setLinker(linker.address, {
		from: tokenAccount,
		gas: 3000000
	});
	await ProjectContract.setImpactRegistry(ImpactContract.address, {
		from: tokenAccount,
		gas: 3000000
	});
	CatalogContract = await Catalog.new({ from: tokenAccount, gas: 3000000 });
	printContract('CATALOG: ', CatalogContract);
	await CatalogContract.addProject(PROJECT_NAME, ProjectContract.address, {
		from: tokenAccount,
		gas: 3000000
	});
}
async function deployWallet(donor) {
	Wallet.setProvider(web3.currentProvider);
	wallets[donor] = await Wallet.new(CatalogContract.address, {
		from: tokenAccount,
		gas: 3000000
	});
	printContract('DONOR: ', wallets[donor]);
}
async function deployInvestorWallet() {
	Investor.setProvider(web3.currentProvider);
	InvestorContract = await Investor.new(CatalogContract.address, {
		from: tokenAccount,
		gas: 3000000
	});
	printContract('INVESTOR: ', InvestorContract);
}
async function deploy() {
	await deployToken();
	await deployProject();
	await deployWallet(donor1Account);
	await deployWallet(donor2Account);
	await deployWallet(donor3Account);
	await deployInvestorWallet();
	refreshBalance();
}
window.onload = function() {
	let ganacheUrl = 'http://127.0.0.1:7545';
	window.web3 = new Web3(new Web3.providers.HttpProvider(ganacheUrl));
	setTriggers();
	web3.eth.getAccounts(function(err, accs) {
		if (err != null) {
			alert('Error fetching accounts.');
			return;
		}
		if (accs.length == 0) {
			alert(
				'Could not fetch accounts. Ensure Ganache is configured correctly.'
			);
			return;
		}
		mapAccounts(accs);
		deploy();
	});
};
