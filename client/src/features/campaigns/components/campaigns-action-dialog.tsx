'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/date-picker'
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { Campaign } from '../data/schema'
import { useEffect } from 'react'
import { abi } from '../data/abi'
import { parseEther } from 'viem'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z
  .object({
    title: z.string().min(1, 'Title is required.'),
    description: z.string().min(1, 'Description is required.'),
    target: z.coerce
      .number()
      .positive('Target amount must be greater than 0'),
    deadline: z.date('Please select your deadline.'),
    // image: z
    //   .instanceof(FileList)
    //   .refine((files) => files.length > 0, {
    //     message: 'Please upload a file',
    //   })
    //   .refine(
    //     (files) => ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(files?.[0]?.type),
    //     'Please upload (jpg, jpeg, png, webp) format.'
    //   ),
  })
type CampaignForm = z.input<typeof formSchema>

type CampaignActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CampaignsActionDialog({
  open,
  onOpenChange,
}: CampaignActionDialogProps) {
  const form = useForm<CampaignForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      target: 0,
      deadline: undefined,
      // image: undefined,
    }
  })

  // const fileRef = form.register('image')

  const {
    writeContract,
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

  function createCampaignTx(values: Campaign) {
    writeContract({
      address: import.meta.env.VITE_CONTRACT_ADDRESS,
      abi: abi,
      functionName: "createCampaign", // có nhiều abi name nên functionName để biết gọi hàm nào
      args: [
        values.title,                  // string
        values.description,            // string
        parseEther(values.target.toString()),     // ✅ ETH → WEI         // uint256 ❗ Converts a string representation of ether to numerical wei.
        BigInt(values.deadline),       // uint256 (timestamp seconds) ❗
        // values.image,                  // string
      ], // Token ID
    })
  }

  const onSubmit = (values: CampaignForm) => {
    // form.reset()
    // showSubmittedData(values)
    // onOpenChange(false)

    createCampaignTx({
      title: values.title,
      description: values.description,
      target: Number(values.target),
      deadline: values.deadline.getTime() / 1000, // milliseconds → seconds
      // image: fileDetails.name,
    })

    // const file = form.getValues('image')
    // console.log(file)

    // if (file && file[0]) {
    //   const fileDetails = {
    //     name: file[0].name,
    //     size: file[0].size,
    //     type: file[0].type,
    //   }

    //   createCampaignTx({
    //     title: values.title,
    //     description: values.description,
    //     target: values.target, 
    //     deadline: values.deadline.getTime() / 1000, // milliseconds → seconds
    //     // image: fileDetails.name,
    //   })
    // }
  }

  useEffect(() => {
    if (isConfirmed) {
      form.reset()
      onOpenChange(false)
    }
  }, [isConfirmed])

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Add New Campaign</DialogTitle>
          <DialogDescription>
            Create new campaign here.
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='campaign-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Campaign Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Campaign Title'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Description'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='target'
                render={({ field: { value, ...rest } }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Target Amount (ETH)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Target Amount'
                        className='col-span-4'
                        type="number" // Nên thêm type="number" để hiện bàn phím số
                        {...rest}

                        // 🔥 FIX LỖI TẠI ĐÂY:
                        // Ép kiểu 'unknown' thành 'string | number' để TypeScript không báo lỗi nữa
                        value={(value as string | number) ?? ''}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='deadline'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Deadline</FormLabel>
                    <DatePicker selected={field.value} onSelect={field.onChange} />
                    <FormDescription>
                      The campaign will automatically end at this time.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                control={form.control}
                name='image'
                render={() => (
                  <FormItem className='my-2'>
                    <FormLabel>File</FormLabel>
                    <FormControl>
                      <Input type='file' {...fileRef} className='h-8 py-0' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </form>
          </Form>
        </div>

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
              ❌ Error: {error.message}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type='submit'
            form='campaign-form'
            disabled={isPending || isConfirming}
          >
            {isPending ? "Confirming..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
