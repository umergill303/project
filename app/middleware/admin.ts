export default defineNuxtRouteMiddleware(async to => {
  const { fetch, user } = useUserSession()
  await fetch()

  if (to.path.startsWith('/dashboard') && !user.value?.roles?.includes('admin')) {
    return navigateTo('/')
  }
})
