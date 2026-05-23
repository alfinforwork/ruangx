'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/presentation/store'
import { updateProfile, changePassword } from '@/infrastructure/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  const { user, restore } = useAuthStore()
  const router = useRouter()
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [msg, setMsg] = useState('')

  const handleAccount = async () => {
    await updateProfile({ name, bio } as any)
    await restore()
    setMsg('Profile updated')
  }

  const handlePassword = async () => {
    await changePassword(currentPw, newPw)
    setCurrentPw(''); setNewPw('')
    setMsg('Password changed')
  }

  return (
    <div className="space-y-6 max-w-md">
      <h2 className="text-xl font-bold">Settings</h2>

      {msg && <p className="text-green-600 text-sm">{msg}</p>}

      <Card>
        <CardHeader><CardTitle className="text-lg">Account Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} />
          <Button onClick={handleAccount}>Save</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Current password" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
          <Input placeholder="New password" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
          <Button onClick={handlePassword}>Change Password</Button>
        </CardContent>
      </Card>
    </div>
  )
}