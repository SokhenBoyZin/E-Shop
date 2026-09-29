import type { Category } from '~/types/product'
import { useAuth } from './useAuth'

export interface CategoryRequest {
  name: string
}

export const useCategory = () => {
  const config = useRuntimeConfig()
  const { getToken } = useAuth()

  const categories = useState<Category[]>('categories_list', () => [])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Helper for auth headers
  const getHeaders = (): Record<string, string> => {
    const token = getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // ==========================================
  // FETCH ACTIVE CATEGORIES
  // ==========================================
  const fetchCategories = async (): Promise<Category[]> => {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<Category[]>(
        `${config.public.apiBase}/Category`,
        {
          method: 'GET',
          headers: getHeaders()
        }
      )

      categories.value = data
      return data
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        'Failed to fetch categories'

      error.value = msg
      console.error('Error fetching categories:', err)

      return []
    } finally {
      isLoading.value = false
    }
  }

  // ==========================================
// RESTORE CATEGORY (ADMIN ONLY)
// ==========================================
const restoreCategory = async (id: number) => {
  isLoading.value = true
  error.value = null

  try {
    const res = await $fetch<{ message: string }>(
      `${config.public.apiBase}/Category/${id}/restore`,
      {
        method: 'PUT',
        headers: getHeaders()
      }
    )

    categories.value = categories.value.filter(
      c => c.categoryId !== id
    )

    return {
      success: true,
      message: res.message
    }
  } catch (err: any) {
    const msg =
      err?.data?.message ||
      'Failed to restore category'

    error.value = msg

    return {
      success: false,
      error: msg
    }
  } finally {
    isLoading.value = false
  }
}

  // ==========================================
  // FETCH ARCHIVED CATEGORIES
  // ==========================================
  const fetchArchivedCategories = async (): Promise<Category[]> => {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<Category[]>(
        `${config.public.apiBase}/Category/archived`,
        {
          method: 'GET',
          headers: getHeaders()
        }
      )

      categories.value = data
      return data
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        'Failed to fetch archived categories'

      error.value = msg
      console.error('Error fetching archived categories:', err)

      return []
    } finally {
      isLoading.value = false
    }
  }

  // ==========================================
  // GET CATEGORY BY ID
  // ==========================================
  const getCategoryById = async (
    id: number
  ): Promise<Category | null> => {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<Category>(
        `${config.public.apiBase}/Category/${id}`,
        {
          method: 'GET',
          headers: getHeaders()
        }
      )

      return data
    } catch (err: any) {
      error.value =
        err?.data?.message ||
        err?.message ||
        `Failed to fetch category ${id}`

      console.error(`Error fetching category ${id}:`, err)

      return null
    } finally {
      isLoading.value = false
    }
  }

  // ==========================================
  // CREATE CATEGORY
  // ==========================================
  const createCategory = async (
    payload: CategoryRequest
  ) => {
    isLoading.value = true
    error.value = null

    try {
      const data = await $fetch<Category>(
        `${config.public.apiBase}/Category`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: payload
        }
      )

      categories.value.push(data)

      return {
        success: true,
        data
      }
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        'Failed to create category'

      error.value = msg

      return {
        success: false,
        error: msg
      }
    } finally {
      isLoading.value = false
    }
  }

  // ==========================================
  // UPDATE CATEGORY
  // ==========================================
  const updateCategory = async (
    id: number,
    payload: CategoryRequest
  ) => {
    isLoading.value = true
    error.value = null

    try {
      const updatedCategory = await $fetch<Category>(
        `${config.public.apiBase}/Category/${id}`,
        {
          method: 'PUT',
          headers: getHeaders(),
          body: payload
        }
      )

      const index = categories.value.findIndex(
        c => c.categoryId === id
      )

      if (index !== -1) {
        categories.value[index] = updatedCategory
      }

      return {
        success: true,
        data: updatedCategory
      }
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        'Failed to update category'

      error.value = msg

      return {
        success: false,
        error: msg
      }
    } finally {
      isLoading.value = false
    }
  }

  // ==========================================
  // ARCHIVE CATEGORY
  // ==========================================
  const deleteCategory = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const res = await $fetch<{ message: string }>(
        `${config.public.apiBase}/Category/${id}`,
        {
          method: 'DELETE',
          headers: getHeaders()
        }
      )

      categories.value = categories.value.filter(
        c => c.categoryId !== id
      )

      return {
        success: true,
        message: res.message
      }
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        'Failed to archive category'

      error.value = msg

      return {
        success: false,
        error: msg
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
  categories,
  isLoading,
  error,
  fetchCategories,
  fetchArchivedCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory
}
}