import type { OrderResponse } from '~/types/order'
import { useAuth } from './useAuth'

export const useOrder = () => {
  const config = useRuntimeConfig()
  const { getToken } = useAuth()

  // ==========================================
  // AUTH HEADERS
  // ==========================================

  const getAuthHeaders = (): Record<string, string> => {
    const token = getToken()

    if (!token) {
      return {}
    }

    return {
      Authorization: `Bearer ${token}`
    }
  }


  // ==========================================
  // GET MY ORDERS - CURRENT USER ONLY
  // ==========================================

  const {
    data: orders,
    pending: ordersPending,
    error: ordersError,
    refresh: refreshOrders
  } = useFetch<OrderResponse[]>(
    `${config.public.apiBase}/orders`,
    {
      key: 'my-orders-list',
      server: false,
      headers: getAuthHeaders()
    }
  )


  // ==========================================
  // GET PENDING ORDERS - ADMIN
  // ==========================================
  // Keep this for admin pages.
  // This endpoint returns pending orders
  // from ALL users.

  const {
    data: pendingOrders,
    pending: pendingOrdersLoading,
    error: pendingOrdersError,
    refresh: refreshPendingOrders
  } = useFetch<OrderResponse[]>(
    `${config.public.apiBase}/orders/admin/pending`,
    {
      key: 'admin-pending-orders-list',
      server: false,
      headers: getAuthHeaders()
    }
  )


  // ==========================================
  // UPDATE ORDER STATUS - ADMIN
  // ==========================================

  const updateOrderStatus = async (
    orderId: number,
    status: number
  ) => {

    try {

      await $fetch(
        `${config.public.apiBase}/orders/${orderId}/status`,
        {
          method: 'PUT',

          headers: getAuthHeaders(),

          body: {
            status
          }
        }
      )


      // Refresh both lists
      await Promise.all([
        refreshOrders(),
        refreshPendingOrders()
      ])


      return {
        success: true
      }

    } catch (err: any) {

      console.error(
        'Update order status error:',
        err
      )

      return {
        success: false,

        error:
          err?.data?.message ||
          err?.message ||
          'Failed to update order status'
      }

    }

  }


  // ==========================================
  // RETURN
  // ==========================================

  return {

    // Current user's orders ONLY
    orders: computed(
      () => orders.value || []
    ),

    // Admin pending orders
    pendingOrders: computed(
      () => pendingOrders.value || []
    ),

    pendingOrdersCount: computed(
      () =>
        pendingOrders.value?.length || 0
    ),

    ordersPending,

    pendingOrdersLoading,

    ordersError,

    pendingOrdersError,

    // IMPORTANT:
    // This now refreshes CURRENT USER orders
    refresh: refreshOrders,

    refreshPendingOrders,

    updateOrderStatus

  }

}