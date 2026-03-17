import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/auth'

export default async function HomePage() {
  const session = await getAuthSession()

  if (session) {
    if (session.user.role === 'CLIENT') {
      redirect('/portal')
    }
    redirect('/dashboard')
  }

  redirect('/login')
}
