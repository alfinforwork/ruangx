import { useNavigate, Link } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useLogin, useRegister } from '@/hooks/auth/use-auth'
import { useState } from 'react'

export function LoginForm() {
  const navigate = useNavigate()
  const login = useLogin()

  const form = useForm({
    defaultValues: {
      identifier: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      await login.mutateAsync(value)
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600">
            <span className="text-2xl font-bold text-white">r</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Masuk ke ruangx</h1>
          <p className="mt-1 text-sm text-gray-400">Selamat datang kembali</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="identifier"
            children={(field) => (
              <Input
                label="Username atau Email"
                id="identifier"
                placeholder="username@email.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          />

          <form.Field
            name="password"
            children={(field) => (
              <Input
                label="Kata Sandi"
                id="password"
                type="password"
                placeholder="••••••••"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          />

          {login.error && (
            <p className="text-sm text-red-400">
              {login.error instanceof Error ? login.error.message : 'Login gagal'}
            </p>
          )}

          <Button type="submit" loading={login.isPending} className="w-full" size="lg">
            Masuk
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Belum punya akun?{' '}
          <Link to="/register" className="font-medium text-brand-500 hover:text-brand-400">
            Daftar
          </Link>
        </p>
      </Card>
    </div>
  )
}

export function RegisterForm() {
  const navigate = useNavigate()
  const register = useRegister()

  const form = useForm({
    defaultValues: {
      username: '',
      displayName: '',
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      await register.mutateAsync(value)
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600">
            <span className="text-2xl font-bold text-white">r</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Daftar ruangx</h1>
          <p className="mt-1 text-sm text-gray-400">Buat akun baru</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="username"
            children={(field) => (
              <Input
                label="Username"
                id="username"
                placeholder="username"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          />

          <form.Field
            name="displayName"
            children={(field) => (
              <Input
                label="Nama Tampilan"
                id="displayName"
                placeholder="Nama Anda"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          />

          <form.Field
            name="email"
            children={(field) => (
              <Input
                label="Email"
                id="email"
                type="email"
                placeholder="email@example.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          />

          <form.Field
            name="password"
            children={(field) => (
              <Input
                label="Kata Sandi"
                id="password"
                type="password"
                placeholder="••••••••"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          />

          {register.error && (
            <p className="text-sm text-red-400">
              {register.error instanceof Error ? register.error.message : 'Registrasi gagal'}
            </p>
          )}

          <Button type="submit" loading={register.isPending} className="w-full" size="lg">
            Daftar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-brand-500 hover:text-brand-400">
            Masuk
          </Link>
        </p>
      </Card>
    </div>
  )
}