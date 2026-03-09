import { ethers } from "hardhat";

async function main() {
  const Ajo = await ethers.getContractFactory("Ajo");
  const ajo = await Ajo.deploy();
  await ajo.waitForDeployment();

  console.log("Ajo deployed to:", await ajo.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
