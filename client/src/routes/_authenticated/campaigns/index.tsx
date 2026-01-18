import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Campaigns } from '@/features/campaigns'

const campaignsSearchSchema = z.object({
  type: z
    .enum(['all', 'connected', 'notConnected'])
    .optional()
    .catch(undefined),
  filter: z.string().optional().catch(''),
  sort: z.enum(['asc', 'desc']).optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/campaigns/')({
  validateSearch: campaignsSearchSchema,
  component: Campaigns,
})