pragma solidity ^0.8.0;


contract MultiSignature {
    
// struct

    // transaction request by one of the multi-signature partecipant
    struct TransactionRequest {
        uint id;                            // transaction request id
        uint amount;                        // amount to be sent
        address payable to;                 // recipient of the transaction
        uint approvals;                     // number of addresses approving this transaction
        address requirer;                   // requirer of the transaction
        bool payed;                         // transaction is payed
    }
    
    
// variables

    // minimum number of signatures needed for execute a transaction
    uint immutable minSignatures;
    
    // maximum number of addresses partecipating in multi-signature wallet
    uint immutable maxSignatures;
    
    // number of transactions
    uint private txCount;
    
    // addresses partecipating in mult-signature wallet
    address[] private approvers;
    
    // transaction requests
    TransactionRequest[] requests;
    
    // multi-signature approvals
    mapping(address => mapping(uint => bool)) private approvals;
    
    
// modifiers 

    // check if the transaction is sent by an address partecipating in the multi-signature wallet
    modifier approversOnly() {
        bool isApprover = false;
        
        for (uint i = 0; i < approvers.length; ++i) {
            if (approvers[i] == msg.sender) {
                isApprover = true;
            }
        }
        require (isApprover, 'Not a multi-signature approver');
        _;
    }
    
    // check if a transaction is not already payed
    modifier notPayed(uint id) {
        require(!requests[id].payed, 'Transaction has been already executed');
        _;
    }
    
    
// events

    event TransactionAdd(address from, address payable to, uint value, uint id);
    
    event Approved(address from, uint id);
    
    event Unapproved(address from, uint id);
    
    event Payed(address payable to, uint amount);
    
    
// constructor

    constructor(address[] memory _approvers, uint _minSignatures) {
        
        // check intialization parameters
        require (_minSignatures > 0, 'Invalid min signatures param');
        require (_approvers.length > 0, 'Invalid approvers length param');
        require (_minSignatures < _approvers.length, 'Min signatures must be < approvers');
        
        minSignatures = _minSignatures;
        maxSignatures = _approvers.length;
        approvers = _approvers;
        txCount = 0;
    }
    
    
// getters

    function getMinSignatures() external view approversOnly() returns(uint) {
        return minSignatures;
    }
    
    function getMaxSignatures() external view approversOnly() returns(uint) {
        return maxSignatures;
    }
    
    function getAddresses() external view approversOnly() returns(address[] memory) {
        return approvers;
    }
    
    function getbalance() external view approversOnly() returns(uint) {
        return address(this).balance;    
    }
    
    function getTransaction(uint id) external view approversOnly() returns(TransactionRequest memory) {
        return requests[id];
    }
    
    function getTransactions() external view approversOnly() returns(TransactionRequest[] memory) {
        return requests;
    }
    
// default

    // deposit into the multi-signature
    receive() payable external {
        
    }
    
    // fallback
    fallback() external  {}
    
    
// public

    // add a new transaction to be approved
    function addTransaction(uint amount, address payable to) external approversOnly() {
        
        // create a new transaction request
         requests.push(TransactionRequest({
            id: txCount,
            amount: amount,
            to: to,
            requirer: msg.sender,
            payed: false,
            approvals: 0
        }));
        
        // emit event
        emit TransactionAdd(msg.sender, to, amount, txCount);
        
        // increment tx id
        ++txCount;
    }
    
    // approve a transaction
    function approveTransaction(uint id) external approversOnly() notPayed(id) {
        
        // check if transction is already approved by this address
        require(!approvals[msg.sender][id], 'Transaction already approved');
        
        // set approved flag
        approvals[msg.sender][id] = true;
        
        // increment approvals count for this transaction
        requests[id].approvals++;
        
        // emit event
        //emit Approved(msg.sender, id);
    }
    
    // unapprove a transaction
    function unapproveTransaction(uint id) external approversOnly() notPayed(id) {
        
        // check if transction is already approved by this address
        require(approvals[msg.sender][id], 'Transaction is not approved');
        
        // remove approved flag
        approvals[msg.sender][id] = false;
        
        // decrement approvals count for this transaction
        requests[id].approvals--;

        // emit event
        emit Unapproved(msg.sender, id);
    }
    
    // check if transaction is signed by a sufficient number of multi-signature partecipants and execute
    function executeTransaction(uint id) external approversOnly() notPayed(id) {
        
        require (requests[id].approvals >= minSignatures, 'Transaction is not approved');
        
        // execute transaction
        _executeTransaction(requests[id].amount, requests[id].to);
        
        // set transaction as payed
        requests[id].payed = true;
    }
    
    
// private

    // execute transaction
    function _executeTransaction(uint amount, address payable to) private {
        
        // transfer
        to.transfer(amount);  
        
        // emit event
        emit Payed(to, amount);
    }
}
