// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

contract Voting {
	// This is the list of candidates
	uint private candidateCount;

	// This is an enum to track status of a voter
	enum VoterStatus {
		UNREGISTERED,
		REGISTERED,
		VOTED
	}

	// This keeps track voters who already voted
	mapping(address => VoterStatus) private voted;	
	
	// Owner of the elections
	address private chairperson;

	// Flag to indicate the voting is closed
	bool private votingClosed;

	// Event when contract is created
	event VotingOpenedEvent(uint timestamp);

	// Event when contract is closed
	event VotingClosedEvent(uint timestamp);

	// Event when a candidate is added
	event CandidatesEvent(bytes32[] indexed candidates, uint timestamp);

	// Event when a voter is added
	event VotersEvent(address[] indexed voters, uint timestamp);

	// Event when a vote is polled
	event VoteEvent(uint indexed candidateIndex, uint timestamp);

	// Create the contract with a list of candidate names and voter names
	// Voting is enabled immediately
	constructor(bytes32[] memory candidateList, address[] memory voterList) {
		chairperson = msg.sender;

		candidateCount = candidateList.length;
		emit CandidatesEvent(candidateList, block.timestamp);

		for (uint i = 0; i < voterList.length; i++) {
			voted[voterList[i]] = VoterStatus.REGISTERED;
		}
		emit VotersEvent(voterList, block.timestamp);

		votingClosed = false;
		emit VotingOpenedEvent(block.timestamp);
	}

	// Close the voting, only contract creater can call this function
	function closeVoting() external {
		require(msg.sender == chairperson, "Not authorized.");
		require(!votingClosed, "Voting already closed.");
		votingClosed = true;
		emit VotingClosedEvent(block.timestamp);
	}

	// Poll a vote, can be called only voting is enabled and
	// the voter hasn't voted previously
	function vote(uint candidateIndex) external {
		require(!votingClosed, "Voting closed.");
		require(voted[msg.sender] != VoterStatus.UNREGISTERED, "Note authorised to vote.");
		require(voted[msg.sender] != VoterStatus.VOTED, "Duplicate votes not allowed.");
		require(candidateIndex < candidateCount, "Invalid input.");
		voted[msg.sender] = VoterStatus.VOTED;
		emit VoteEvent(candidateIndex, block.timestamp);
	}
	
}
