export interface ProductVariant {
  productVariantId: number
  price: number
  stockQuantity: number
  colorId: number
  capacityId: number
  connectivityTypeId: number

  color?: {
    colorId: number
    name: string
  }

  capacity?: {
    capacityId: number
    sizeLabel: string
  }

  connectivityType?: {
    connectivityTypeId: number
    name: string
  }
}

export interface Category {
  categoryId: number
  name: string
  isArchived: boolean
   productsCount: number
}

export interface Product {
  productId: number
  name: string
  image: string
  chipName: string
  cpuCores: string
  gpuCores: string
  ramGb: number
  displayName: string
  displayResolution: string
  mainCameraMp: number
  frontCameraMp: number
  osVersion: string
  isArchived: boolean

  categoryId: number
  category?: Category

  variants: ProductVariant[]
}