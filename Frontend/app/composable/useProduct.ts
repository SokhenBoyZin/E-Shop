import type { Product } from '~/types/product'
import { useAuth } from './useAuth'

export interface ProductRequest {
  name: string
  image?: string
  chipName?: string
  cpuCores?: string
  gpuCores?: string
  ramGb?: number
  displayName?: string
  displayResolution?: string
  mainCameraMp?: number
  frontCameraMp?: number
  osVersion?: string
  categoryId: number
  isArchived?: boolean // FIX 1: Added to DTO
  variants?: any[]
}

export const useProduct = () => {
  const config = useRuntimeConfig()
  const { getToken } = useAuth()

  const products = useState<Product[]>('products_list', () => [])
  const pending = useState<boolean>('products_pending', () => false)
  const error = useState<string | null>('products_error', () => null)

  const getHeaders = (): Record<string, string> => {
    const token = getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // GET: api/Product (Fetch with optional query to include archived items)
  const fetchProducts = async (includeArchived: boolean = true) => {
    pending.value = true
    error.value = null

    try {
      // FIX 2: Send includeArchived param if backend supports fetching all items
      const response = await $fetch<Product[]>(`${config.public.apiBase}/Product`, {
        headers: getHeaders(),
        params: { includeArchived }
      })
      products.value = response
    } catch (err: any) {
      console.error('Failed to fetch products:', err)
      error.value = err?.data?.message || err?.message || 'Failed to fetch products'
      products.value = []
    } finally {
      pending.value = false
    }
  }

  //  SEARCH
  const searchProducts = async (search: string) => {
  if (!search.trim()) {
    return []
  }

  try {
    const data = await $fetch<Product[]>(
      `${config.public.apiBase}/Product/search`,
      {
        method: 'GET',
        params: {
          search: search.trim()
        }
      }
    )

    return data
  } catch (error) {
    console.error('Failed to search products:', error)
    return []
  }
}

  // CREATE
  const createProduct = async (payload: ProductRequest) => {
    pending.value = true
    error.value = null

    try {
      const data = await $fetch<Product>(`${config.public.apiBase}/Product`, {
        method: 'POST',
        headers: getHeaders(),
        body: payload
      })

      // Ensure object has explicit boolean
      data.isArchived = Boolean(data.isArchived)
      products.value = [data, ...products.value] // Trigger fresh array reactivity
      return { success: true, data }
    } catch (err: any) {
      const msg = err?.data?.message || err?.data || 'Failed to create product'
      error.value = typeof msg === 'string' ? msg : 'Failed to create product'
      return { success: false, error: error.value }
    } finally {
      pending.value = false
    }
  }

  // UPDATE
  const updateProduct = async (id: number, payload: ProductRequest) => {
    pending.value = true
    error.value = null

    try {
      const updatedProduct = await $fetch<Product>(`${config.public.apiBase}/Product/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: payload
      })

      const index = products.value.findIndex((p) => p.productId === id)
      if (index !== -1) {
        // FIX 3: Replace entire object in array to force Vue computed updates
        const updatedList = [...products.value]
        updatedList[index] = { ...updatedList[index], ...updatedProduct }
        products.value = updatedList
      }

      return { success: true, data: updatedProduct }
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to update product'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      pending.value = false
    }
  }

  // ARCHIVE
  const archiveProduct = async (id: number) => {
    pending.value = true
    error.value = null

    try {
      await $fetch(`${config.public.apiBase}/Product/${id}/archive`, {
        method: 'PATCH',
        headers: getHeaders()
      })

      // FIX 4: Reactive state update across array
      products.value = products.value.map((p) =>
        p.productId === id ? { ...p, isArchived: true } : p
      )

      return { success: true }
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to archive product'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      pending.value = false
    }
  }

  // GET ARCHIVED PRODUCTS
  const getArchievedProducts = async () => {
    pending.value = true
    error.value = null

    try {
      const data = await $fetch<Product[]>(`https://localhost:7234/archieved`, {
      method: 'GET',
      headers: getHeaders()
    })

      const archivedData = data.map((p) => ({ ...p, isArchived: true }))
      products.value = archivedData

      return { success: true, archivedData }
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to get archive product'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      pending.value = false
    }
  }

  // RESTORE
  const restoreProduct = async (id: number) => {
    pending.value = true
    error.value = null

    try {
      await $fetch(`${config.public.apiBase}/Product/${id}/restore`, {
        method: 'PATCH',
        headers: getHeaders()
      })

      // FIX 5: Reactive state update across array
      products.value = products.value.map((p) =>
        p.productId === id ? { ...p, isArchived: false } : p
      )

      return { success: true }
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to restore product'
      error.value = msg
      return { success: false, error: msg }
    } finally {
      pending.value = false
    }
  }

  return {
    products,
    pending,
    error,
    searchProducts,
    fetchProducts,
    createProduct,
    updateProduct,
    archiveProduct,
    restoreProduct,
    getArchievedProducts,
    refresh: fetchProducts
  }
}