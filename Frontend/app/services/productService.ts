import type { Product, ProductVariant } from '~/types/product'

const normalizeImage = (value: unknown, apiBase: string): string => {
  if (!value) return ''
  const image = String(value)
  if (/^https?:\/\//i.test(image) || image.startsWith('data:') || image.startsWith('blob:')) return image
  const origin = apiBase.replace(/\/api\/?$/, '')
  return `${origin}/${image.replace(/^\//, '')}`
}

const normalizeVariant = (raw: any, apiBase: string): ProductVariant => ({
  productVariantId: Number(raw?.productVariantId ?? raw?.id ?? 0),
  price: Number(raw?.price ?? 0),
  stockQuantity: Number(raw?.stockQuantity ?? 0),
  colorId: raw?.colorId == null ? undefined : Number(raw.colorId),
  colorName: raw?.colorName ?? raw?.color?.name ?? '',
  capacityId: raw?.capacityId == null ? undefined : Number(raw.capacityId),
  capacityName: raw?.capacityName ?? raw?.capacity?.sizeLabel ?? raw?.capacity?.name ?? '',
  connectivityTypeId: raw?.connectivityTypeId == null ? undefined : Number(raw.connectivityTypeId),
  connectivityTypeName: raw?.connectivityTypeName ?? raw?.connectivityType?.name ?? '',
  image: normalizeImage(raw?.image, apiBase),
})

export const normalizeProduct = (raw: any, apiBase: string): Product => {
  const variants = Array.isArray(raw?.variants) ? raw.variants.map((v:any)=>normalizeVariant(v,apiBase)) : []
  const categoryName = raw?.categoryName ?? raw?.category?.name ?? raw?.category ?? ''
  const image = normalizeImage(raw?.image, apiBase)
  const images = Array.isArray(raw?.images) ? raw.images.map((x:any)=>normalizeImage(x,apiBase)).filter(Boolean) : []
  return { productId:Number(raw?.productId ?? raw?.id ?? 0), name:String(raw?.name ?? ''), image, images:images.length?images:(image?[image]:[]), categoryName:String(categoryName), description:raw?.description ?? raw?.subtitle ?? '', price:raw?.price==null?variants[0]?.price:Number(raw.price), chipName:raw?.chipName, cpuCores:raw?.cpuCores, gpuCores:raw?.gpuCores, ramGb:raw?.ramGb, displayName:raw?.displayName, displayResolution:raw?.displayResolution, mainCameraMp:raw?.mainCameraMp, frontCameraMp:raw?.frontCameraMp, osVersion:raw?.osVersion, isArchived:Boolean(raw?.isArchived), variants }
}

export async function getProducts(): Promise<Product[]> {
  const config=useRuntimeConfig(); const apiBase=String(config.public.apiBase)
  try { const data=await $fetch<any[]>(`${apiBase}/Product`); return Array.isArray(data)?data.map(x=>normalizeProduct(x,apiBase)).filter(x=>!x.isArchived):[] }
  catch(error){ console.error('Error fetching products:',error); return [] }
}

export async function getProduct(productId:number|string): Promise<Product|null> {
  const config=useRuntimeConfig(); const apiBase=String(config.public.apiBase)
  try { const data=await $fetch<any>(`${apiBase}/Product/${productId}`); const p=normalizeProduct(data,apiBase); return p.isArchived?null:p }
  catch(error){ console.error(`Error fetching product ${productId}:`,error); return null }
}
