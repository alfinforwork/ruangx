// Compact Indonesian relative time — matches the design's "5 mnt / 2 jam / 3 hari".

export function timeAgo(input: string | number | Date): string {
  const date = new Date(input)
  const diff = Date.now() - date.getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 45) return 'baru'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} mnt`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} jam`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} hari`
  const wk = Math.floor(day / 7)
  if (wk < 4) return `${wk} mgg`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}
