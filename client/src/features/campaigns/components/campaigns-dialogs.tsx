import { CampaignsActionDialog } from "./campaigns-action-dialog"
import { useCampaigns } from "./campaigns-provider"


export function CampaignsDialogs() {
  const { open, setOpen } = useCampaigns()
  return (
    <>
      <CampaignsActionDialog
        key='campaign-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />
    </>
  )
}
