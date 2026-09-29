import type { PaymentStatus } from './paymentStatus'

export interface Transaction {
  transactionId: number
  orderId: number
  paymentMethodId: number
  bankName: string
  amount: number
  paymentStatus: PaymentStatus
  transactionRef?: string | null
  paidAt?: string | null
}

export interface TransactionRequest {
  orderId: number
  paymentMethodId: number
}

export interface TransactionUpdateRequest {
  paymentStatus: PaymentStatus
  transactionRef?: string | null
}