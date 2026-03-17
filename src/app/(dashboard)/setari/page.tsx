import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Settings, Bell, Users, Database, Shield } from 'lucide-react'

export const metadata: Metadata = { title: 'Setări' }

export default async function SetariPage() {
  const session = await getAuthSession()
  if (session?.user?.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div>
      <Header title="Setări" />
      <div className="p-6 space-y-6">
        <PageHeader
          title="Setări platformă"
          description="Configurare și administrare sistem"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Utilizatori și roluri</CardTitle>
                  <CardDescription>Gestionare conturi și permisiuni</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Administrați utilizatorii platformei, rolurile și permisiunile de acces.
              </p>
              <a href="/tehnicieni" className="text-sm text-blue-600 hover:underline mt-2 block">
                Gestionează utilizatori →
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Notificări și remindere</CardTitle>
                  <CardDescription>Configurare alerte automate</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Reminder verificare periodică</span>
                  <span className="font-medium text-green-600">30 zile înainte</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Reminder etalonare aparat</span>
                  <span className="font-medium text-green-600">30 zile înainte</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Reminder expirare contract</span>
                  <span className="font-medium text-green-600">60 zile înainte</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                  <Database className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Backup și arhivare</CardTitle>
                  <CardDescription>Export date și configurare backup</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Configurați backup-urile automate ale bazei de date și arhivarea documentelor.
              </p>
              <p className="text-xs text-gray-400 mt-2 italic">Funcționalitate disponibilă în versiunea Pro</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Securitate</CardTitle>
                  <CardDescription>Politici de parolă și audit</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Autentificare 2FA</span>
                  <span className="text-amber-500 font-medium">Neactivat</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Log activitate</span>
                  <span className="text-green-600 font-medium">Activ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sesiune maximă</span>
                  <span className="font-medium">30 zile</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* About */}
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">PRAM Platform v1.0.0</p>
                <p className="text-sm text-gray-500">Platformă de management al verificărilor prize de pământ și protecție împotriva electrocutării</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
