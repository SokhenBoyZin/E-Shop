import {
  Role,
  type LoginResponse,
  type UserResponse
} from '~/types/auth'

export const useAuth = () => {

  const config = useRuntimeConfig()

  // ==========================================
  // REACTIVE USER STATE
  // ==========================================

  const user = useState<UserResponse | null>(
    'auth_user',
    () => null
  )

  // ==========================================
  // LOAD USER FROM LOCAL STORAGE
  // ==========================================

  if (
    import.meta.client &&
    !user.value
  ) {

    const savedUser =
      localStorage.getItem('auth_user')

    if (savedUser) {

      try {

        user.value =
          JSON.parse(savedUser)

      } catch {

        localStorage.removeItem(
          'auth_user'
        )

      }
    }
  }

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (
    credentials: {
      email: string
      password: string
    }
  ) => {

    try {

      const data =
        await $fetch<LoginResponse>(
          `${config.public.apiBase}/Auth/login`,
          {
            method: 'POST',

            body: credentials
          }
        )

      // Save JWT
      if (
        data.token &&
        import.meta.client
      ) {

        localStorage.setItem(
          'auth_token',
          data.token
        )

        // Save user
        if (data.user) {

          localStorage.setItem(
            'auth_user',
            JSON.stringify(data.user)
          )

          user.value =
            data.user
        }
      }

      return {
        success: true,
        data
      }

    } catch (err: any) {

      console.error(
        'Login error:',
        err
      )

      return {
        success: false,

        error:
          err?.data?.message ||
          'Invalid email or password.'
      }
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = async () => {

    // Clear reactive state
    user.value = null

    // Clear local storage
    if (import.meta.client) {

      localStorage.removeItem(
        'auth_token'
      )

      localStorage.removeItem(
        'auth_user'
      )
    }

    // Go login
    return await navigateTo(
      '/auth/login',
      {
        replace: true
      }
    )
  }

  // ==========================================
  // GET JWT TOKEN
  // ==========================================

  const getToken = (): string | null => {

    if (import.meta.client) {

      return localStorage.getItem(
        'auth_token'
      )
    }

    return null
  }

  // ==========================================
  // CHECK ADMIN
  // ==========================================

  const isAdmin = computed(() => {

    return (
      user.value?.role ===
      Role.ADMIN
    )

  })

  return {
    user,
    isAdmin,
    login,
    logout,
    getToken
  }
}