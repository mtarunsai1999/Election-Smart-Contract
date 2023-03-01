import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Voting", function () {

  async function deployVotingFixture() {
    const bytes32 = require('bytes32');

    // Candidate names list
    const candidates = [
      bytes32({ input: "Donald Trump" }), 
      bytes32({ input: "Jack Dempsey", }),
      bytes32({ input: "Charlie Chaplin" })
    ];

    // Contracts are deployed using the first signer/account by default
    const [owner, voter1, voter2, unauthorised_voter] = await ethers.getSigners();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(candidates, [voter1.address, voter2.address]);

    return { voting, candidates, owner, voter1, voter2, unauthorised_voter };
  }

  describe("Voting tests", function() {
    it("Registered users can vote", async function() {
      const { voting, voter1, voter2 } = await loadFixture(deployVotingFixture);

      await expect(voting.connect(voter1).vote(1)).to.emit(voting, "VoteEvent").withArgs(1, anyValue);
      await expect(voting.connect(voter2).vote(0)).to.emit(voting, "VoteEvent").withArgs(0, anyValue);
    });

    it("Unauthorised users can't vote", async function() {
      const { voting, unauthorised_voter } = await loadFixture(deployVotingFixture);

      await expect(voting.connect(unauthorised_voter).vote(1)).to.be.revertedWith("Note authorised to vote.");
    });

    it("Duplicate votes not allowed", async function() {
      const { voting, voter1, voter2 } = await loadFixture(deployVotingFixture);

      await expect(voting.connect(voter1).vote(2)).to.emit(voting, "VoteEvent").withArgs(2, anyValue);
      await expect(voting.connect(voter1).vote(1)).to.be.revertedWith("Duplicate votes not allowed.");

      await expect(voting.connect(voter2).vote(0)).to.emit(voting, "VoteEvent").withArgs(0, anyValue);
      await expect(voting.connect(voter1).vote(0)).to.be.revertedWith("Duplicate votes not allowed.");
    });

    it("Array out of bounds check works", async function() {
      const { voting, candidates, voter1 } = await loadFixture(deployVotingFixture);

      await expect(voting.connect(voter1).vote(candidates.length)).to.be.revertedWith("Invalid input.");
    });

    it("Voting not allowed after polls closed", async function() {
      const { voting, voter1, voter2, unauthorised_voter } = await loadFixture(deployVotingFixture);
      
      await voting.closeVoting();
      await expect(voting.connect(voter1).vote(0)).to.be.revertedWith("Voting closed.");
      await expect(voting.connect(voter2).vote(1)).to.be.revertedWith("Voting closed.");
      await expect(voting.connect(unauthorised_voter).vote(2)).to.be.revertedWith("Voting closed.");
    });
  });

  describe("Close polling", function() {
    it("Owner can close the elections", async function() {
      const { voting, owner } = await loadFixture(deployVotingFixture);
      await expect(voting.closeVoting()).to.emit(voting, "VotingClosedEvent").withArgs(anyValue);
    });

    it("Can't close twice", async function() {
      const { voting, owner } = await loadFixture(deployVotingFixture);
      await expect(voting.closeVoting()).to.emit(voting, "VotingClosedEvent").withArgs(anyValue);
      await expect(voting.closeVoting()).to.be.revertedWith("Voting already closed.");
    });

    it("Others can't close the elections", async function() {
      const { voting, voter1 } = await loadFixture(deployVotingFixture);
      await expect(voting.connect(voter1).closeVoting()).to.be.revertedWith("Not authorized.");
    });
  });

  

});