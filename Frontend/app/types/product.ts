export interface ProductVariant {
  productVariantId: number
  price: number
  stockQuantity: number
  colorId?: number
  colorName?: string
  capacityId?: number
  capacityName?: string
  connectivityTypeId?: number
  connectivityTypeName?: string
  image?: string
}

export interface Product {
  productId: number
  name: string
  image?: string
  images?: string[]
  categoryName?: string
  description?: string
  price?: number
  chipName?: string
  cpuCores?: number | string
  gpuCores?: number | string
  ramGb?: number
  displayName?: string
  displayResolution?: string
  mainCameraMp?: number
  frontCameraMp?: number
  osVersion?: string
  isArchived?: boolean
  variants: ProductVariant[]
}

export interface Category {
  categoryId: number
  name: string
  isArchived: boolean
   productsCount: number
}