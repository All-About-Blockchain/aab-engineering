/**
 * AAB Registry Deployment Script
 * 
 * Usage: npx hardhat run scripts/deploy.js --network <network>
 * 
 * Networks:
 *   - localhost (for testing)
 *   - sepolia (testnet)
 *   - arbitrumSepolia (testnet)
 *   - baseSepolia (testnet)
 *   - ethereum (mainnet)
 *   - arbitrum (mainnet)
 *   - base (mainnet)
 *   - optimism (mainnet)
 */

const hre = require("hardhat");

async function main() {
  console.log("Deploying AAB Registry...");
  
  const network = hre.network.name;
  console.log(`Network: ${network}`);
  
  // Deploy
  const AABRegistry = await hre.ethers.getContractFactory("AABRegistry");
  const registry = await AABRegistry.deploy();
  
  await registry.waitForDeployment();
  const address = await registry.getAddress();
  
  console.log(`AAB Registry deployed to: ${address}`);
  
  // Verify on block explorer (if applicable)
  if (network !== "localhost" && network !== "hardhat") {
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: []
      });
      console.log("Verified on block explorer");
    } catch (e) {
      console.log("Verification skipped:", e.message);
    }
  }
  
  // Save deployment info
  const fs = require("fs");
  const path = require("path");
  
  const deploymentInfo = {
    network,
    address,
    timestamp: new Date().toISOString()
  };
  
  const deployPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deployPath)) {
    fs.mkdirSync(deployPath, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deployPath, `${network}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`Deployment info saved to deployments/${network}.json`);
  
  return address;
}

main()
  .then((address) => {
    console.log(`Done!`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
