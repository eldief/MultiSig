// import contract artifact
const MultiSignatureWallet = artifacts.require('MultiSignature');

// import expectRevert from open zeppelin test helpers
const {expectRevert} = require('@openzeppelin/test-helpers');


// testing contract MultiSignature
contract('MultiSignature', (accounts) => {
	
	// instance a variable to deploy the contract
	let multiSignature;
	
	// execute before tests
	beforeEach(async () => {
		
		// deploy the contract 
		multiSignature = await MultiSignatureWallet.new(
			// constructor args
			[accounts[0], accounts[1], accounts[2]],	// address[] memory
			2						// uint
		);		
	});
	
	it('Testing for constructor and getters', async () => {		// declare a test: it('description', async(args) => {});
		
		// function getMinSignatures() external view approversOnly() returns(uint)
		const minSignatures = await multiSignature.getMinSignatures();
		assert(minSignatures.toNumber() === 2, `Invalid minSignature number: ${minSignatures.toNumber()}. Expecting 2.`);
		
		// function getMaxSignatures() external view approversOnly() returns(uint)
		const maxSignatures = await multiSignature.getMaxSignatures();
		assert(maxSignatures.toNumber() === 3, `Invalid maxSignatures number: ${maxSignatures.toNumber()}. Expecting 3.`);
		
		// function getAddresses() exernal view returns(address[] memory)
		const addresses = await multiSignature.getAddresses();
		assert(addresses.length === 3, `Invalid addresses length: ${addresses.length}. Expecting 3.`);
		assert(addresses[0] === accounts[0], `Invalid address at position 1: ${addresses[0]}. accounts ${addresses[0]}.`);
		assert(addresses[2] === accounts[2], `Invalid address at position 1: ${addresses[2]}. accounts ${addresses[2]}.`);
		assert(addresses[1] === accounts[1], `Invalid address at position 1: ${addresses[1]}. accounts ${addresses[1]}.`);
		
		// function getbalance() external view approversOnly() returns(uint)
		const balance = await multiSignature.getbalance();
		assert(balance.toNumber() === 0, `Invalid balance: ${balance.toNumber()}. Expecting 0.`);
		
		// function getTransactions() external view approversOnly() returns(TransactionRequest[] memory) 
		const transaction = await multiSignature.getTransactions();
		assert(transaction.id === undefined, `Invalid transaction id: ${transaction.id}. Expecting undefined.`);
		assert(transaction.amount === undefined, `Invalid transaction amount: ${transaction.amount}. Expecting undefined.`);
		assert(transaction.to === undefined, `Invalid transaction recipient: ${transaction.to}. Expecting undefined.`);
		assert(transaction.approvals === undefined, `Invalid transaction approvals number: ${transaction.approvals}. Expecting undefined.`);
		assert(transaction.requirer === undefined, `Invalid transaction requirer: ${transaction.requirer}. Expecting undefined.`);
		assert(transaction.payed === undefined, `Invalid status: payed = ${transaction.payed}. Expecting undefined.`);
		
		// function getTransactions() external view approversOnly() returns(TransactionRequest[] memory) 
		const transactions = await multiSignature.getTransactions();
		assert(transactions.length === 0, `Invalid transactions number: ${transactions.length}. Expecting 0.`);
	});
	
	it('Testing for contract funding', async () => {
		
		// receive() payable external
		await web3.eth.sendTransaction({	// truffle is already injected with web3
			from: accounts[0],		// sender
			to: multiSignature.address,	// recipient
			value: 1e18			// amount: 1 eth
		});
		
		// function getbalance() external view approversOnly() returns(uint)
		const balance = await multiSignature.getbalance();
		assert(balance.toString() === (1e18).toString(), `Invalid balance: ${balance.toString()}. Expecting {(1e18).toString()}.`);
	});
	
	it('Testing for failing via modifier approversOnly', async () => {
		
		// expecting these transactions to be reverted by modifier approversOnly()
		await expectRevert(
			// function addTransaction(uint amount, address payable to) external approversOnly() returns(uint)
			multiSignature.addTransaction((1e18).toString(), accounts[5], {from: accounts[3]}),
			'Not a multi-signature approver'
		);
		await expectRevert(
			// function getMinSignatures() external view approversOnly() returns(uint)
			multiSignature.getMinSignatures({from: accounts[3]}),
			'Not a multi-signature approver'
		);
		await expectRevert(
			// function getMaxSignatures() external view approversOnly() returns(uint) 
			multiSignature.getMaxSignatures({from: accounts[3]}),
			'Not a multi-signature approver'
		);
		await expectRevert(
			// function getAddresses() external view approversOnly() returns(address[] memory)  
			multiSignature.getAddresses({from: accounts[3]}),
			'Not a multi-signature approver'
		);
		await expectRevert(
			// function getbalance() external view approversOnly() returns(uint) 
			multiSignature.getbalance({from: accounts[3]}),
			'Not a multi-signature approver'
		);
		await expectRevert(
			// function getTransaction(uint id) external view approversOnly() returns(TransactionRequest memory) 
			multiSignature.getTransaction(0, {from: accounts[3]}),
			'Not a multi-signature approver'
		);
		await expectRevert(

			// function getTransactions() external view approversOnly() returns(TransactionRequest[] memory) 
			multiSignature.getTransactions({from: accounts[3]}),
			'Not a multi-signature approver'
		);
		await expectRevert(
			// function addTransaction(uint amount, address payable to) external approversOnly()
			multiSignature.addTransaction(0, accounts[0], {from: accounts[3]}),
			'Not a multi-signature approver'
		);
		await expectRevert(
			// function approveTransaction(uint id) external approversOnly() notPayed(id) 
			multiSignature.approveTransaction(0, {from: accounts[3]}),
			'Not a multi-signature approver'
		);
		await expectRevert(
			// function unapproveTransaction(uint id) external approversOnly() notPayed(id) 
			multiSignature.unapproveTransaction(0, {from: accounts[3]}),
			'Not a multi-signature approver'
		);
		await expectRevert(
			// function executeTransaction(uint id) external approversOnly() notPayed(id) 
			multiSignature.executeTransaction(0, {from: accounts[3]}),
			'Not a multi-signature approver'
		);
	});
	
	it('Testing for creating a TransferRequest', async () => {
		
		// function addTransaction(uint amount, address payable to) external approversOnly() returns(uint)
		await multiSignature.addTransaction((1e18).toString(), accounts[5], {from: accounts[0]});
		
		// function getTransaction(uint id) external view approversOnly() returns(TransactionRequest memory)
		const transaction = await multiSignature.getTransaction(0, {from: accounts[0]});
		assert(transaction.id === '0', `Invalid transaction id: ${transaction.id}. Expecting 0.`);
		assert(transaction.amount.toString() === (1e18).toString(), `Invalid transaction amount: ${transaction.amount.toString()}. Expecting {(1e18).toString()}.`);
		assert(transaction.to.toString() === (accounts[5]).toString(), `Invalid transaction recipient: ${transaction.to.toString()}. Expecting {(accounts[5]).toString()}.`);
		assert(transaction.approvals === '0', `Invalid transaction approvals number: ${transaction.approvals}. Expecting 0.`);
		assert(transaction.requirer.toString() === accounts[0].toString(), `Invalid transaction requirer: ${transaction.requirer.toString()}. Expecting {accounts[0].toString()}.`);
		assert(transaction.payed === false, `Invalid status: payed = ${transaction.payed.toString()}. Expecting false.`);
	});
	
	it('Testing for approving a transaction', async () => {
		
		// function addTransaction(uint amount, address payable to) external approversOnly() returns(uint)
		await multiSignature.addTransaction((1e18).toString(), accounts[5], {from: accounts[0]});

		// function approveTransaction(uint id) external approversOnly() notPayed(id)
		await multiSignature.approveTransaction(0, {from: accounts[0]});
		
		// function getTransaction(uint id) external view approversOnly() returns(TransactionRequest memory)
		const transaction = await multiSignature.getTransaction(0, {from: accounts[0]});
		assert(transaction.approvals === '1', `Invalid transaction approvals number: ${transaction.approvals}. Expecting 1.`);
		assert(transaction.payed === false, `Invalid status: payed = ${transaction.payed.toString()}. Expecting false.`);
	});
	
	it('Testing for failing approving a transaction', async () => {
		
		// function addTransaction(uint amount, address payable to) external approversOnly() returns(uint)
		await multiSignature.addTransaction((1e18).toString(), accounts[5], {from: accounts[0]});

		// function approveTransaction(uint id) external approversOnly() notPayed(id)
		await multiSignature.approveTransaction(0, {from: accounts[0]});
		
		// expecting this transaction to be reverted 
		await expectRevert(		
			// function approveTransaction(uint id) external approversOnly() notPayed(id)
			multiSignature.approveTransaction(0, {from: accounts[0]}),
			'Transaction already approved'
		);
		
		// function getTransaction(uint id) external view approversOnly() returns(TransactionRequest memory)
		const transaction = await multiSignature.getTransaction(0, {from: accounts[0]});
		assert(transaction.approvals === '1', `Invalid transaction approvals number: ${transaction.approvals}. Expecting 1.`);
		assert(transaction.payed === false, `Invalid status: payed = ${transaction.payed.toString()}. Expecting false.`);
	});
	
	it('Testing for unapproving a transaction', async () => {
		
		// function addTransaction(uint amount, address payable to) external approversOnly() returns(uint)
		await multiSignature.addTransaction((1e18).toString(), accounts[5], {from: accounts[0]});

		// function approveTransaction(uint id) external approversOnly() notPayed(id)
		await multiSignature.approveTransaction(0, {from: accounts[0]});
		
		//  function unapproveTransaction(uint id) external approversOnly() notPayed(id)
		await multiSignature.unapproveTransaction(0);
		
		// function getTransaction(uint id) external view approversOnly() returns(TransactionRequest memory)
		const transaction = await multiSignature.getTransaction(0, {from: accounts[0]});
		assert(transaction.approvals === '0', `Invalid transaction approvals number: ${transaction.approvals}. Expecting 1.`);
		assert(transaction.payed === false, `Invalid status: payed = ${transaction.payed.toString()}. Expecting false.`);
	});
	
	it('Testing for failing unapproving a transaction', async () => {
		
		// function addTransaction(uint amount, address payable to) external approversOnly() returns(uint)
		await multiSignature.addTransaction((1e18).toString(), accounts[5], {from: accounts[0]});

		// expecting this transaction to be reverted 
		await expectRevert(		
			// function unapproveTransaction(uint id) external approversOnly() notPayed(id)
			multiSignature.unapproveTransaction(0, {from: accounts[0]}),
			'Transaction is not approved'
		);
		
		// function getTransaction(uint id) external view approversOnly() returns(TransactionRequest memory)
		const transaction = await multiSignature.getTransaction(0, {from: accounts[0]});
		assert(transaction.approvals === '0', `Invalid transaction approvals number: ${transaction.approvals}. Expecting 0.`);
		assert(transaction.payed === false, `Invalid status: payed = ${transaction.payed.toString()}. Expecting false.`);
	});
	
	it('Testing for executing a transaction', async () => {
		
		// fund contract
		await web3.eth.sendTransaction({	// truffle is already injected with web3
			from: accounts[0],				// sender
			to: multiSignature.address,		// recipient
			value: 1e18						// amount (1 eth)
		});
		
		// function addTransaction(uint amount, address payable to) external approversOnly() returns(uint)
		await multiSignature.addTransaction((1e18).toString(), accounts[5], {from: accounts[0]});

		// function approveTransaction(uint id) external approversOnly() notPayed(id)
		await multiSignature.approveTransaction(0, {from: accounts[0]});
		
		// function approveTransaction(uint id) external approversOnly() notPayed(id)
		await multiSignature.approveTransaction(0, {from: accounts[1]});
		
		// save starting balance for transaction recipient
		const startingBalance = await web3.eth.getBalance(accounts[5]);
		
		// function executeTransaction(uint id) external approversOnly() notPayed(id)
		await multiSignature.executeTransaction(0, {from: accounts[0]});
		
		// saving ending balance after transaction is executed
		const endingBalance = await web3.eth.getBalance(accounts[5]); 
		
		// saving balance delta
		const balanceDelta = parseInt(endingBalance) - parseInt(startingBalance);
		
		// function getTransaction(uint id) external view approversOnly() returns(TransactionRequest memory)
		const transaction = await multiSignature.getTransaction(0, {from: accounts[0]});
		assert(transaction.approvals === '2', `Invalid transaction approvals number: ${transaction.approvals}. Expecting 2.`);
		assert(transaction.payed === true, `Invalid status: payed = ${transaction.payed.toString()}. Expecting true.`);
		assert(balanceDelta.toString() === transaction.amount.toString(), `Invalid balance for the recipient: ${balanceDelta.toString()}'. Expecting ${transaction.amount.toString()}`);
	});
	
	it('Testing for failing executing a transaction for insufficient approvals', async () => {
		
		// function addTransaction(uint amount, address payable to) external approversOnly() returns(uint)
		await multiSignature.addTransaction((1e18).toString(), accounts[5], {from: accounts[0]});

		// function approveTransaction(uint id) external approversOnly() notPayed(id)
		await multiSignature.approveTransaction(0, {from: accounts[0]});
		
		// expecting this transaction to be reverted
		await expectRevert(		
			// function executeTransaction(uint id) external approversOnly() notPayed(id)
			multiSignature.executeTransaction(0, {from: accounts[0]}),
			'Transaction is not approved'
		);
		
		// function getTransaction(uint id) external view approversOnly() returns(TransactionRequest memory)
		const transaction = await multiSignature.getTransaction(0, {from: accounts[0]});
		assert(transaction.approvals === '1', `Invalid transaction approvals number: ${transaction.approvals}. Expecting 1.`);
		assert(transaction.payed === false, `Invalid status: payed = ${transaction.payed.toString()}. Expecting false.`);
	});
	
	it('Testing for failing executing a transaction for insufficient balance', async () => {
		
		// function addTransaction(uint amount, address payable to) external approversOnly() returns(uint)
		await multiSignature.addTransaction((1e18).toString(), accounts[5], {from: accounts[0]});

		// function approveTransaction(uint id) external approversOnly() notPayed(id)
		await multiSignature.approveTransaction(0, {from: accounts[0]});
		
		// function approveTransaction(uint id) external approversOnly() notPayed(id)
		await multiSignature.approveTransaction(0, {from: accounts[1]});
		
		// save starting balance for transaction recipient
		const startingBalance = await web3.eth.getBalance(accounts[5]);
		
		// expecting this transaction to be reverted
		await expectRevert(		
			// function executeTransaction(uint id) external approversOnly() notPayed(id)
			multiSignature.executeTransaction(0, {from: accounts[0]}),
			'revert'
		);
		
		// saving ending balance after transaction is executed
		const endingBalance = await web3.eth.getBalance(accounts[5]); 
		
		// saving balance delta
		const balanceDelta = parseInt(endingBalance) - parseInt(startingBalance);
		
		// function getTransaction(uint id) external view approversOnly() returns(TransactionRequest memory)
		const transaction = await multiSignature.getTransaction(0, {from: accounts[0]});
		assert(transaction.approvals === '2', `Invalid transaction approvals number: ${transaction.approvals}. Expecting 2.`);
		assert(transaction.payed === false, `Invalid status: payed = ${transaction.payed.toString()}. Expecting false.`);
		assert(balanceDelta.toString() === '0', `Invalid balance for the recipient: ${balanceDelta.toString()}'. Expecting 0`);
	});
	
});
