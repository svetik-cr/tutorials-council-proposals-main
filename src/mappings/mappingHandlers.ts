import { SubstrateEvent } from "@subql/types";
import { bool, Int } from "@polkadot/types";
import { Proposal, VoteHistory, Councillor } from "../types/models";

export async function handleCouncilProposedEvent(
  event: SubstrateEvent
): Promise<void> {
  const {
    event: {
      data: [accountId, proposal_index, proposal_hash, threshold],
    },
  } = event;
  const myProposal = new Proposal(proposal_hash.toString());
  myProposal.index = proposal_index.toString();
  myProposal.account = accountId.toString();
  myProposal.hash = proposal_hash.toString();
  myProposal.voteThreshold = threshold.toString();
  myProposal.block = event.block.block.header.number.toBigInt();
  await myProposal.save();
}

export async function handleCouncilVotedEvent(
  event: SubstrateEvent
): Promise<void> {
  const {
    event: {
      data: [councilorId, proposal_hash, approved_vote, numberYes, numberNo],
    },
  } = event;

  await ensureCouncillor(councilorId.toString());
  const myHistory = new VoteHistory(
    `${event.block.block.header.number.toNumber()}-${event.idx}`
  );
  myHistory.proposalHashId = proposal_hash.toString();
  myHistory.approvedVote = (approved_vote as bool).valueOf();
  myHistory.councillorId = councilorId.toString();
  myHistory.votedYes = (numberYes as Int).toNumber();
  myHistory.votedNo = (numberNo as Int).toNumber();
  myHistory.block = event.block.block.header.number.toNumber();
  await myHistory.save();
}

async function ensureCouncillor(accountId: string): Promise<void> {
  let councillor = await Councillor.get(accountId);
  if (!councillor) {
    councillor = new Councillor(accountId);
    councillor.numberOfVotes = 0;
  }
  councillor.numberOfVotes += 1;
  await councillor.save();
}
