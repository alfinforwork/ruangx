'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { forgotPassword } from '@/infrastructure/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await forgotPassword(email)
      setDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive reset instructions</CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <p className="text-green-600">Check your email for reset instructions.</p>
          ) : (
            <form onSubmit={handle} className="space-y-4">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              <Button type="submit" className="w-full">Send Reset Link</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}