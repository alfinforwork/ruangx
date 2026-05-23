'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/presentation/store'
import { useRouter } from 'next/navigation'

export function Providers({ children }: { children: React.ReactNode }) {
  const { restore, user, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => { restore() }, [restore])

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [loading, user, router])

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>

  return <>{children}</>
}