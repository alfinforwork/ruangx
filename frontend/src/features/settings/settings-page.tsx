import { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useUpdateProfile, useLogout } from '@/hooks/auth/use-auth'
import { Avatar } from '@/components/ui/avatar'

function Toggle({
  on,
  onChange,
  disabled,
}: {
  on: boolean
  onChange?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onChange}
      className={`relative h-[27px] w-[46px] shrink-0 rounded-full transition-colors ${
        on ? 'bg-grad-brand' : 'bg-line-strong'
      } ${disabled ? 'opacity-60' : ''}`}
    >
      <span
        className={`absolute top-[3px] h-[21px] w-[21px] rounded-full bg-white transition-all ${
          on ? 'left-[22px]' : 'left-[3px]'
        }`}
      />
    </button>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-line bg-card">
      <div className="border-b border-line-row p-[16px_18px] text-[13px] font-bold uppercase tracking-[0.06em] text-muted">
        {title}
      </div>
      {children}
    </div>
  )
}

function Row({
  title,
  subtitle,
  right,
  last,
}: {
  title: string
  subtitle?: string
  right?: React.ReactNode
  last?: boolean
}) {
  return (
    <div className={`flex items-center justify-between p-[16px_18px] ${last ? '' : 'border-b border-line-row'}`}>
      <div className="flex-1 pr-4">
        <div className="text-[15px] font-semibold text-ink">{title}</div>
        {subtitle && <div className="mt-0.5 text-[13.5px] text-muted">{subtitle}</div>}
      </div>
      {right}
    </div>
  )
}

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useUpdateProfile()
  const logout = useLogout()

  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [website, setWebsite] = useState(user?.website ?? '')
  const [location, setLocation] = useState(user?.location ?? '')
  const [saved, setSaved] = useState(false)

  // Local UI prefs (backend only persists isPrivate)
  const [prefs, setPrefs] = useState({
    privateAccount: user?.isPrivate ?? false,
    readReceipts: true,
    autoplay: false,
    reduceMotion: false,
    pushLikes: true,
    pushReplies: true,
    pushFollows: true,
    pushMessages: true,
    twoFactor: false,
  })

  const toggle = (k: keyof typeof prefs) =>
    setPrefs((p) => {
      const next = { ...p, [k]: !p[k] }
      if (k === 'privateAccount') updateProfile.mutate({ isPrivate: next.privateAccount })
      return next
    })

  const save = async () => {
    await updateProfile.mutateAsync({ displayName, bio, website, location })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-24 pt-4 lg:px-7 lg:pb-16 lg:pt-7">
      <h1 className="mb-5 text-[22px] font-extrabold tracking-[-0.4px]">Pengaturan</h1>

      <div className="flex flex-col gap-[18px]">
        {/* Edit profile */}
        <Group title="Edit Profil">
          <div className="flex items-center gap-3.5 p-[16px_18px]">
            <Avatar src={user?.avatarUrl} alt={user?.displayName ?? ''} seed={user?.username} size="xl" />
            <div>
              <div className="text-[15px] font-bold text-ink-bright">{user?.displayName}</div>
              <div className="text-[13.5px] text-muted">@{user?.username}</div>
            </div>
          </div>
          <div className="space-y-3.5 p-[4px_18px_18px]">
            <LabeledInput label="Nama tampilan" value={displayName} onChange={setDisplayName} />
            <LabeledTextarea label="Bio" value={bio} onChange={setBio} />
            <LabeledInput label="Website" value={website} onChange={setWebsite} placeholder="https://" />
            <LabeledInput label="Lokasi" value={location} onChange={setLocation} placeholder="Jakarta, Indonesia" />
            <button
              onClick={save}
              disabled={updateProfile.isPending}
              className="w-full rounded-[14px] bg-grad-brand p-[13px] text-[15px] font-bold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {saved ? 'Tersimpan ✓' : 'Simpan Perubahan'}
            </button>
          </div>
        </Group>

        {/* Privacy */}
        <Group title="Privasi & Keamanan">
          <Row
            title="Akun privat"
            subtitle="Hanya pengikut yang bisa lihat thread kamu"
            right={<Toggle on={prefs.privateAccount} onChange={() => toggle('privateAccount')} />}
          />
          <Row
            title="Tanda dibaca"
            subtitle="Tampilkan saat kamu membaca pesan"
            right={<Toggle on={prefs.readReceipts} onChange={() => toggle('readReceipts')} />}
          />
          <Row
            title="Autentikasi dua faktor"
            subtitle="Tambah lapisan keamanan ekstra"
            right={<Toggle on={prefs.twoFactor} onChange={() => toggle('twoFactor')} />}
            last
          />
        </Group>

        {/* Notifications */}
        <Group title="Notifikasi">
          <Row title="Suka" right={<Toggle on={prefs.pushLikes} onChange={() => toggle('pushLikes')} />} />
          <Row title="Balasan & komentar" right={<Toggle on={prefs.pushReplies} onChange={() => toggle('pushReplies')} />} />
          <Row title="Pengikut baru" right={<Toggle on={prefs.pushFollows} onChange={() => toggle('pushFollows')} />} />
          <Row title="Pesan langsung" right={<Toggle on={prefs.pushMessages} onChange={() => toggle('pushMessages')} />} last />
        </Group>

        {/* Appearance */}
        <Group title="Tampilan">
          <Row
            title="Mode gelap"
            subtitle="Selalu aktif"
            right={<Toggle on disabled />}
          />
          <Row title="Putar media otomatis" right={<Toggle on={prefs.autoplay} onChange={() => toggle('autoplay')} />} />
          <Row title="Kurangi animasi" right={<Toggle on={prefs.reduceMotion} onChange={() => toggle('reduceMotion')} />} last />
        </Group>

        <button
          onClick={() => logout.mutate()}
          className="rounded-[14px] border border-[#fb5a7e]/25 bg-[#fb5a7e]/[0.08] p-[15px] text-[15px] font-bold text-[#fb5a7e] transition hover:bg-[#fb5a7e]/15"
        >
          Keluar dari ruangx
        </button>
      </div>
    </div>
  )
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <div className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.07em] text-muted">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[13px] border-[1.5px] border-line-input bg-input p-[12px_16px] text-[15px] text-ink outline-none focus:border-brand-500"
      />
    </div>
  )
}

function LabeledTextarea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <div className="mb-1.5 text-[12px] font-bold uppercase tracking-[0.07em] text-muted">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-[13px] border-[1.5px] border-line-input bg-input p-[12px_16px] text-[15px] leading-relaxed text-ink outline-none focus:border-brand-500"
      />
    </div>
  )
}
