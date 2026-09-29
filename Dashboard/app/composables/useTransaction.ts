import { ref } from 'vue'
import type {
  Transaction,
  TransactionUpdateRequest
} from '../types/transaction'

export function useTransaction() {
  const config = useRuntimeConfig()
  const { getToken } = useAuth()

  const transactions = ref<Transaction[]>([])
  const transaction = ref<Transaction | null>(null)

  const loading = ref(false)
  const error = ref<string | null>(null)

  // ======================================================
  // AUTH HEADERS
  // ======================================================

  const getHeaders = (): Record<string, string> => {
    const token = getToken()

    return token
      ? {
          Authorization: `Bearer ${token}`
        }
      : {}
  }


  // ======================================================
  // GET ALL TRANSACTIONS - ADMIN
  // ======================================================

  const getAllTransactions = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<Transaction[]>(
        `${config.public.apiBase}/transactions/admin`,
        {
          headers: getHeaders()
        }
      )

      transactions.value = response

      return response
    } catch (err: any) {
      error.value =
        err.data?.message ||
        'Failed to fetch transactions.'

      return null
    } finally {
      loading.value = false
    }
  }


  // ======================================================
  // GET TRANSACTION BY ID - ADMIN
  // ======================================================

  const getTransactionById = async (
    transactionId: number
  ) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<Transaction>(
        `${config.public.apiBase}/transactions/admin/${transactionId}`,
        {
          headers: getHeaders()
        }
      )

      transaction.value = response

      return response
    } catch (err: any) {
      error.value =
        err.data?.message ||
        'Failed to fetch transaction.'

      return null
    } finally {
      loading.value = false
    }
  }


  // ======================================================
  // GET MY TRANSACTIONS - CUSTOMER
  // ======================================================

  const getMyTransactions = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<Transaction[]>(
        `${config.public.apiBase}/transactions`,
        {
          headers: getHeaders()
        }
      )

      transactions.value = response

      return response
    } catch (err: any) {
      error.value =
        err.data?.message ||
        'Failed to fetch your transactions.'

      return null
    } finally {
      loading.value = false
    }
  }


  // ======================================================
  // GET MY TRANSACTION BY ID - CUSTOMER
  // ======================================================

  const getMyTransactionById = async (
    transactionId: number
  ) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<Transaction>(
        `${config.public.apiBase}/transactions/${transactionId}`,
        {
          headers: getHeaders()
        }
      )

      transaction.value = response

      return response
    } catch (err: any) {
      error.value =
        err.data?.message ||
        'Failed to fetch transaction.'

      return null
    } finally {
      loading.value = false
    }
  }


  // ======================================================
  // CREATE TRANSACTION - CUSTOMER
  // ======================================================

  const createTransaction = async (
    data: {
      orderId: number
      paymentMethodId: number
    }
  ) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<Transaction>(
        `${config.public.apiBase}/transactions`,
        {
          method: 'POST',
          headers: getHeaders(),
          body: data
        }
      )

      return response
    } catch (err: any) {
      error.value =
        err.data?.message ||
        'Failed to create transaction.'

      return null
    } finally {
      loading.value = false
    }
  }


  // ======================================================
  // ADMIN UPDATE PAYMENT
  // ======================================================

  const updatePayment = async (
    transactionId: number,
    data: TransactionUpdateRequest
  ) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<Transaction>(
        `${config.public.apiBase}/transactions/admin/${transactionId}/payment`,
        {
          method: 'PUT',
          headers: getHeaders(),
          body: data
        }
      )

      return response
    } catch (err: any) {
      error.value =
        err.data?.message ||
        'Failed to update payment status.'

      return null
    } finally {
      loading.value = false
    }
  }


  // ======================================================
  // RETURN
  // ======================================================

  return {
    transactions,
    transaction,
    loading,
    error,

    getAllTransactions,
    getTransactionById,

    getMyTransactions,
    getMyTransactionById,

    createTransaction,
    updatePayment
  }
}