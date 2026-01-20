import { type ChangeEvent, useEffect, useState } from 'react'
import { getRouteApi, Link } from '@tanstack/react-router'
import { SlidersHorizontal, ArrowUpAZ, ArrowDownAZ, Layers, BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CampaignsProvider } from './components/campaigns-provider'
import { CampaignsPrimaryButtons } from './components/campaigns-primary-buttons'
import { CampaignsDialogs } from './components/campaigns-dialogs'
import { usePublicClient, useReadContract, useWatchContractEvent } from "wagmi"
import { abi } from './data/abi'
import { Campaign, CampaignState, CampaignStateBadgeClass, CampaignStateLabel } from './data/types'
import { formatAddress } from '@/lib/utils'
import { formatEther } from 'viem'
import { readContract } from '@wagmi/core'
import { getConfig } from 'wagmi.config'
import { Badge } from '@/components/ui/badge'

const route = getRouteApi('/_authenticated/campaigns/')

type AppType = 'all' | 'connected' | 'notConnected'

const appText = new Map<AppType, string>([
  ['all', 'All Apps'],
  ['connected', 'Connected'],
  ['notConnected', 'Not Connected'],
])

export function Campaigns() {

  const client = usePublicClient()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  const { data: total } = useReadContract({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: abi,
    functionName: "numberOfCampaigns",
  })

  async function fetchCampaign(id: bigint): Promise<Campaign> {
    const raw = await client!.readContract({
      address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
      abi: abi,
      functionName: "campaigns",
      args: [id],
    })

    return {
      campaignId: id,
      owner: raw[0],
      title: raw[1],
      description: raw[2],
      target: raw[3],
      deadline: raw[4],
      amountCollected: raw[5],
      // image: raw[6],
      state: raw[6] as CampaignState,
    } as Campaign
  }

  useEffect(() => {
    if (total === undefined) return

    let cancelled = false

    async function fetchAll() {
      const count = Number(total)

      const items = await Promise.all(
        Array.from({ length: count }, (_, i) =>
          fetchCampaign(BigInt(count - 1 - i))
        )
      )

      if (!cancelled) setCampaigns(items)
    }

    fetchAll()

    return () => {
      cancelled = true
    }
  }, [total])

  useWatchContractEvent({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: abi,
    eventName: "CampaignCreated",
    onLogs: async (logs) => {
      for (const log of logs) {
        console.log('New campaign log:', log);
        const id = log.args.id
        if (id === undefined) continue

        const campaign = await fetchCampaign(id);

        setCampaigns((prev) => [campaign, ...prev]);
      }
    },
  })

  const daysLeft = (campaign: Campaign | undefined) => {
    if (!campaign) return 0
    // if (campaign.state !== CampaignState.Active) return 0

    const nowMs = Date.now()                    // milliseconds
    const deadlineMs = Number(campaign.deadline) * 1000 // seconds → ms

    // if (deadlineMs <= nowMs) return 0

    const diffMs = deadlineMs - nowMs
    const msPerDay = 1000 * 60 * 60 * 24

    return Math.ceil(diffMs / msPerDay)
  }

  return (
    <CampaignsProvider>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Content ===== */}
      <Main fixed>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Campaigns</h1>
            <p className='text-muted-foreground'>
              Here&apos;s a list of Campaigns!
            </p>
          </div>
          <CampaignsPrimaryButtons />
        </div>
        {/* <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
          
        </div> */}
        <Separator className='shadow-sm' />
        <ul className='faded-bottom no-scrollbar grid gap-4 overflow-auto pt-4 pb-16 md:grid-cols-2 lg:grid-cols-3'>
          {campaigns.map((campaign) => (
            <Link to='/campaigns/$campaignId' params={{ campaignId: String(campaign.campaignId) }} key={campaign.campaignId}>
              <li
                className='relative h-[450px] rounded-lg overflow-hidden shadow-xl group cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md'
              >
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" // Ảnh ví dụ màu tím tương tự
                  alt="Dreamy Trees"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* 2. Gradient Overlay - Để làm nổi bật chữ màu trắng */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* 3. Top Label: Collection */}
                <div className="absolute top-5 left-5">
                  {/* <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg">
                    <Layers className="w-4 h-4 text-white" />
                    <span className="text-white text-xs font-semibold tracking-wide">
                      Collection
                    </span>
                  </div> */}
                  <Badge className={CampaignStateBadgeClass[campaign.state]}>
                    {CampaignStateLabel[campaign.state]}
                  </Badge>
                </div>

                {/* 4. Bottom Content */}
                <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col gap-3">
                  {/* Title & Verified Badge */}
                  <div className="flex items-center gap-2">
                    <h2 className="text-white text-3xl font-bold tracking-tight">
                      {campaign.title}
                    </h2>
                    <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500 bg-white rounded-full" />
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm leading-relaxed font-medium line-clamp-2">
                    {campaign.description}
                  </p>

                  <div className="flex items-center justify-between py-2 border-t border-white/10 border-b mb-1">
                    {/* Raised */}
                    <div className="flex flex-col">
                      <span className="text-white text-lg font-bold">{formatEther(campaign.amountCollected)} ETH</span>
                      <span className="text-gray-400 text-xs font-medium">Raised of {formatEther(campaign.target)} ETH</span>
                    </div>

                    {/* Days Left */}
                    <div className="flex flex-col items-end">
                      <span className="text-white text-lg font-bold">{daysLeft(campaign)}</span>
                      <span className="text-gray-400 text-xs font-medium">Days Left</span>
                    </div>
                  </div>

                  {/* Footer: Avatar, Username, Count */}
                  <div className="flex items-center mt-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 border-2 border-white">
                        <AvatarImage src="https://github.com/shadcn.png" alt="@thedreamytrees" />
                        <AvatarFallback>DT</AvatarFallback>
                      </Avatar>
                      <span className="text-white font-bold text-sm">by {formatAddress(campaign.owner)}</span>
                    </div>

                    {/* <span className="text-white font-bold text-sm">9,999 NFTs</span> */}
                  </div>
                </div>

              </li>
            </Link>
          ))}
        </ul>
      </Main>

      <CampaignsDialogs />
    </CampaignsProvider>
  )
}
