import { Role } from '~/types/auth'

export default defineNuxtRouteMiddleware(() => {

  // Middleware only runs on client
  if (import.meta.server) {
    return
  }

  const token =
    localStorage.getItem('auth_token')

  const rawUser =
    localStorage.getItem('auth_user')

  // No authentication
  if (!token || !rawUser) {

    return navigateTo('/login')
  }

  try {

    const user =
      JSON.parse(rawUser)

    // Only ADMIN can access dashboard
    if (
      user.role !== Role.ADMIN
    ) {

      return navigateTo('/login')
    }

  } catch {

    // Invalid user data
    localStorage.removeItem(
      'auth_user'
    )

    localStorage.removeItem(
      'auth_token'
    )

    return navigateTo('/login')
  }
})