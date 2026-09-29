import type { UserResponse } from '~/types/user'

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  confirm_password: string
}

export interface UserRequest {
  username?: string
  email?: string
}

export interface UpdateRoleRequest {
  role: string | number
}

interface RegisterApiResponse {
  message: string
  user: UserResponse
  token: string
}

export const useUsers = () => {
  const config = useRuntimeConfig()

  const users = useState<UserResponse[]>('users_list', () => [])
  const pending = useState<boolean>('users_pending', () => false)
  const error = useState<string | null>('users_error', () => null)

  const getHeaders = (): Record<string, string> => {
    if (import.meta.client) {
      const token = localStorage.getItem('auth_token')
      return token ? { Authorization: `Bearer ${token}` } : {}
    }
    return {}
  }

  // POST: api/auth/register (Create new user)
  const createUser = async (payload: CreateUserRequest) => {
    pending.value = true
    error.value = null

    try {
      const response = await $fetch<RegisterApiResponse>(`${config.public.apiBase}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: payload
      })

      // Append new user to list
      if (response?.user) {
        users.value = [response.user, ...users.value]
      }

      return { success: true, data: response.user }
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to create user.'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      pending.value = false
    }
  }

  // GET: api/users/admin (Fetch all users)
  const fetchUsers = async () => {
    pending.value = true
    error.value = null

    try {
      const response = await $fetch<UserResponse[]>(`${config.public.apiBase}/users/admin`, {
        headers: getHeaders()
      })
      users.value = response
    } catch (err: any) {
      console.error('Failed to fetch users:', err)
      error.value = err?.data?.message || err?.message || 'Failed to fetch users'
      users.value = []
    } finally {
      pending.value = false
    }
  }

  // GET: api/users/admin/{id}
  const getUserById = async (id: number) => {
    pending.value = true
    error.value = null

    try {
      const data = await $fetch<UserResponse>(`${config.public.apiBase}/users/admin/${id}`, {
        headers: getHeaders()
      })
      return { success: true, data }
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to fetch user details'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      pending.value = false
    }
  }

  // PUT: api/users/admin/{id}
  const updateUser = async (id: number, payload: UserRequest) => {
    pending.value = true
    error.value = null

    try {
      const updatedUser = await $fetch<UserResponse>(`${config.public.apiBase}/users/admin/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: payload
      })

      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        const updatedList = [...users.value]
        updatedList[index] = { ...updatedList[index]!, ...updatedUser }
        users.value = updatedList
      }

      return { success: true, data: updatedUser }
    } catch (err: any) {
      const msg = err?.data?.message || 'Unable to update user.'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      pending.value = false
    }
  }

  // PUT: api/users/admin/{id}/role
  const updateUserRole = async (id: number, payload: UpdateRoleRequest) => {
    pending.value = true
    error.value = null

    try {
      await $fetch(`${config.public.apiBase}/users/admin/${id}/role`, {
        method: 'PUT',
        headers: getHeaders(),
        body: payload
      })

      const index = users.value.findIndex((u) => u.id === id)
      if (index !== -1) {
        const updatedList = [...users.value]
        updatedList[index] = {
          ...updatedList[index]!,
          role: payload.role as any
        }
        users.value = updatedList
      }

      return { success: true }
    } catch (err: any) {
      const msg = err?.data?.message || 'Unable to update user role.'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      pending.value = false
    }
  }

  // DELETE: api/users/admin/{id}
  const deleteUser = async (id: number) => {
    pending.value = true
    error.value = null

    try {
      await $fetch(`${config.public.apiBase}/users/admin/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })

      users.value = users.value.filter((u) => u.id !== id)

      return { success: true }
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to delete user.'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      pending.value = false
    }
  }

  return {
    users,
    pending,
    error,
    createUser,
    fetchUsers,
    getUserById,
    updateUser,
    updateUserRole,
    deleteUser,
    refresh: fetchUsers
  }
}