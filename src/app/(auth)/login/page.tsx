'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Zap, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const loginSchema = z.object({
  email: z.string().email('Email invalid'),
  password: z.string().min(6, 'Parola trebuie să aibă cel puțin 6 caractere'),
})

type LoginValues = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginValues) => {
    setError(null)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError('A apărut o eroare neașteptată. Încearcă din nou.')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Autentificare</h2>
        <p className="mt-1 text-sm text-gray-500">Intră în contul tău pentru a continua</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@exemplu.ro"
            autoComplete="email"
            {...register('email')}
            className={errors.email ? 'border-red-400' : ''}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Parolă</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
              className={errors.password ? 'border-red-400 pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isSubmitting}
        >
          Autentifică-te
        </Button>
      </form>

      {/* Demo accounts */}
      <div className="mt-6 pt-5 border-t">
        <p className="text-xs text-gray-500 mb-3 font-medium">Conturi demonstrative:</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Admin', email: 'admin@pram.ro' },
            { label: 'Manager', email: 'manager@pram.ro' },
            { label: 'Tehnician', email: 'tehnician1@pram.ro' },
            { label: 'Back-office', email: 'office@pram.ro' },
          ].map(account => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                signIn('credentials', {
                  email: account.email,
                  password: 'Password123!',
                  callbackUrl,
                })
              }}
              className="text-left rounded-lg border border-dashed border-gray-200 px-3 py-2 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <p className="text-xs font-semibold text-gray-700">{account.label}</p>
              <p className="text-[10px] text-gray-400 truncate">{account.email}</p>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">Parolă: Password123!</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/30">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">PRAM Platform</h1>
            <p className="text-xs text-blue-300">Verificări prize de pământ</p>
          </div>
        </div>

        <Suspense fallback={<div className="bg-white rounded-2xl shadow-2xl p-8 text-center text-gray-500">Se încarcă...</div>}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()} PRAM Platform. Toate drepturile rezervate.
        </p>
      </div>
    </div>
  )
}
