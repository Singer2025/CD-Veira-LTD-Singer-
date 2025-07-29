import { Metadata } from 'next'

import OverviewReport from './overview-report'
import { authOptions } from '@/auth'
import { getServerSession } from 'next-auth/next'
export const metadata: Metadata = {
  title: 'Admin Dashboard',
}
const DashboardPage = async () => {
  const session = await getServerSession(authOptions)
  if (session?.user.role !== 'Admin')
    throw new Error('Admin permission required')

  return <OverviewReport />
}

export default DashboardPage
