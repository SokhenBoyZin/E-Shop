export interface ProductVariantResponse {
  productVariantId: number
  price: number
  stockQuantity: number
  colorId: number
  colorName: string
  capacityId: number
  capacityName: string
  connectivityTypeId: number
  connectivityTypeName: string
}

export interface ProductVariantRequest {
  productId: number
  price: number
  stockQuantity: number
  colorId: number
  capacityId: number
  connectivityTypeId: number
}

export interface ApiResponse {
  message: string
}