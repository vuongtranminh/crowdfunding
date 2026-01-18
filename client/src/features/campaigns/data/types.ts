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