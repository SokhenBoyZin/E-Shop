import { ref } from 'vue'

export interface ConnectivityTypeRequest {
  name: string
}

export interface ConnectivityTypeResponse {
  connectivityId: number
  connectivityName: string | null
}

export const useConnectivity = () => {
  const config = useRuntimeConfig()

  const connectivities = ref<ConnectivityTypeResponse[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Helper for Authorization Headers
  const getAuthHeaders = (): Record<string, string> => {
    if (import.meta.server) return {}
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // GET: All Connectivity Types
  const fetchConnectivities = async (): Promise<ConnectivityTypeResponse[]> => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<ConnectivityTypeResponse[]>(
        `${config.public.apiBase}/ConnectivityType`,
        {
          headers: getAuthHeaders()
        }
      )
      connectivities.value = data
      return data
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to fetch connectivity types'
      return []
    } finally {
      loading.value = false
    }
  }

  // GET: Connectivity Type By ID
  const getConnectivityById = async (
    id: number
  ): Promise<ConnectivityTypeResponse | null> => {
    loading.value = true
    error.value = null
    try {
      return await $fetch<ConnectivityTypeResponse>(
        `${config.public.apiBase}/ConnectivityType/${id}`,
        {
          headers: getAuthHeaders()
        }
      )
    } catch (err: any) {
      error.value = err.data?.message || 'Connectivity type not found'
      return null
    } finally {
      loading.value = false
    }
  }

  // POST: Create Connectivity Type
  const createConnectivity = async (
    request: ConnectivityTypeRequest
  ): Promise<ConnectivityTypeResponse | null> => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<ConnectivityTypeResponse>(
        `${config.public.apiBase}/ConnectivityType`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: request
        }
      )
      connectivities.value.push(data)
      return data
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to create connectivity type'
      return null
    } finally {
      loading.value = false
    }
  }

  // PUT: Update Connectivity Type
  const updateConnectivity = async (
    id: number,
    request: ConnectivityTypeRequest
  ): Promise<ConnectivityTypeResponse | null> => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<ConnectivityTypeResponse>(
        `${config.public.apiBase}/ConnectivityType/${id}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: request
        }
      )
      const index = connectivities.value.findIndex(
        (c) => c.connectivityId === id
      )
      if (index !== -1) {
        connectivities.value[index] = data
      }
      return data
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to update connectivity type'
      return null
    } finally {
      loading.value = false
    }
  }

  // DELETE: Remove Connectivity Type
  const deleteConnectivity = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`${config.public.apiBase}/ConnectivityType/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      connectivities.value = connectivities.value.filter(
        (c) => c.connectivityId !== id
      )
      return true
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to delete connectivity type'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    connectivities,
    loading,
    error,
    fetchConnectivities,
    getConnectivityById,
    createConnectivity,
    updateConnectivity,
    deleteConnectivity
  }
}