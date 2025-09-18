// scripts/deploy.js
async function main() {
  const [deployer] = await ethers.getSigners();
  
  const PolyPrizeUnicorn = await ethers.getContractFactory("PolyPrizeUnicorn");
  
  const contract = await PolyPrizeUnicorn.deploy(
    "ipfs://bafybeigtj7zzqo4vfaiz5te2sjbh4aervqcy7mewlixk7kdd5nfql5ptja",  // baseImageURI
    "ipfs://bafybeibk5zl2peqe6medeh2vh45a3vaxcc2gvcenwy5ywxsfzhsj6kwdgq",        // baseAnimationURI  
    1759082399                          // drawingDate (Sept 28th MDT Midnight)
  );
  
  await contract.deployed();
  console.log("PolyPrizeUnicorn deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});