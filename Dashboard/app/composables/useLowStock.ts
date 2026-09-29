import type { LowStockProduct } from '~/types/lowStock'

export const useLowStock = () => {

  const lowStockProducts = ref<LowStockProduct[]>([])
  const loading = ref(false)
  const error = ref('')

  const fetchLowStockProducts = async () => {

    loading.value = true
    error.value = ''

    try {

      const config = useRuntimeConfig()
      const token = localStorage.getItem('token')

      const response = await $fetch<LowStockProduct[]>(
        `${config.public.apiBase}/Product/low-stock`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      lowStockProducts.value = response

    } catch (err) {

      console.error('Failed to fetch low stock products:', err)

      error.value = 'Failed to load low stock products.'

    } finally {

      loading.value = false

    }

  }

  return {
    lowStockProducts,
    loading,
    error,
    fetchLowStockProducts
  }
}