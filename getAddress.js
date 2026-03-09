const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  console.log("Your wallet address:", await signer.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
