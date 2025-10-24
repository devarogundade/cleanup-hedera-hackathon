import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect({
    network: "testnet",
  });

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with:", deployer.address);

  const Land = await ethers.getContractFactory("Land");
  const land = await Land.deploy(deployer.address, {
    maxSupply: 144,
    unitValue: ethers.parseUnits("5", 8),
    squareMeters: 10,
    latitude: 340_195,
    longitude: -1_184_912,
    votingPowerBps: 10_000_000_000,
  });
  await land.waitForDeployment();

  console.log("Deployed land:", await land.getAddress());

  await land.createUnderlying(
    "Coastal Cleanup - Santa Monica Beach",
    "CCSMB",
    7_776_000,
    {
      value: ethers.parseEther("10"),
      gasLimit: 3_000_000,
    }
  );

  console.log("Created Underlying NFT");

  await land.grantRole(await land.MANAGER_ROLE(), deployer.address);

  await land.registerValidator("0xae1023bf9B9Dd69BDf1f5FEE8389A5680eB2Fb68");
  await land.registerValidator("0xdA4938b691D96bdCFE68080bFBf9c00573dE0637");
  await land.registerValidator("0x081E56Ea7935e04Cc8B250D49486162c232091be");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// Deploying contracts with: 0x2531dCd3dC58559c19EEE09736443D026D40d5f5
// Deployed land: 0x6D3DA74c8601191F6a61989AF86B220c314C6FC9
// Created Underlying NFT
