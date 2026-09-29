import type { 
  ProductVariantResponse, 
  ProductVariantRequest, 
  ApiResponse 
} from '~/types/productVaraint'

export const useProductVariant = () => {
  const config = useRuntimeConfig()
  const { getToken } = useAuth()

  const productVariants = ref<ProductVariantResponse[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Authorization header helper
  const getAuthHeaders = (): Record<string, string> => {
    const token = getToken()

    if (!token) {
      return {}
    }

    return {
      Authorization: `Bearer ${token}`
    }
  }

  // GET: Fetch all product variants
  const fetchProductVariants = async (): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<ProductVariantResponse[]>(`${config.public.apiBase}/ProductVariant`)
      productVariants.value = data
    } catch (err: any) {
      error.value = err?.data?.message || 'Failed to fetch product variants'
    } finally {
      loading.value = false
    }
  }

  // GET: Fetch single product variant by ID
  const getProductVariantById = async (id: number): Promise<ProductVariantResponse | null> => {
    loading.value = true
    error.value = null
    try {
      return await $fetch<ProductVariantResponse>(`${config.public.apiBase}/ProductVariant/${id}`)
    } catch (err: any) {
      error.value = err?.data?.message || 'Product variant not found'
      return null
    } finally {
      loading.value = false
    }
  }

  // POST: Create a new product variant (Admin only)
  const createProductVariant = async (payload: ProductVariantRequest): Promise<ProductVariantResponse | null> => {
    loading.value = true
    error.value = null
    try {
      const newVariant = await $fetch<ProductVariantResponse>(`${config.public.apiBase}/ProductVariant`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: payload
      })

      if (newVariant) {
        productVariants.value.push(newVariant)
      }
      return newVariant
    } catch (err: any) {
      error.value = err?.data?.message || 'Failed to create product variant'
      return null
    } finally {
      loading.value = false
    }
  }

  // PUT: Update product variant by ID (Admin only)
  const updateProductVariant = async (
    id: number,
    payload: ProductVariantRequest
  ): Promise<ProductVariantResponse | null> => {
    loading.value = true
    error.value = null
    try {
      const updatedVariant = await $fetch<ProductVariantResponse>(`${config.public.apiBase}/ProductVariant/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: payload
      })

      if (updatedVariant) {
        const index = productVariants.value.findIndex((v) => v.productVariantId === id)
        if (index !== -1) {
          productVariants.value[index] = updatedVariant
        }
      }

      return updatedVariant
    } catch (err: any) {
      error.value = err?.data?.message || 'Failed to update product variant'
      return null
    } finally {
      loading.value = false
    }
  }

  // DELETE: Delete product variant by ID (Admin only)
  const deleteProductVariant = async (id: number): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await $fetch<ApiResponse>(`${config.public.apiBase}/ProductVariant/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      productVariants.value = productVariants.value.filter((v) => v.productVariantId !== id)
      return true
    } catch (err: any) {
      error.value = err?.data?.message || 'Failed to delete product variant'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    productVariants,
    loading,
    error,
    fetchProductVariants,
    getProductVariantById,
    createProductVariant,
    updateProductVariant,
    deleteProductVariant
  }
}