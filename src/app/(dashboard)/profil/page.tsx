import { Metadata } from 'next'
import { getAuthSession, getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RoleBadge } from '@/components/shared/status-badge'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Profilul meu' }

export default async function ProfilPage() {
  const session = await getAuthSession()
  if (!session) redirect('/login')

  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div>
      <Header title="Profilul meu" />
      <div className="p-6 space-y-6 max-w-2xl">
        <PageHeader title="Profilul meu" description="Informațiile contului tău" />

        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500 text-white text-3xl font-bold">
            {user.prenume.charAt(0)}{user.nume.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.prenume} {user.nume}</h2>
            <p className="text-gray-500">{user.email}</p>
            <div className="mt-1.5">
              <RoleBadge role={user.role} />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Date personale</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-gray-500">Prenume</dt>
                <dd className="mt-1 font-medium">{user.prenume}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Nume</dt>
                <dd className="mt-1 font-medium">{user.nume}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="mt-1">{user.email}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Telefon</dt>
                <dd className="mt-1">{user.telefon ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Rol</dt>
                <dd className="mt-1"><RoleBadge role={user.role} /></dd>
              </div>
              <div>
                <dt className="text-gray-500">Status cont</dt>
                <dd className="mt-1">
                  <span className={`text-sm font-medium ${user.status === 'ACTIV' ? 'text-green-600' : 'text-red-600'}`}>
                    {user.status === 'ACTIV' ? 'Activ' : 'Inactiv'}
                  </span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-5">
            <p className="text-sm text-amber-700">
              Pentru modificarea datelor personale sau a parolei, contactați administratorul platformei.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
