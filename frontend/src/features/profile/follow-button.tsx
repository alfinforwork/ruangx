import { useState } from 'react'
import type { User } from '@/types/api'
import { useFollow, useUnfollow } from '@/hooks/follow/use-follow'

interface FollowButtonProps {
  user: Pick<User, 'username' | 'isFollowing'>
  variant?: 'solid' | 'pill'
}

/** Follow / unfollow toggle with optimistic local state. */
export function FollowButton({ user, variant = 'solid' }: FollowButtonProps) {
  const follow = useFollow()
  const unfollow = useUnfollow()
  const [following, setFollowing] = useState(!!user.isFollowing)

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (following) {
      setFollowing(false)
      unfollow.mutate(user.username)
    } else {
      setFollowing(true)
      follow.mutate(user.username)
    }
  }

  if (variant === 'pill') {
    return (
      <button
        onClick={toggle}
        className={`rounded-full px-[18px] py-2 text-[13.5px] font-bold transition ${
          following
            ? 'border border-line-strong text-[#c9c9d2] hover:border-[#fb5a7e] hover:text-[#fb5a7e]'
            : 'bg-ink-bright text-bg hover:brightness-95'
        }`}
      >
        {following ? 'Mengikuti' : 'Ikuti'}
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      className={`rounded-xl px-5 py-2.5 text-[14px] font-bold transition ${
        following
          ? 'border border-line-strong text-[#c9c9d2] hover:bg-white/[0.05]'
          : 'bg-grad-brand text-white hover:brightness-110'
      }`}
    >
      {following ? 'Mengikuti' : 'Ikuti'}
    </button>
  )
}
