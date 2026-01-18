import { z } from 'zod'

const campaignSchema = z.object({
  title: z.string(),
  description: z.string(),
  target: z.number(),
  deadline: z.number(),
  // image: z.string(),
})
export type Campaign = z.infer<typeof campaignSchema>