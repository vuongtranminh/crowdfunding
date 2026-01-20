import { Route } from "@/routes/_authenticated/campaigns/$campaignId"
import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BaseError, useAccount, usePublicClient, useReadContract, useWaitForTransactionReceipt, useWatchContractEvent, useWriteContract } from "wagmi"
import { abi } from './data/abi'
import { Campaign, CampaignState, CampaignStateBadgeClass, CampaignStateLabel, Donation } from './data/types'
import { formatAddress } from '@/lib/utils'
import { formatEther, parseEther } from 'viem'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { z } from 'zod'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Item, ItemContent, ItemDescription } from "@/components/ui/item"
import { simulateContract } from '@wagmi/core'
import { config } from "@/main"
import { toast } from "sonner"
import DonationsTable from "./components/donations-table"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  donationAmount: z.coerce
    .number()
    .positive('Donation amount must be greater than 0')
})

export function CampaignDetail() {
  const { campaignId } = Route.useParams()

  const { address, isConnected } = useAccount()

  const client = usePublicClient()

  const {
    mutateAsync: writeContractAsync,
    data: hash,
    error,
    isPending
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed
  } = useWaitForTransactionReceipt({
    hash
  })

  // const [contributions, setContributions] = useState([])
  const [donations, setDonations] = useState<Donation[]>([])

  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      donationAmount: 0,
    },
  })

  const { data: campaignRaw, refetch: refetchCampaign } = useReadContract({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: abi,
    functionName: "campaigns",
    args: [BigInt(campaignId)],
  })

  const campaign = useMemo<Campaign | undefined>(() => {
    if (!campaignRaw) return undefined

    return {
      campaignId: BigInt(campaignId),
      owner: campaignRaw[0] as `0x${string}`,
      title: campaignRaw[1],
      description: campaignRaw[2],
      target: campaignRaw[3],
      deadline: campaignRaw[4],
      amountCollected: campaignRaw[5],
      // image: campaignRaw[6],
      state: campaignRaw[6] as CampaignState,
    }
  }, [campaignRaw, campaignId])

  function parseDonateError(error: any): string {
    const msg =
      error?.shortMessage ||
      error?.cause?.shortMessage ||
      error?.message ||
      ''

    if (msg.includes('Ended')) return 'This campaign has ended'
    if (msg.includes('Not active')) return 'This campaign is not active'
    if (msg.includes('Owner cannot donate')) return 'Campaign owner cannot donate'
    if (msg.includes('Zero ETH')) return 'Donation amount must be greater than 0'
    if (msg.includes('Target reached')) return 'This campaign has already reached its target'

    return 'Transaction failed'
  }

  async function donateToCampaignTx(campaignId: string, ethAmount: string) {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet!')
      return
    }

    try {
      // 1. SIMULATE (bắt hết require) (Không tốn gas)
      // Action for simulating/validating a contract interaction.
      // simulateContract = chạy thử (dry-run) 1 smart contract function trên node
      // KHÔNG gửi transaction
      // KHÔNG tốn gas
      // NHƯNG vẫn chạy toàn bộ require / revert
      await simulateContract(config, {
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        abi,
        functionName: 'donate',
        args: [BigInt(campaignId)],
        value: parseEther(ethAmount),
        account: address,
      })

      // 2. SEND TX
      const hash = await writeContractAsync({
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        abi,
        functionName: 'donate',
        args: [BigInt(campaignId)],
        value: parseEther(ethAmount), // 👈 msg.value (ETH → WEI)
      })

      toast.success('Thank you! Your donation was successful')
      return hash
    } catch (err) {
      toast.error(parseDonateError(err))
      throw err
    }
  }

  const onSubmit = (values: any) => {
    // form.reset()
    // showSubmittedData(values)
    // onOpenChange(false)

    donateToCampaignTx(campaignId, values.donationAmount.toString())
  }

  useEffect(() => {
    if (isConfirmed) {
      form.reset()
      refetchDonatedWei()
      refetchCampaign()
    }
  }, [isConfirmed])

  const progress: number = useMemo(() => {
    if (!campaign) return 0

    // 1. Tránh chia cho 0
    if (campaign.target === 0n) return 0;

    // 2. Chuyển sang dạng số (Ether)
    const collectedNum = Number(formatEther(campaign.amountCollected));
    const targetNum = Number(formatEther(campaign.target));

    // 3. Tính phần trăm
    const _percent = (collectedNum / targetNum) * 100;

    // 4. Xử lý hiển thị: Không quá 100%, làm tròn
    return _percent > 100 ? 100 : Math.round(_percent);
  }, [campaign])

  const isOwner: boolean = useMemo(() => {
    return address === campaign?.owner
  }, [address, campaign?.owner])

  const { data: donatedWei, refetch: refetchDonatedWei, } = useReadContract({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi,
    functionName: 'contributions',
    args: [BigInt(campaignId), address!],
    query: {
      enabled: !!address && !isOwner,
    }
  })

  async function getDonations(campaignId: string): Promise<Donation[]> {
    const logs = await client!.getLogs({
      address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
      event: {
        type: 'event',
        name: 'DonationMade',
        inputs: [
          { indexed: true, name: 'id', type: 'uint256' },
          { indexed: true, name: 'donator', type: 'address' },
          { indexed: false, name: 'amount', type: 'uint256' },
        ],
      },
      args: {
        id: BigInt(campaignId),
      },
      fromBlock: 0n,
      toBlock: 'latest',
    })

    return logs.map(log => ({
      donator: log.args.donator!,
      amount: log.args.amount!,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
    }))
  }

  useWatchContractEvent({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: abi,
    eventName: "DonationMade",
    args: {
      id: BigInt(campaignId), // chỉ nghe campaign hiện tại
      // donator: undefined,
    },
    // enabled: !!campaignId,
    onLogs: async (logs) => {
      for (const log of logs) {
        console.log('New donation log:', log);
        const donation = {
          donator: log.args.donator!,
          amount: log.args.amount!,
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
        }

        setDonations((prev) => [donation, ...prev]);
      }
    },
    onError(error) {
      console.log('Error', error)
    }
  })

  useEffect(() => {
    if (!campaignId) return

    async function fetchDonations() {
      const _donations: Donation[] = await getDonations(campaignId)
      setDonations([..._donations].reverse())
    }

    fetchDonations()
  }, [campaignId])

  function parseWithdrawError(error: any): string {
    const msg =
      error?.shortMessage ||
      error?.cause?.shortMessage ||
      error?.message ||
      ''

    const m = msg.toLowerCase()

    if (m.includes('not owner')) return 'Only the campaign owner can withdraw'
    if (m.includes('not successful')) return 'Campaign is not successful yet'
    if (m.includes('transfer failed')) return 'Failed to transfer funds'
    if (m.includes('user rejected') || m.includes('denied transaction'))
      return 'Transaction was cancelled by user'

    return 'Withdraw transaction failed'
  }

  async function withdrawCampaign(campaignId: string) {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet!')
      return
    }

    try {
      // 1. SIMULATE (bắt hết require) (Không tốn gas)
      // Action for simulating/validating a contract interaction.
      // simulateContract = chạy thử (dry-run) 1 smart contract function trên node
      // KHÔNG gửi transaction
      // KHÔNG tốn gas
      // NHƯNG vẫn chạy toàn bộ require / revert
      await simulateContract(config, {
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        abi,
        functionName: 'withdraw',
        args: [BigInt(campaignId)],
        account: address,
      })

      // 2. SEND TX
      const hash = await writeContractAsync({
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        abi,
        functionName: 'withdraw',
        args: [BigInt(campaignId)],
      })

      toast.success('Withdrawal successful')
      return hash
    } catch (err) {
      toast.error(parseWithdrawError(err))
      throw err
    }
  }

  function parseFinalizeError(error: any): string {
    const msg =
      error?.shortMessage ||
      error?.cause?.shortMessage ||
      error?.message ||
      ''

    if (msg.includes('Not active'))
      return 'Campaign is not active'

    if (msg.includes('Not ended'))
      return 'Campaign has not ended yet'

    return 'Finalize transaction failed'
  }

  async function finalizeCampaign(campaignId: string) {
    try {
      await simulateContract(config, {
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        abi,
        functionName: 'finalize',
        args: [BigInt(campaignId)],
      })

      await writeContractAsync({
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        abi,
        functionName: 'finalize',
        args: [BigInt(campaignId)],
      })

      toast.success('Campaign finalized successfully')
    } catch (error) {
      toast.error(parseFinalizeError(error))
    }
  }

  function parseRefundError(error: any): string {
    const msg =
      error?.shortMessage ||
      error?.cause?.shortMessage ||
      error?.message ||
      ''

    if (msg.includes('Not failed'))
      return 'Campaign has not failed'

    if (msg.includes('Nothing to refund'))
      return 'You have no donation to refund'

    if (msg.includes('Refund failed'))
      return 'Refund transaction failed'

    return 'Refund failed'
  }

  async function refundCampaign(campaignId: string) {
    try {
      // 1. Simulate trước để bắt require
      await simulateContract(config, {
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        abi,
        functionName: 'refund',
        args: [BigInt(campaignId)],
      })

      // 2. Gửi transaction
      await writeContractAsync({
        address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
        abi,
        functionName: 'refund',
        args: [BigInt(campaignId)],
      })

      // 3. Thành công
      toast.success('Refund successful')
    } catch (error) {
      // 4. Bắt lỗi chính xác
      toast.error(parseRefundError(error))
    }
  }

  const contributors = useMemo(() => {
    return Array.from(
      new Set(donations.map(donation => donation.donator))
    )
  }, [donations])

  const daysLeft = useMemo(() => {
    if (!campaign) return 0
    // if (campaign.state !== CampaignState.Active) return 0

    const nowMs = Date.now()                    // milliseconds
    const deadlineMs = Number(campaign.deadline) * 1000 // seconds → ms

    // if (deadlineMs <= nowMs) return 0

    const diffMs = deadlineMs - nowMs
    const msPerDay = 1000 * 60 * 60 * 24

    return Math.ceil(diffMs / msPerDay)
  }, [campaign])

  return (
    <>
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
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            App Integrations
          </h1>
          <p className='text-muted-foreground'>
            Here&apos;s a list of your apps for the integration!
          </p>
        </div>
        {/* <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
              <div className='flex flex-col gap-4 sm:my-4 sm:flex-row'>
                <Input
                  placeholder='Filter apps...'
                  className='h-9 w-40 lg:w-[250px]'
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Select value={appType} onValueChange={handleTypeChange}>
                  <SelectTrigger className='w-36'>
                    <SelectValue>{appText.get(appType)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Apps</SelectItem>
                    <SelectItem value='connected'>Connected</SelectItem>
                    <SelectItem value='notConnected'>Not Connected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
    
              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className='w-16'>
                  <SelectValue>
                    <SlidersHorizontal size={18} />
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align='end'>
                  <SelectItem value='asc'>
                    <div className='flex items-center gap-4'>
                      <ArrowUpAZ size={16} />
                      <span>Ascending</span>
                    </div>
                  </SelectItem>
                  <SelectItem value='desc'>
                    <div className='flex items-center gap-4'>
                      <ArrowDownAZ size={16} />
                      <span>Descending</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div> */}
        <Separator className='shadow-sm' />
        <div className='faded-bottom no-scrollbar grid gap-4 overflow-auto pt-4 pb-16'>
          <div className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Traffic Overview</CardTitle>
                <CardDescription>Weekly clicks and unique visitors</CardDescription>
              </CardHeader>
              <CardContent className='px-6'>
                {/* <AnalyticsChart /> */}
              </CardContent>
            </Card>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>{campaign?.title}</CardTitle>
                  <CardDescription>{campaign?.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 border-2 border-white">
                      <AvatarImage src="https://github.com/shadcn.png" alt="@thedreamytrees" />
                      <AvatarFallback>DT</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div>Created by</div>
                      <div>{campaign?.owner ? formatAddress(campaign.owner) : ''} {isOwner && (<span className="font-bold">(You)</span>)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Campaign Overview</CardTitle>
                  <CardDescription>Fundraising status and contribution details</CardDescription>
                  <Badge className={CampaignStateBadgeClass[campaign?.state ? campaign.state : CampaignState.Active]}>
                    {CampaignStateLabel[campaign?.state ? campaign.state : CampaignState.Active]}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>Funding Progress</div>
                        <div>{progress} %</div>
                      </div>
                      <Progress value={progress} />
                    </div>

                    <div className="grid grid-cols-2 gap-y-8 gap-x-4 text-center">

                      {/* Item 1 */}
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold">{campaign?.amountCollected ? formatEther(campaign.amountCollected) : 0} ETH</span>
                        <span className="text-sm mt-1">Raised</span>
                      </div>

                      {/* Item 2 */}
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold">{campaign?.target ? formatEther(campaign.target) : 0} ETH</span>
                        <span className="text-sm mt-1">Target</span>
                      </div>

                      {/* Item 3 */}
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold">{contributors ? contributors.length : 0}</span>
                        <span className="text-sm mt-1">Total Contributors</span>
                      </div>

                      {/* Item 4 */}
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold">{daysLeft}</span>
                        <span className="text-sm mt-1">Days Left</span>
                      </div>

                    </div>

                    {isOwner && (
                      <div className="grid gap-3">
                        <Button
                          className='mt-2'
                          disabled={isPending || isConfirming}
                          onClick={() => withdrawCampaign(campaignId)}
                        >
                          {isPending && <Loader2 className='animate-spin' />}
                          Withdraw funds
                        </Button>

                        <div className='relative my-2'>
                          <div className='absolute inset-0 flex items-center'>
                            <span className='w-full border-t' />
                          </div>
                          <div className='relative flex justify-center text-xs uppercase'>
                            <span className='bg-background px-2 text-muted-foreground'>
                              Or continue with
                            </span>
                          </div>
                        </div>

                        <Button
                          variant='outline'
                          disabled={isPending || isConfirming}
                          onClick={() => finalizeCampaign(campaignId)}
                        >
                          Finalize Campaign
                        </Button>
                      </div>
                    )}

                    {!isOwner && (
                      <>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
                            <FormField
                              control={form.control}
                              name='donationAmount'
                              render={({ field: { value, ...rest } }) => (
                                <FormItem>
                                  <FormLabel>Enter donation amount (ETH)</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='Donation amount'
                                      type="number" // Nên thêm type="number" để hiện bàn phím số
                                      {...rest}

                                      // 🔥 FIX LỖI TẠI ĐÂY:
                                      // Ép kiểu 'unknown' thành 'string | number' để TypeScript không báo lỗi nữa
                                      value={(value as string | number) ?? ''}
                                    // onChange={(e) => {
                                    //   const value = e.target.value
                                    //   field.onChange(value === '' ? undefined : Number(value))
                                    // }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {hash && (
                              <div className="mx-1 rounded-md border p-3 text-sm space-y-1">
                                <div className="break-all">
                                  <span className="font-medium">Transaction Hash:</span>
                                  <div className="text-muted-foreground">{hash}</div>
                                </div>

                                {isConfirming && (
                                  <div className="text-yellow-600">
                                    ⏳ Waiting for confirmation...
                                  </div>
                                )}
                              </div>
                            )}

                            {error && (
                              <div className="mx-1 rounded-md border p-3 text-sm space-y-1">
                                <div className="text-red-600">
                                  ❌ Error: {(error as BaseError).shortMessage || error.message}
                                </div>
                              </div>
                            )}

                            <Button
                              className='mt-2'
                              disabled={isPending || isConfirming}
                            >
                              {isPending && <Loader2 className='animate-spin' />}
                              Contribute Now
                            </Button>

                            <div className='relative my-2'>
                              <div className='absolute inset-0 flex items-center'>
                                <span className='w-full border-t' />
                              </div>
                              <div className='relative flex justify-center text-xs uppercase'>
                                <span className='bg-background px-2 text-muted-foreground'>
                                  Or continue with
                                </span>
                              </div>
                            </div>

                            <div className='grid grid-cols-2 gap-2'>
                              <Button
                                variant='outline'
                                disabled={isPending || isConfirming}
                                onClick={() => finalizeCampaign(campaignId)}
                              >
                                Finalize Campaign
                              </Button>

                              <Button
                                variant='outline'
                                onClick={() => refundCampaign(campaignId)}
                              >
                                Refund
                              </Button>
                            </div>
                          </form>
                        </Form>

                        <Item variant="outline">
                          <ItemContent>
                            <ItemDescription>
                              Your contribution: {donatedWei && formatEther(donatedWei)}
                            </ItemDescription>
                          </ItemContent>
                        </Item>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <DonationsTable donations={donations} />
            </div>

            {/* <Tabs
              orientation='vertical'
              defaultValue='overview'
              className='space-y-4'
            >
              <div className='w-full overflow-x-auto pb-2'>
                <TabsList>
                  <TabsTrigger value='overview'>Overview</TabsTrigger>
                  <TabsTrigger value='analytics'>Analytics</TabsTrigger>
                  <TabsTrigger value='reports' disabled>
                    Reports
                  </TabsTrigger>
                  <TabsTrigger value='notifications' disabled>
                    Notifications
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value='overview' className='space-y-4'>
                
              </TabsContent>
              <TabsContent value='analytics' className='space-y-4'>
              </TabsContent>
            </Tabs> */}
          </div>
        </div>
      </Main >
    </>

    // <>
    //   <Header>
    //     <Search />
    //     <div className='ms-auto flex items-center gap-4'>
    //       <ThemeSwitch />
    //       <ConfigDrawer />
    //       <ProfileDropdown />
    //     </div>
    //   </Header>

    //   {/* ===== Content ===== */}
    //   <Main fixed>
    //     <div className='flex flex-wrap items-end justify-between gap-2'>
    //       <div>
    //         <h1 className='text-2xl font-bold tracking-tight'>Campaigns</h1>
    //         <p className='text-muted-foreground'>
    //           Here&apos;s a list of Campaigns!
    //         </p>
    //       </div>
    //       {/* <CampaignsPrimaryButtons /> */}
    //     </div>

    //   </Main>
    // </>
  )
}