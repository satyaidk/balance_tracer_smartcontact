import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BalanceTrackerModule", (m) => {
  const balanceTracker = m.contract("BalanceTracker");

  // Optional: Add some initial setup calls if needed
  // For example, you could add initial deposits or configurations here

  return { balanceTracker };
});
