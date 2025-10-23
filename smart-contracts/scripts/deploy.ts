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

  await factory.newRound();

  await factory.createLand(
    7_776_000,
    {
      name: "",
      symbol: "",
      maxSupply: 0,
      unitValue: 1000,
      squareMeters: 10,
      latitude: 0,
      longitude: 0,
      votingPowerBps: 100000,
    },
    { value: ethers.parseEther("10"), gasLimit: 1_000_000 }
  );
}
