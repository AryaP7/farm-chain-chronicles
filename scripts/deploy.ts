import hre from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy FarmChainRegistry First
  const Registry = await hre.ethers.getContractFactory("FarmChainRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("FarmChainRegistry deployed to:", registryAddr);

  // Deploy ProduceBatch with Registry address
  const ProduceBatch = await hre.ethers.getContractFactory("ProduceBatch");
  const batch = await ProduceBatch.deploy(registryAddr);
  await batch.waitForDeployment();
  const batchAddr = await batch.getAddress();
  console.log("ProduceBatch deployed to:", batchAddr);

  // Auto-verify deployer as FARMER for prototyping
  const FARMER_ROLE = 0n; // enum Role { FARMER }
  const INITIAL_LOCATION = hre.ethers.encodeBytes32String("HQ");
  await registry.registerParticipant(deployer.address, FARMER_ROLE, INITIAL_LOCATION);
  await registry.verifyParticipant(deployer.address);
  console.log(`Verified deployer ${deployer.address} as FARMER`);

  // Write contract data to frontend src
  const configDir = process.cwd() + "/src/config";
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

  // Get ABIs
  const registryArtifact = await hre.artifacts.readArtifact("FarmChainRegistry");
  const batchArtifact = await hre.artifacts.readArtifact("ProduceBatch");

  fs.writeFileSync(
    configDir + "/contracts.json",
    JSON.stringify(
      {
        RegistryAddress: registryAddr,
        RegistryABI: registryArtifact.abi,
        BatchAddress: batchAddr,
        BatchABI: batchArtifact.abi,
      },
      null,
      2
    )
  );

  console.log("Contract config written to src/config/contracts.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
