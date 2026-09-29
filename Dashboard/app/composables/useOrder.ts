import { computed } from 'vue'
import type { OrderResponse } from '~/types/order'

export const useOrder = () => {
  const config = useRuntimeConfig()
  const { getToken } = useAuth()

  // ============================================
  // AUTH HEADERS
  // ============================================

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
  // CUSTOMER ORDERS
  // GET /orders
  // Returns only the logged-in user's orders
  // ============================================

  const {
    data: myOrdersData,
    pending: myOrdersPending,
    error: myOrdersError,
    refresh: refreshMyOrders
  } = useFetch<OrderResponse[]>(
    `${config.public.apiBase}/orders`,
    {
      key: 'my-orders-list',
      server: false,
      headers: getAuthHeaders()
    }
  )

  // ============================================
  // ADMIN ORDERS
  // GET /orders/admin
  // Returns ALL users' orders
  // ============================================

  const {
    data: adminOrdersData,
    pending: adminOrdersPending,
    error: adminOrdersError,
    refresh: refreshAdminOrders
  } = useFetch<OrderResponse[]>(
    `${config.public.apiBase}/orders/admin`,
    {
      key: 'admin-orders-list',
      server: false,
      headers: getAuthHeaders()
    }
  )

  // ============================================
  // ADMIN PENDING ORDERS
  // GET /orders/admin/pending
  // Returns pending orders for admin dashboard
  // ============================================

  const {
    data: pendingOrdersData,
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

  // ============================================
  // UPDATE ORDER STATUS
  // PUT /orders/{orderId}/status
  // ============================================

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

      // Refresh all order lists
      await Promise.all([
        refreshMyOrders(),
        refreshAdminOrders(),
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

  // ============================================
  // RETURN
  // ============================================

  return {
    // ------------------------------------------
    // CUSTOMER
    // ------------------------------------------

    myOrders: computed(
      () => myOrdersData.value || []
    ),

    myOrdersPending,

    myOrdersError,

    refreshMyOrders,

    // ------------------------------------------
    // ADMIN - ALL ORDERS
    // ------------------------------------------

    orders: computed(
      () => adminOrdersData.value || []
    ),

    ordersPending: adminOrdersPending,

    ordersError: adminOrdersError,

    refreshOrders: refreshAdminOrders,

    // ------------------------------------------
    // ADMIN - PENDING ORDERS
    // ------------------------------------------

    pendingOrders: computed(
      () => pendingOrdersData.value || []
    ),

    pendingOrdersCount: computed(
      () => pendingOrdersData.value?.length || 0
    ),

    pendingOrdersLoading,

    pendingOrdersError,

    refreshPendingOrders,

    // ------------------------------------------
    // ACTIONS
    // ------------------------------------------

    updateOrderStatus
  }
}

