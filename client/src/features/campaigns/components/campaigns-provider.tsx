import React from 'react'
import useDialogState from '@/hooks/use-dialog-state'

type CampaignsDialogType = 'create'

type CampaignsContextType = {
  open: CampaignsDialogType | null
  setOpen: (str: CampaignsDialogType | null) => void
}

const CampaignsContext = React.createContext<CampaignsContextType | null>(null)

export function CampaignsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<CampaignsDialogType>(null)

  return (
    <CampaignsContext value={{ open, setOpen }}>
      {children}
    </CampaignsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCampaigns = () => {
  const campaignsContext = React.useContext(CampaignsContext)

  if (!campaignsContext) {
    throw new Error('useCampaigns has to be used within <CampaignsContext>')
  }

  return campaignsContext
}
