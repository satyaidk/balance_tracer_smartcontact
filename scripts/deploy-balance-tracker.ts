import { network } from "hardhat";

async function main() {
  console.log("Deploying BalanceTracker contract...");

  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();

  console.log("Deploying with account:", deployer.account.address);

  const balanceTracker = await viem.deployContract("BalanceTracker");
  
  console.log("BalanceTracker deployed to:", balanceTracker.address);
  console.log("Deployment transaction hash:", balanceTracker.deploymentTransaction?.hash);
  
  // Verify deployment by checking initial state
  const contractBalance = await balanceTracker.read.getContractBalance();
  console.log("Initial contract balance:", contractBalance.toString(), "wei");
  
  console.log("BalanceTracker deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
