import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  // component: Dashboard,
  beforeLoad: () => {
    throw redirect({
      to: '/campaigns',
    })
  },
})
