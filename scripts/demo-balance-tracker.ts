import { network } from "hardhat";

async function main() {
  console.log("🚀 Starting BalanceTracker Demo...\n");

  const { viem } = await network.connect();
  const [alice, bob, charlie] = await viem.getWalletClients();

  console.log("👥 Demo Participants:");
  console.log("  Alice:", alice.account.address);
  console.log("  Bob:", bob.account.address);
  console.log("  Charlie:", charlie.account.address);
  console.log("");

  // Deploy the contract
  console.log("📦 Deploying BalanceTracker contract...");
  const balanceTracker = await viem.deployContract("BalanceTracker");
  console.log("✅ Contract deployed to:", balanceTracker.address);
  console.log("");

  // Demo 1: Deposits
  console.log("💰 Demo 1: Deposits");
  console.log("=====================");
  
  const aliceDeposit = 2000000000000000000n; // 2 ETH
  const bobDeposit = 1500000000000000000n;   // 1.5 ETH
  
  console.log("Alice deposits", (aliceDeposit / 1000000000000000000n).toString(), "ETH");
  await balanceTracker.write.deposit(["Initial deposit from Alice"], { value: aliceDeposit });
  
  console.log("Bob deposits", (bobDeposit / 1000000000000000000n).toString(), "ETH");
  await balanceTracker.write.deposit(["Initial deposit from Bob"], { value: bobDeposit });
  
  // Check balances
  const aliceBalance = await balanceTracker.read.getBalance([alice.account.address]) as bigint;
  const bobBalance = await balanceTracker.read.getBalance([bob.account.address]) as bigint;
  const contractBalance = await balanceTracker.read.getContractBalance() as bigint;
  
  console.log("Alice's balance:", (aliceBalance / 1000000000000000000n).toString(), "ETH");
  console.log("Bob's balance:", (bobBalance / 1000000000000000000n).toString(), "ETH");
  console.log("Contract balance:", (contractBalance / 1000000000000000000n).toString(), "ETH");
  console.log("");

  // Demo 2: Transfers
  console.log("🔄 Demo 2: Transfers");
  console.log("=====================");
  
  const transferAmount = 500000000000000000n; // 0.5 ETH
  console.log("Alice transfers", (transferAmount / 1000000000000000000n).toString(), "ETH to Bob");
  
  await balanceTracker.write.transfer([bob.account.address, transferAmount, "Payment for services"]);
  
  // Check balances after transfer
  const aliceBalanceAfter = await balanceTracker.read.getBalance([alice.account.address]) as bigint;
  const bobBalanceAfter = await balanceTracker.read.getBalance([bob.account.address]) as bigint;
  
  console.log("Alice's balance after transfer:", (aliceBalanceAfter / 1000000000000000000n).toString(), "ETH");
  console.log("Bob's balance after transfer:", (bobBalanceAfter / 1000000000000000000n).toString(), "ETH");
  console.log("");

  // Demo 3: Withdrawals
  console.log("💸 Demo 3: Withdrawals");
  console.log("=======================");
  
  const withdrawalAmount = 300000000000000000n; // 0.3 ETH
  console.log("Bob withdraws", (withdrawalAmount / 1000000000000000000n).toString(), "ETH");
  
  await balanceTracker.write.withdraw([withdrawalAmount, "Cash withdrawal"]);
  
  const bobBalanceAfterWithdrawal = await balanceTracker.read.getBalance([bob.account.address]) as bigint;
  console.log("Bob's balance after withdrawal:", (bobBalanceAfterWithdrawal / 1000000000000000000n).toString(), "ETH");
  console.log("");

  // Demo 4: Transaction History
  console.log("📊 Demo 4: Transaction History");
  console.log("===============================");
  
  const totalTransactions = await balanceTracker.read.getTotalTransactions() as bigint;
  console.log("Total transactions recorded:", totalTransactions.toString());
  
  // Show Alice's transaction history
  const aliceInfo = await balanceTracker.read.getAccountInfo([alice.account.address]) as any;
  console.log("Alice's transaction count:", aliceInfo.transactionCount.toString());
  
  for (let i = 0; i < Number(aliceInfo.transactionCount); i++) {
    const tx = await balanceTracker.read.getAccountTransaction([alice.account.address, BigInt(i)]) as any;
    const txType = tx.isDeposit ? "Deposit" : tx.isWithdrawal ? "Withdrawal" : "Transfer";
    console.log(`  Transaction ${i + 1}: ${txType} - ${(tx.amount / 1000000000000000000n).toString()} ETH`);
    console.log(`    Description: ${tx.description}`);
    console.log(`    Timestamp: ${new Date(Number(tx.timestamp) * 1000).toLocaleString()}`);
  }
  console.log("");

  // Demo 5: Account Information
  console.log("📋 Demo 5: Account Information");
  console.log("===============================");
  
  const aliceAccountInfo = await balanceTracker.read.getAccountInfo([alice.account.address]) as any;
  const bobAccountInfo = await balanceTracker.read.getAccountInfo([bob.account.address]) as any;
  
  console.log("Alice's Account Summary:");
  console.log("  Current Balance:", (aliceAccountInfo.balance / 1000000000000000000n).toString(), "ETH");
  console.log("  Total Deposits:", (aliceAccountInfo.totalDeposits / 1000000000000000000n).toString(), "ETH");
  console.log("  Total Withdrawals:", (aliceAccountInfo.totalWithdrawals / 1000000000000000000n).toString(), "ETH");
  console.log("  Transaction Count:", aliceAccountInfo.transactionCount.toString());
  console.log("");
  
  console.log("Bob's Account Summary:");
  console.log("  Current Balance:", (bobAccountInfo.balance / 1000000000000000000n).toString(), "ETH");
  console.log("  Total Deposits:", (bobAccountInfo.totalDeposits / 1000000000000000000n).toString(), "ETH");
  console.log("  Total Withdrawals:", (bobAccountInfo.totalWithdrawals / 1000000000000000000n).toString(), "ETH");
  console.log("  Transaction Count:", bobAccountInfo.transactionCount.toString());
  console.log("");

  // Demo 6: Complex Scenario
  console.log("🎭 Demo 6: Complex Scenario");
  console.log("============================");
  
  console.log("Charlie joins and deposits 1 ETH");
  await balanceTracker.write.deposit(["Charlie's initial deposit"], { value: 1000000000000000000n });
  
  console.log("Alice transfers 0.2 ETH to Charlie");
  await balanceTracker.write.transfer([charlie.account.address, 200000000000000000n, "Gift to Charlie"]);
  
  console.log("Bob transfers 0.1 ETH to Charlie");
  await balanceTracker.write.transfer([charlie.account.address, 100000000000000000n, "Welcome gift"]);
  
  // Final balance check
  const finalAliceBalance = await balanceTracker.read.getBalance([alice.account.address]) as bigint;
  const finalBobBalance = await balanceTracker.read.getBalance([bob.account.address]) as bigint;
  const finalCharlieBalance = await balanceTracker.read.getBalance([charlie.account.address]) as bigint;
  const finalContractBalance = await balanceTracker.read.getContractBalance() as bigint;
  
  console.log("Final Balances:");
  console.log("  Alice:", (finalAliceBalance / 1000000000000000000n).toString(), "ETH");
  console.log("  Bob:", (finalBobBalance / 1000000000000000000n).toString(), "ETH");
  console.log("  Charlie:", (finalCharlieBalance / 1000000000000000000n).toString(), "ETH");
  console.log("  Contract Total:", (finalContractBalance / 1000000000000000000n).toString(), "ETH");
  console.log("");

  console.log("🎉 Demo completed successfully!");
  console.log("Contract address:", balanceTracker.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Demo failed:", error);
    process.exit(1);
  });
