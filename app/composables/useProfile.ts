import type { User } from '~~/server/database/schema'

export const useProfile = () => {
  const { loggedIn } = useUserSession()
  // const userId = loggedIn ? session?.user?.id : null

  const profile = useState<User | null>('profile', () => null)
  const loading = useState('profile-loading', () => false)

  const fetchProfile = async () => {
    if (!loggedIn) {
      profile.value = null
      return
    }
    else {
      loading.value = true

      try {
        const data = await $fetch<User>('/api/profile')
        profile.value = data ?? null
      }
      catch (e) {
        console.error('Error loading profile:', e)
      }
      finally { loading.value = false }
    }
  }

  return { profile, fetchProfile, loading }
}
