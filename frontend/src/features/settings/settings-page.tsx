import { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useUpdateProfile, useLogout } from '@/hooks/auth/use-auth'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useNavigate } from '@tanstack/react-router'
import { Settings, ChevronLeft, LogOut } from 'lucide-react'

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useUpdateProfile()
  const logout = useLogout()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [website, setWebsite] = useState(user?.website ?? '')
  const [location, setLocation] = useState(user?.location ?? '')

  const handleSave = async () => {
    await updateProfile.mutateAsync({ displayName, bio, website, location })
  }

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-surface-800 px-4 py-3">
        <button
          onClick={() => navigate({ to: '/' })}
          className="rounded-full p-1 text-white hover:bg-surface-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-white">Pengaturan</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar
            src={user?.avatarUrl}
            alt={user?.displayName ?? ''}
            size="xl"
          />
          <div>
            <p className="font-semibold text-white">{user?.displayName}</p>
            <p className="text-sm text-gray-500">@{user?.username}</p>
          </div>
        </div>

        <Separator />

        {/* Profile form */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-white">Profil</h2>

          <Input
            label="Nama Tampilan"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Nama Anda"
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">
              Bio
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tentang Anda"
              className="min-h-[80px]"
              rows={3}
            />
          </div>

          <Input
            label="Website"
            value={website ?? ''}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
          />

          <Input
            label="Lokasi"
            value={location ?? ''}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Jakarta, Indonesia"
          />

          <Button
            onClick={handleSave}
            loading={updateProfile.isPending}
            className="w-full"
          >
            Simpan
          </Button>
        </div>

        <Separator />

        {/* Logout */}
        <div>
          <Button
            variant="danger"
            onClick={() => logout.mutate()}
            loading={logout.isPending}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
      </div>
    </div>
  )
}