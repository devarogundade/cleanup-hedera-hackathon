import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect({
    network: "testnet",
  });

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with:", deployer.address);

  const Factory = await ethers.getContractFactory("Factory");
  const factory = await Factory.deploy(deployer.address);
  await factory.waitForDeployment();

  console.log("Deployed factory:", await factory.getAddress());

  await factory.newRound();

  console.log("New round created.");

  const tx = await factory.createLand(
    7_776_000,
    {
      name: "Coastal Cleanup - Santa Monica Beach",
      symbol: "CCSMB",
      maxSupply: 144,
      unitValue: ethers.parseUnits("5", 8),
      squareMeters: 10,
      latitude: 340_195,
      longitude: -1_184_912,
      votingPowerBps: 10_000_000_000,
    },
    { value: ethers.parseEther("10"), gasLimit: 1_000_000 }
  );

  const receipt = await tx.wait(1);

  console.log("Land created.", receipt);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
