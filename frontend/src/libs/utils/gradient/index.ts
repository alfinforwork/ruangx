// Deterministic gradient avatars — mirrors the gradient palette used in the
// ruangx design so users without a photo get a stable, colorful avatar.

const GRADIENTS = [
  'linear-gradient(135deg,#5b8def,#3b5bdb)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#10b981,#0891b2)',
  'linear-gradient(135deg,#ec4899,#8b5cf6)',
  'linear-gradient(135deg,#6366f1,#06b6d4)',
  'linear-gradient(135deg,#8b5cf6,#d946ef)',
  'linear-gradient(135deg,#f97316,#dc2626)',
  'linear-gradient(135deg,#06b6d4,#3b82f6)',
  'linear-gradient(135deg,#a855f7,#7c3aed)',
  'linear-gradient(135deg,#f472b6,#db2777)',
] as const

function hash(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

/** Stable CSS gradient string derived from a seed (username/name/id). */
export function gradientFor(seed: string | null | undefined): string {
  const s = (seed ?? '').trim() || '?'
  return GRADIENTS[hash(s) % GRADIENTS.length]
}

/** Up-to-2-char uppercase initials from a display name. */
export function initialsFor(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}
