import type { OrderResponse } from '~/types/order'

export const useOrderProfile = () => {
  const config = useRuntimeConfig()
  const { getToken } = useAuth()

  const orders = useState<OrderResponse[]>(
    'profile_orders',
    () => []
  )

  const pending = useState<boolean>(
    'profile_orders_pending',
    () => false
  )

  const error = useState<string | null>(
    'profile_orders_error',
    () => null
  )

  const getAuthHeaders = (): Record<string, string> => {
    const token = getToken()

    if (!token) {
      return {}
    }

    return {
      Authorization: `Bearer ${token}`
    }
  }

  // ============================================
  // FETCH CURRENT USER ORDERS
  // GET /orders
  // ============================================

  const fetchOrders = async () => {
    pending.value = true
    error.value = null

    try {
      const response = await $fetch<OrderResponse[]>(
        `${config.public.apiBase}/orders`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      )

      orders.value = response || []

      return {
        success: true,
        data: orders.value
      }
    } catch (err: any) {
      console.error(
        'Failed to fetch profile orders:',
        err
      )

      const message =
        err?.data?.message ||
        err?.message ||
        'Failed to fetch orders.'

      error.value = message
      orders.value = []

      return {
        success: false,
        error: message
      }
    } finally {
      pending.value = false
    }
  }

  // ============================================
  // CLEAR ORDERS
  // ============================================

  const clearOrders = () => {
    orders.value = []
    error.value = null
  }

  return {
    orders,
    pending,
    error,
    fetchOrders,
    clearOrders
  }
}
