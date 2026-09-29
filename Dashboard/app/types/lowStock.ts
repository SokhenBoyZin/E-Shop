export interface LowStockProduct {
  productVariantId: number
  productId: number
  productName: string
  image?: string | null
  stockQuantity: number
  price: number
  color?: string | null
  capacity?: string | null
  connectivityType?: string | null
}