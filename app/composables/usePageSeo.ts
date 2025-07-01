export const usePageSeo = () => {
  const pageSeoData = ref<Record<string, string>>({})
  const loading = ref(false)
  const fetchPageSeo = async () => {
    loading.value = true
    try {
      pageSeoData.value = await $fetch('/api/pageSeo')
    }
    catch (err) { console.log('Failed to fetch PageSeo data useComposable', err) }
    finally { loading.value = false }
  }

  const refresh = async () => {
    await fetchPageSeo()
  }
  return { pageSeoData, loading, fetchPageSeo, refresh }
}
