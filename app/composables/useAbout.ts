export const useAbout = () => {
  const aboutData = useState('aboutData', () => ({}))
  const loading = ref(false)
  const fetchAbout = async () => {
    loading.value = true
    try {
      const data = await $fetch('/api/about')
      aboutData.value = data
    }
    catch (err) { console.log('Failed to fetch about data useComposable', err) }
    finally { loading.value = false }
  }

  const refresh = async () => {
    await fetchAbout()
  }
  return { aboutData, loading, fetchAbout, refresh }
}
