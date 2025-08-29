import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("BalanceTracker", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [senderClient, receiverClient] = await viem.getWalletClients();

  it("Should allow deposits and track balance correctly", async function () {
    const balanceTracker = await viem.deployContract("BalanceTracker");
    
    const depositAmount = 1000000000000000000n; // 1 ETH
    const description = "Initial deposit";
    
    // Check initial balance
    const initialBalance = await balanceTracker.read.getBalance([senderClient.account.address]);
    assert.equal(initialBalance, 0n, "Initial balance should be 0");
    
    // Make deposit
    await balanceTracker.write.deposit([description], { value: depositAmount });
    
    // Check balance after deposit
    const newBalance = await balanceTracker.read.getBalance([senderClient.account.address]);
    assert.equal(newBalance, depositAmount, "Balance should match deposit amount");
    
    // Check account info
    const accountInfo = await balanceTracker.read.getAccountInfo([senderClient.account.address]);
    assert.equal(accountInfo.balance, depositAmount, "Account info balance should match");
    assert.equal(accountInfo.totalDeposits, depositAmount, "Total deposits should match");
    assert.equal(accountInfo.totalWithdrawals, 0n, "Total withdrawals should be 0");
    assert.equal(accountInfo.transactionCount, 1n, "Transaction count should be 1");
  });

  it("Should allow withdrawals and track balance correctly", async function () {
    const balanceTracker = await viem.deployContract("BalanceTracker");
    
    const depositAmount = 2000000000000000000n; // 2 ETH
    const withdrawalAmount = 500000000000000000n; // 0.5 ETH
    const depositDesc = "Initial deposit";
    const withdrawalDesc = "Partial withdrawal";
    
    // Make deposit first
    await balanceTracker.write.deposit([depositDesc], { value: depositAmount });
    
    // Make withdrawal
    await balanceTracker.write.withdraw([withdrawalAmount, withdrawalDesc]);
    
    // Check balance after withdrawal
    const finalBalance = await balanceTracker.read.getBalance([senderClient.account.address]);
    const expectedBalance = depositAmount - withdrawalAmount;
    assert.equal(finalBalance, expectedBalance, "Balance should be reduced by withdrawal amount");
    
    // Check account info
    const accountInfo = await balanceTracker.read.getAccountInfo([senderClient.account.address]);
    assert.equal(accountInfo.totalDeposits, depositAmount, "Total deposits should remain unchanged");
    assert.equal(accountInfo.totalWithdrawals, withdrawalAmount, "Total withdrawals should match");
    assert.equal(accountInfo.transactionCount, 2n, "Transaction count should be 2");
  });

  it("Should allow transfers between accounts", async function () {
    const balanceTracker = await viem.deployContract("BalanceTracker");
    
    const depositAmount = 1000000000000000000n; // 1 ETH
    const transferAmount = 300000000000000000n; // 0.3 ETH
    const depositDesc = "Initial deposit";
    const transferDesc = "Transfer to receiver";
    
    // Make deposit
    await balanceTracker.write.deposit([depositDesc], { value: depositAmount });
    
    // Transfer to receiver
    await balanceTracker.write.transfer([receiverClient.account.address, transferAmount, transferDesc]);
    
    // Check sender balance
    const senderBalance = await balanceTracker.read.getBalance([senderClient.account.address]);
    const expectedSenderBalance = depositAmount - transferAmount;
    assert.equal(senderBalance, expectedSenderBalance, "Sender balance should be reduced");
    
    // Check receiver balance
    const receiverBalance = await balanceTracker.read.getBalance([receiverClient.account.address]);
    assert.equal(receiverBalance, transferAmount, "Receiver balance should match transfer amount");
    
    // Check transaction counts
    const senderInfo = await balanceTracker.read.getAccountInfo([senderClient.account.address]);
    const receiverInfo = await balanceTracker.read.getAccountInfo([receiverClient.account.address]);
    assert.equal(senderInfo.transactionCount, 2n, "Sender should have 2 transactions");
    assert.equal(receiverInfo.transactionCount, 1n, "Receiver should have 1 transaction");
  });

  it("Should track transaction history correctly", async function () {
    const balanceTracker = await viem.deployContract("BalanceTracker");
    
    const depositAmount = 1000000000000000000n; // 1 ETH
    const withdrawalAmount = 200000000000000000n; // 0.2 ETH
    const transferAmount = 300000000000000000n; // 0.3 ETH
    
    // Make deposit
    await balanceTracker.write.deposit(["Deposit"], { value: depositAmount });
    
    // Make withdrawal
    await balanceTracker.write.withdraw([withdrawalAmount, "Withdrawal"]);
    
    // Transfer to receiver
    await balanceTracker.write.transfer([receiverClient.account.address, transferAmount, "Transfer"]);
    
    // Check total transactions
    const totalTransactions = await balanceTracker.read.getTotalTransactions();
    assert.equal(totalTransactions, 5n, "Should have 5 total transactions (1 deposit + 1 withdrawal + 2 transfers)");
    
    // Check individual transactions
    const depositTx = await balanceTracker.read.getTransaction([0]);
    assert.equal(depositTx.from, "0x0000000000000000000000000000000000000000", "Deposit from should be zero address");
    assert.equal(depositTx.to, senderClient.account.address, "Deposit to should be sender");
    assert.equal(depositTx.amount, depositAmount, "Deposit amount should match");
    assert.equal(depositTx.isDeposit, true, "Should be marked as deposit");
    assert.equal(depositTx.isWithdrawal, false, "Should not be marked as withdrawal");
    
    const withdrawalTx = await balanceTracker.read.getTransaction([1]);
    assert.equal(withdrawalTx.from, senderClient.account.address, "Withdrawal from should be sender");
    assert.equal(withdrawalTx.to, "0x0000000000000000000000000000000000000000", "Withdrawal to should be zero address");
    assert.equal(withdrawalTx.amount, withdrawalAmount, "Withdrawal amount should match");
    assert.equal(withdrawalTx.isDeposit, false, "Should not be marked as deposit");
    assert.equal(withdrawalTx.isWithdrawal, true, "Should be marked as withdrawal");
  });

  it("Should retrieve account-specific transaction history", async function () {
    const balanceTracker = await viem.deployContract("BalanceTracker");
    
    const depositAmount = 1000000000000000000n; // 1 ETH
    const transferAmount = 400000000000000000n; // 0.4 ETH
    
    // Make deposit
    await balanceTracker.write.deposit(["Deposit"], { value: depositAmount });
    
    // Transfer to receiver
    await balanceTracker.write.transfer([receiverClient.account.address, transferAmount, "Transfer"]);
    
    // Check sender's transaction history
    const senderTx0 = await balanceTracker.read.getAccountTransaction([senderClient.account.address, 0]);
    assert.equal(senderTx0.amount, depositAmount, "First transaction should be deposit");
    assert.equal(senderTx0.isDeposit, true, "First transaction should be deposit");
    
    const senderTx1 = await balanceTracker.read.getAccountTransaction([senderClient.account.address, 1]);
    assert.equal(senderTx1.amount, transferAmount, "Second transaction should be transfer");
    assert.equal(senderTx1.isDeposit, false, "Second transaction should not be deposit");
    assert.equal(senderTx1.isWithdrawal, false, "Second transaction should not be withdrawal");
    
    // Check receiver's transaction history
    const receiverTx0 = await balanceTracker.read.getAccountTransaction([receiverClient.account.address, 0]);
    assert.equal(receiverTx0.amount, transferAmount, "Receiver's transaction should be transfer");
    assert.equal(receiverTx0.from, senderClient.account.address, "Transfer should be from sender");
  });

  it("Should emit correct events", async function () {
    const balanceTracker = await viem.deployContract("BalanceTracker");
    
    const depositAmount = 1000000000000000000n; // 1 ETH
    
    // Test deposit event
    await viem.assertions.emitWithArgs(
      balanceTracker.write.deposit(["Test deposit"], { value: depositAmount }),
      balanceTracker,
      "BalanceUpdated",
      [senderClient.account.address, depositAmount, depositAmount]
    );
    
    await viem.assertions.emitWithArgs(
      balanceTracker.write.deposit(["Test deposit"], { value: depositAmount }),
      balanceTracker,
      "TransactionRecorded",
      ["0x0000000000000000000000000000000000000000", senderClient.account.address, depositAmount, "0", "Test deposit", true, false]
    );
  });

  it("Should prevent invalid operations", async function () {
    const balanceTracker = await viem.deployContract("BalanceTracker");
    
    // Try to withdraw without balance
    try {
      await balanceTracker.write.withdraw([1000000000000000000n, "Invalid withdrawal"]);
      assert.fail("Should have thrown error for insufficient balance");
    } catch (error) {
      // Expected error
    }
    
    // Try to transfer to zero address
    try {
      await balanceTracker.write.transfer(["0x0000000000000000000000000000000000000000", 1000000000000000000n, "Invalid transfer"]);
      assert.fail("Should have thrown error for zero address transfer");
    } catch (error) {
      // Expected error
    }
    
    // Try to transfer to self
    try {
      await balanceTracker.write.transfer([senderClient.account.address, 1000000000000000000n, "Invalid self transfer"]);
      assert.fail("Should have thrown error for self transfer");
    } catch (error) {
      // Expected error
    }
  });

  it("Should handle contract balance correctly", async function () {
    const balanceTracker = await viem.deployContract("BalanceTracker");
    
    const depositAmount = 1000000000000000000n; // 1 ETH
    
    // Check initial contract balance
    const initialContractBalance = await balanceTracker.read.getContractBalance();
    assert.equal(initialContractBalance, 0n, "Initial contract balance should be 0");
    
    // Make deposit
    await balanceTracker.write.deposit(["Deposit"], { value: depositAmount });
    
    // Check contract balance after deposit
    const contractBalance = await balanceTracker.read.getContractBalance();
    assert.equal(contractBalance, depositAmount, "Contract balance should match deposit amount");
  });
});
