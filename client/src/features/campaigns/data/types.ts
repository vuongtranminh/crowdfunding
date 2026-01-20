export type Campaign = {
  campaignId: bigint,
  owner: `0x${string}`
  title: string
  description: string
  target: bigint
  deadline: bigint
  amountCollected: bigint
  // image: string
  state: CampaignState
}

export enum CampaignState {
  Active = 0,
  Successful = 1,
  Failed = 2,
  Withdrawn = 3,
}

export const CampaignStateLabel: Record<CampaignState, string> = {
  [CampaignState.Active]: "Active",
  [CampaignState.Successful]: "Successful",
  [CampaignState.Failed]: "Failed",
  [CampaignState.Withdrawn]: "Withdrawn",
}

export const CampaignStateBadgeClass: Record<CampaignState, string> = {
  [CampaignState.Active]: "bg-blue-500 text-white",
  [CampaignState.Successful]: "bg-green-500 text-white",
  [CampaignState.Failed]: "bg-red-500 text-white",
  [CampaignState.Withdrawn]: "bg-gray-400 text-white",
}

export type Donation = {
  donator: `0x${string}`
  amount: bigint
  txHash: `0x${string}`
  blockNumber: bigint
}