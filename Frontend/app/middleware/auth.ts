import { Role } from '~/types/auth'

export default defineNuxtRouteMiddleware(() => {
  // Middleware only runs on client
  if (import.meta.server) {
    return
  }

  const token = localStorage.getItem('auth_token')
  const rawUser = localStorage.getItem('auth_user')

  // No authentication
  if (!token || !rawUser) {
    return navigateTo('/auth/login')
  }

  try {
    const user = JSON.parse(rawUser)

    // Allow both USER and ADMIN
    if (
      user.role !== Role.USER &&
      user.role !== Role.ADMIN
    ) {
      return navigateTo('/auth/login')
    }

  } catch {
    // Invalid user data
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_token')

    return navigateTo('/auth/login')
  }
})