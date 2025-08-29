# BalanceTracker Smart Contract

A comprehensive Solidity smart contract for tracking account balances and transaction history on the Ethereum blockchain.

## Features

### 🏦 Balance Management
- **Deposits**: Users can deposit ETH into their account
- **Withdrawals**: Users can withdraw ETH from their account
- **Transfers**: Users can transfer ETH between accounts
- **Balance Tracking**: Real-time balance monitoring for all accounts

### 📊 Transaction History
- **Complete Transaction Log**: Every transaction is recorded with full details
- **Transaction Types**: Deposits, withdrawals, and transfers are clearly categorized
- **Timestamps**: All transactions include blockchain timestamps
- **Descriptions**: Custom descriptions for each transaction
- **Account-Specific History**: Each account can view their own transaction history

### 🔍 Query Functions
- **Account Balance**: Get current balance for any address
- **Account Information**: Comprehensive account summary including totals and transaction counts
- **Transaction Details**: Retrieve specific transaction information by index
- **Global Statistics**: Total transaction count and contract balance

## Smart Contract Structure

### Data Structures

```solidity
struct Transaction {
    address from;           // Sender address (zero address for deposits)
    address to;             // Receiver address (zero address for withdrawals)
    uint256 amount;         // Transaction amount in wei
    uint256 timestamp;      // Block timestamp
    string description;     // Custom transaction description
    bool isDeposit;         // True if this is a deposit
    bool isWithdrawal;      // True if this is a withdrawal
}

struct AccountInfo {
    uint256 balance;        // Current account balance
    uint256 totalDeposits;  // Total deposits made
    uint256 totalWithdrawals; // Total withdrawals made
    uint256 transactionCount; // Number of transactions
    mapping(uint256 => uint256) transactionIndices; // Transaction index mapping
}
```

### Core Functions

#### State-Changing Functions
- `deposit(string memory description)` - Deposit ETH with description
- `withdraw(uint256 amount, string memory description)` - Withdraw ETH with description
- `transfer(address to, uint256 amount, string memory description)` - Transfer ETH to another account

#### View Functions
- `getBalance(address account)` - Get account balance
- `getAccountInfo(address account)` - Get comprehensive account information
- `getTransaction(uint256 index)` - Get transaction by global index
- `getAccountTransaction(address account, uint256 accountTxIndex)` - Get transaction by account-specific index
- `getTotalTransactions()` - Get total number of transactions
- `getContractBalance()` - Get contract's total ETH balance

### Events
- `BalanceUpdated(address indexed account, uint256 newBalance, uint256 change)`
- `TransactionRecorded(address indexed from, address indexed to, uint256 amount, uint256 timestamp, string description, bool isDeposit, bool isWithdrawal)`

## Usage Examples

### Basic Operations

```solidity
// Deposit 1 ETH
balanceTracker.deposit("Initial deposit", { value: ethers.utils.parseEther("1") });

// Withdraw 0.5 ETH
balanceTracker.withdraw(ethers.utils.parseEther("0.5"), "Partial withdrawal");

// Transfer 0.3 ETH to another address
balanceTracker.transfer(recipientAddress, ethers.utils.parseEther("0.3"), "Payment");
```

### Querying Information

```solidity
// Get account balance
uint256 balance = balanceTracker.getBalance(userAddress);

// Get account summary
(uint256 balance, uint256 deposits, uint256 withdrawals, uint256 txCount) = 
    balanceTracker.getAccountInfo(userAddress);

// Get transaction details
(address from, address to, uint256 amount, uint256 timestamp, string memory description, bool isDeposit, bool isWithdrawal) = 
    balanceTracker.getTransaction(0);
```

## Security Features

### Access Control
- **No Owner Functions**: All functions are public, ensuring transparency
- **Balance Validation**: Prevents withdrawals exceeding available balance
- **Address Validation**: Prevents transfers to zero address or self

### Input Validation
- **Amount Validation**: All amounts must be greater than 0
- **Balance Checks**: Sufficient balance required for withdrawals and transfers
- **Address Validation**: Valid recipient addresses required for transfers

### Emergency Functions
- **Emergency Withdraw**: Allows users to withdraw their entire balance if needed

## Testing

The contract includes comprehensive tests covering:

- ✅ Deposit functionality and balance tracking
- ✅ Withdrawal functionality and balance validation
- ✅ Transfer functionality between accounts
- ✅ Transaction history recording and retrieval
- ✅ Account-specific transaction history
- ✅ Event emission verification
- ✅ Error handling and edge cases
- ✅ Contract balance management

### Running Tests

```bash
# Run all tests
npx hardhat test

# Run only BalanceTracker tests
npx hardhat test test/BalanceTracker.ts

# Run Solidity tests
npx hardhat test solidity
```

## Deployment

### Using Hardhat Script
```bash
npx hardhat run scripts/deploy-balance-tracker.ts
```

### Using Ignition Module
```bash
npx hardhat ignition deploy ignition/modules/BalanceTracker.ts
```

### Deploy to Specific Network
```bash
npx hardhat ignition deploy --network sepolia ignition/modules/BalanceTracker.ts
```

## Demo Script

A comprehensive demo script (`scripts/demo-balance-tracker.ts`) showcases all contract functionality:

1. **Deposits**: Multiple users depositing ETH
2. **Transfers**: ETH transfers between accounts
3. **Withdrawals**: Partial balance withdrawals
4. **Transaction History**: Complete transaction logging
5. **Account Information**: Detailed account summaries
6. **Complex Scenarios**: Multi-user interactions

Run the demo:
```bash
npx hardhat run scripts/demo-balance-tracker.ts
```

## Gas Optimization

The contract is optimized for gas efficiency:

- **Efficient Storage**: Uses mappings for O(1) lookups
- **Minimal State Changes**: Only necessary state updates
- **Optimized Loops**: Efficient transaction indexing
- **Event Usage**: Events for off-chain tracking instead of storage

## Use Cases

### Personal Finance Tracking
- Track personal ETH deposits and withdrawals
- Monitor spending patterns
- Maintain transaction history

### Business Applications
- Employee expense tracking
- Vendor payment management
- Financial audit trails

### DeFi Integration
- Balance tracking for DeFi protocols
- Transaction history for yield farming
- Portfolio management tools

### Educational Purposes
- Learning Solidity development
- Understanding smart contract patterns
- Blockchain transaction concepts

## Technical Requirements

- **Solidity Version**: ^0.8.28
- **Hardhat**: ^3.0.3
- **Viem**: ^2.36.0
- **TypeScript**: ~5.8.0

## License

This project is licensed under the UNLICENSED license.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the contract functionality and security.

---

**Note**: This is a demonstration contract. For production use, consider additional security audits, access controls, and integration with established DeFi protocols.
