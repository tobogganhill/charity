// import stylesheet
import '../css/app.css';

// import libraries
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';

// import contract artifacts and turn them into usable abstractions
import alice_token_artifacts from '../../build/contracts/AliceToken.json';
import wallet_artifacts from '../../build/contracts/DonationWallet.json';
import project_with_bonds_artifacts from '../../build/contracts/ProjectWithBonds.json';
import catalog_artifacts from '../../build/contracts/ProjectCatalog.json';
import impact_registry_artifacts from '../../build/contracts/ImpactRegistry.json';
import linker_artifacts from '../../build/contracts/FlexibleImpactLinker.json';
import investor_artifacts from '../../build/contracts/InvestmentWallet.json';
import coupon_artifacts from '../../build/contracts/Coupon.json';

// MetaCoin is the usable abstraction used below
var AliceToken = contract(alice_token_artifacts);
var Wallet = contract(wallet_artifacts);
var ProjectWithBonds = contract(project_with_bonds_artifacts);
var Catalog = contract(catalog_artifacts);
var ImpactRegistry = contract(impact_registry_artifacts);
var Linker = contract(linker_artifacts);
var Investor = contract(investor_artifacts);
var Coupon = contract(coupon_artifacts);

const PROJECT_NAME = 'DEMO_PROJECT';

var accounts;
var aliceAccount;
var donor1Account;
var donor2Account;
var donor3Account;
var beneficiaryAccount;
var validatorAccount;

var TokenContract;
var CharityContract;
var ImpactContract;
var CatalogContract;
var ProjectContract;
var InvestorContract;
var CouponContract;

var balances = {};
var wallets = {};

function refreshBalance() {
	showBalance(wallets[donor1Account].address, 'balance_donor_1');
	showBalance(wallets[donor2Account].address, 'balance_donor_2');
	showBalance(wallets[donor3Account].address, 'balance_donor_3');
	showBalance(InvestorContract.address, 'balance_investor');
	showProjectTotal('balance_charity');
	showBalance(beneficiaryAccount, 'balance_beneficiary');
	showCoupons(InvestorContract.address, 'coupons');
	showLiability('liability');
}

function showBalance(account, element) {
	TokenContract.balanceOf(account).then(function(value) {
		lazyValueUpdate(element, value.valueOf());
		balances[account] = value;
	});
}

function showCoupons(account, element) {
	CouponContract.balanceOf(account).then(function(value) {
		lazyValueUpdate(element, value.valueOf());
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
			var value = liability.valueOf() + ' ETH: (incl 10% INT) owed to Investor';
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
	var balance_element = document.getElementById(element);
	if (balance_element.innerHTML !== value.valueOf()) {
		balance_element.innerHTML = value.valueOf();
	}
}

// function showImpact(name) {
// 	ImpactContract.getImpactCount.call(name).then(function(c) {
// 		var count = c.valueOf();
// 		alert(name + ' impact: ' + count);
// 		for (var i = 0; i < count; i++) {
// 			(function(index) {
// 				ImpactContract.getImpactDonor.call(name, i).then(function(address) {
// 					alert(name + ' address[' + index + ']: ' + address);
// 					ImpactContract.getImpactValue
// 						.call(name, address)
// 						.then(function(value) {
// 							alert(name + ' value[' + index + ']: ' + value);
// 						});
// 				});
// 			})(i);
// 		}
// 	});
// }

function setTriggersForElementsWithChangeableAmounts() {
	$('.amount-changeable').on('DOMSubtreeModified', function(event) {
		blinkElement($(event.currentTarget));
	});
}

function blinkElement(el) {
	var timeout = 30;
	// wait until all events on the element finish
	el.promise().done(function() {
		// disable trigger for current element to avoid double blinking
		el.off('DOMSubtreeModified');
		var startFontSize = el.css('font-size');
		var increasedFontSize = parseInt(startFontSize) * 1.4 + 'px';
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
							blinkElement(el);
						});
					}
				);
			}
		);
	});
}

window.deposit = function(account, value) {
	TokenContract.mint(wallets[account].address, value, {
		from: aliceAccount,
		gas: 1000000
	}).then(function(tx) {
		refreshBalance();
		printTx('DONOR DEPOSIT: ', tx);
	});
};

window.depositToInvestor = async function(value) {
	TokenContract.mint(InvestorContract.address, value, {
		from: aliceAccount,
		gas: 1000000
	}).then(function(tx) {
		refreshBalance();
		printTx('INVESTOR DEPOSIT: ', tx);
	});
};

window.donate = async function(account, value) {
	wallets[account]
		.donate(value, PROJECT_NAME, { from: aliceAccount, gas: 1000000 })
		.then(function(tx) {
			refreshBalance();
			printTx('DONATION: ', tx);
		});
};

window.invest = async function(value) {
	InvestorContract.invest(value, PROJECT_NAME, {
		from: aliceAccount,
		gas: 1000000
	}).then(function(tx) {
		refreshBalance();
		printTx('INVESTMENT: ', tx);
	});
};

// window.redeem = async function(value) {
// 	InvestorContract.redeemCoupons(value, PROJECT_NAME, {
// 		from: aliceAccount,
// 		gas: 1000000
// 	}).then(function(tx) {
// 		refreshBalance();
// 		printTx('COUPON REDEMPTION: ', tx);
// 	});
// };

window.donateAll = async function(account) {
	var total = await TokenContract.balanceOf(wallets[account].address);
	donate(account, total.valueOf());
};

window.validateOutcome = async function(name, value) {
	var tx = await ProjectContract.validateOutcome(name, value, {
		from: validatorAccount,
		gas: 500000
	});
	printTx('VERIFICATION: ', tx);
	refreshBalance();
	return linkImpact(name);
};

window.payBack = async function(account) {
	var tx = await ProjectContract.payBack(wallets[account].address, {
		from: aliceAccount,
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
		.call(name, { from: aliceAccount })
		.then(function(val) {
			if (val > 0) {
				return ImpactContract.linkImpact(name, {
					from: aliceAccount,
					gas: 3000000
				}).then(function(tx) {
					return linkImpact(name);
				});
			}
		});
}

function mapAccounts(accounts) {
	aliceAccount = accounts[0];
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
	var logBox = document.getElementById('log');
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
	AliceToken.setProvider(web3.currentProvider);
	TokenContract = await AliceToken.new({ from: aliceAccount, gas: 3000000 });
	printContract('TOKEN: ', TokenContract);
}

async function deployProject() {
	ProjectWithBonds.setProvider(web3.currentProvider);
	Catalog.setProvider(web3.currentProvider);
	ImpactRegistry.setProvider(web3.currentProvider);
	Linker.setProvider(web3.currentProvider);
	Coupon.setProvider(web3.currentProvider);
	ProjectContract = await ProjectWithBonds.new(PROJECT_NAME, 0, 100, 1000, {
		from: aliceAccount,
		gas: 5000000
	});
	printContract('PROJECT: ', ProjectContract);
	CouponContract = Coupon.at(
		await ProjectContract.getCoupon({ from: aliceAccount })
	);
	await ProjectContract.setValidator(validatorAccount, {
		from: aliceAccount,
		gas: 3000000
	});
	await ProjectContract.setBeneficiary(beneficiaryAccount, {
		from: aliceAccount,
		gas: 3000000
	});
	await ProjectContract.setToken(TokenContract.address, {
		from: aliceAccount,
		gas: 3000000
	});
	ImpactContract = await ImpactRegistry.new(ProjectContract.address, {
		from: aliceAccount,
		gas: 3000000
	});
	var linker = await Linker.new(ImpactContract.address, 10, {
		from: aliceAccount,
		gas: 3000000
	});
	await ImpactContract.setLinker(linker.address, {
		from: aliceAccount,
		gas: 3000000
	});
	await ProjectContract.setImpactRegistry(ImpactContract.address, {
		from: aliceAccount,
		gas: 3000000
	});
	CatalogContract = await Catalog.new({ from: aliceAccount, gas: 3000000 });
	printContract('CATALOG: ', CatalogContract);
	await CatalogContract.addProject(PROJECT_NAME, ProjectContract.address, {
		from: aliceAccount,
		gas: 3000000
	});
}

async function deployWallet(donor) {
	Wallet.setProvider(web3.currentProvider);
	wallets[donor] = await Wallet.new(CatalogContract.address, {
		from: aliceAccount,
		gas: 3000000
	});
	printContract('DONOR: ', wallets[donor]);
}

async function deployInvestorWallet() {
	Investor.setProvider(web3.currentProvider);
	InvestorContract = await Investor.new(CatalogContract.address, {
		from: aliceAccount,
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
	setTriggersForElementsWithChangeableAmounts();
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
