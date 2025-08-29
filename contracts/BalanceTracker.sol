// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract BalanceTracker {
    struct Transaction {
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        string description;
        bool isDeposit;
        bool isWithdrawal;
    }
    
    struct AccountInfo {
        uint256 balance;
        uint256 totalDeposits;
        uint256 totalWithdrawals;
        uint256 transactionCount;
        mapping(uint256 => uint256) transactionIndices; // Maps transaction index to global transaction index
    }
    
    struct AccountInfoReturn {
        uint256 balance;
        uint256 totalDeposits;
        uint256 totalWithdrawals;
        uint256 transactionCount;
    }
    
    mapping(address => AccountInfo) public accounts;
    Transaction[] public transactions;
    
    event BalanceUpdated(address indexed account, uint256 newBalance, uint256 change);
    event TransactionRecorded(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 timestamp,
        string description,
        bool isDeposit,
        bool isWithdrawal
    );
    
    modifier validAmount(uint256 amount) {
        require(amount > 0, "Amount must be greater than 0");
        _;
    }
    
    modifier sufficientBalance(address account, uint256 amount) {
        require(accounts[account].balance >= amount, "Insufficient balance");
        _;
    }
    
    // Deposit function - increases balance
    function deposit(string memory description) public payable validAmount(msg.value) {
        accounts[msg.sender].balance += msg.value;
        accounts[msg.sender].totalDeposits += msg.value;
        accounts[msg.sender].transactionCount++;
        
        uint256 transactionIndex = transactions.length;
        transactions.push(Transaction({
            from: address(0),
            to: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            description: description,
            isDeposit: true,
            isWithdrawal: false
        }));
        
        accounts[msg.sender].transactionIndices[accounts[msg.sender].transactionCount - 1] = transactionIndex;
        
        emit BalanceUpdated(msg.sender, accounts[msg.sender].balance, msg.value);
        emit TransactionRecorded(
            address(0),
            msg.sender,
            msg.value,
            block.timestamp,
            description,
            true,
            false
        );
    }
    
    // Withdraw function - decreases balance
    function withdraw(uint256 amount, string memory description) 
        public 
        validAmount(amount) 
        sufficientBalance(msg.sender, amount) 
    {
        accounts[msg.sender].balance -= amount;
        accounts[msg.sender].totalWithdrawals += amount;
        accounts[msg.sender].transactionCount++;
        
        uint256 transactionIndex = transactions.length;
        transactions.push(Transaction({
            from: msg.sender,
            to: address(0),
            amount: amount,
            timestamp: block.timestamp,
            description: description,
            isDeposit: false,
            isWithdrawal: true
        }));
        
        accounts[msg.sender].transactionIndices[accounts[msg.sender].transactionCount - 1] = transactionIndex;
        
        payable(msg.sender).transfer(amount);
        
        emit BalanceUpdated(msg.sender, accounts[msg.sender].balance, amount);
        emit TransactionRecorded(
            msg.sender,
            address(0),
            amount,
            block.timestamp,
            description,
            false,
            true
        );
    }
    
    // Transfer function - moves balance between accounts
    function transfer(address to, uint256 amount, string memory description) 
        public 
        validAmount(amount) 
        sufficientBalance(msg.sender, amount) 
    {
        require(to != address(0), "Cannot transfer to zero address");
        require(to != msg.sender, "Cannot transfer to self");
        
        accounts[msg.sender].balance -= amount;
        accounts[to].balance += amount;
        
        // Record transaction for sender
        accounts[msg.sender].transactionCount++;
        uint256 senderTransactionIndex = transactions.length;
        transactions.push(Transaction({
            from: msg.sender,
            to: to,
            amount: amount,
            timestamp: block.timestamp,
            description: description,
            isDeposit: false,
            isWithdrawal: false
        }));
        accounts[msg.sender].transactionIndices[accounts[msg.sender].transactionCount - 1] = senderTransactionIndex;
        
        // Record transaction for receiver
        accounts[to].transactionCount++;
        uint256 receiverTransactionIndex = transactions.length;
        transactions.push(Transaction({
            from: msg.sender,
            to: to,
            amount: amount,
            timestamp: block.timestamp,
            description: description,
            isDeposit: false,
            isWithdrawal: false
        }));
        accounts[to].transactionIndices[accounts[to].transactionCount - 1] = receiverTransactionIndex;
        
        emit BalanceUpdated(msg.sender, accounts[msg.sender].balance, amount);
        emit BalanceUpdated(to, accounts[to].balance, amount);
        emit TransactionRecorded(
            msg.sender,
            to,
            amount,
            block.timestamp,
            description,
            false,
            false
        );
    }
    
    // View functions
    function getBalance(address account) public view returns (uint256) {
        return accounts[account].balance;
    }
    
    function getAccountInfo(address account) public view returns (AccountInfoReturn memory) {
        AccountInfo storage info = accounts[account];
        return AccountInfoReturn({
            balance: info.balance,
            totalDeposits: info.totalDeposits,
            totalWithdrawals: info.totalWithdrawals,
            transactionCount: info.transactionCount
        });
    }
    
    function getTransaction(uint256 index) public view returns (
        address from,
        address to,
        uint256 amount,
        uint256 timestamp,
        string memory description,
        bool isDeposit,
        bool isWithdrawal
    ) {
        require(index < transactions.length, "Transaction index out of bounds");
        Transaction storage transaction = transactions[index];
        return (
            transaction.from,
            transaction.to,
            transaction.amount,
            transaction.timestamp,
            transaction.description,
            transaction.isDeposit,
            transaction.isWithdrawal
        );
    }
    
    function getAccountTransaction(address account, uint256 accountTxIndex) 
        public 
        view 
        returns (
            address from,
            address to,
            uint256 amount,
            uint256 timestamp,
            string memory description,
            bool isDeposit,
            bool isWithdrawal
        ) 
    {
        require(accountTxIndex < accounts[account].transactionCount, "Account transaction index out of bounds");
        uint256 globalIndex = accounts[account].transactionIndices[accountTxIndex];
        return getTransaction(globalIndex);
    }
    
    function getTotalTransactions() public view returns (uint256) {
        return transactions.length;
    }
    
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    // Emergency function to withdraw contract balance (only owner)
    function emergencyWithdraw() public {
        require(accounts[msg.sender].balance > 0, "No balance to withdraw");
        uint256 balance = accounts[msg.sender].balance;
        accounts[msg.sender].balance = 0;
        
        payable(msg.sender).transfer(balance);
        
        emit BalanceUpdated(msg.sender, 0, balance);
    }
}
