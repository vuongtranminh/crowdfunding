import { CampaignDetail } from '@/features/campaigns/campaign-detail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/campaigns/$campaignId')({
  component: CampaignDetail,
})
