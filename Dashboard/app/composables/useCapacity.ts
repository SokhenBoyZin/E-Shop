import { ref } from 'vue'

export interface CapacityRequest {
  sizeLabel: string
}

export interface CapacityResponse {
  capacityId: number
  sizeLabel: string
}

export const useCapacity = () => {
  const config = useRuntimeConfig()
  
  // Use runtime config for API base URL or fallback to relative path

  const capacities = ref<CapacityResponse[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Helper for Authorization Headers
  const getAuthHeaders = (): Record<string, string> => {
    if (import.meta.server) return {}
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // GET: All Capacities
  const fetchCapacities = async (): Promise<CapacityResponse[]> => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<CapacityResponse[]>(`${config.public.apiBase}/Capacity`, {
        headers: getAuthHeaders()
      })
      capacities.value = data
      return data
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to fetch capacities'
      return []
    } finally {
      loading.value = false
    }
  }

  // GET: Capacity By ID
  const getCapacityById = async (id: number): Promise<CapacityResponse | null> => {
    loading.value = true
    error.value = null
    try {
      return await $fetch<CapacityResponse>(`${config.public.apiBase}/Capacity/${id}`, {
        headers: getAuthHeaders()
      })
    } catch (err: any) {
      error.value = err.data?.message || 'Capacity not found'
      return null
    } finally {
      loading.value = false
    }
  }

  // POST: Create Capacity
  const createCapacity = async (request: CapacityRequest): Promise<CapacityResponse | null> => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<CapacityResponse>(`${config.public.apiBase}/Capacity`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: request
      })
      capacities.value.push(data)
      return data
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to create capacity'
      return null
    } finally {
      loading.value = false
    }
  }

  // PUT: Update Capacity
  const updateCapacity = async (id: number, request: CapacityRequest): Promise<CapacityResponse | null> => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<CapacityResponse>(`${config.public.apiBase}/Capacity/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: request
      })
      const index = capacities.value.findIndex(c => c.capacityId === id)
      if (index !== -1) {
        capacities.value[index] = data
      }
      return data
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to update capacity'
      return null
    } finally {
      loading.value = false
    }
  }

  // DELETE: Remove Capacity
  const deleteCapacity = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`${config.public.apiBase}/Capacity/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      capacities.value = capacities.value.filter(c => c.capacityId !== id)
      return true
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to delete capacity'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    capacities,
    loading,
    error,
    fetchCapacities,
    getCapacityById,
    createCapacity,
    updateCapacity,
    deleteCapacity
  }
}