import { ethers } from "hardhat";

async function main() {
  const bytes32 = require('bytes32');

  // Candidate names list
  const candidates = [
    bytes32({ input: "Pepsi" }), 
    bytes32({ input: "ThumsUp", }),
    bytes32({ input: "Coca Cola" })
  ];

  // Voter addresses list
  const voter_addresses = [
	  "0x267F4c4893A83669983E0605aAaAbe232620f6f8",
	  "0x92E20968Dc67d72b99904cEcf1E0A084055feC41",
	  "0xA63C45208ffc4Aaf7af8271558Aa4f3F50749158",
	  "0x729bb037e167967686d568281358c5801A23BB33",
	  "0x63A2a643ef537C09CFc82Beaa39ca01319D181f0"
  ]


  const Voting = await ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(candidates, voter_addresses);

  await voting.deployed();

  console.log(`Voting contract deployed with the candidates ${candidates} and voters ${voter_addresses}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
