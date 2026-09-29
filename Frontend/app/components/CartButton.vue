<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '~/stores/cart'
import type { Product, ProductVariant } from '~/types/product'

const props = defineProps<{ product: Product; variant?: ProductVariant | null }>()
const cartStore = useCartStore()
const added = ref(false)

const handleAddToCart = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  const v = props.variant || props.product.variants?.[0]
  if (!v?.productVariantId || v.stockQuantity <= 0) return
  cartStore.addToCart({
    id: `${props.product.productId}-${v.productVariantId}`,
    productId: props.product.productId,
    productVariantId: v.productVariantId,
    name: props.product.name,
    title: props.product.name,
    price: Number(v.price),
    image: v.image || props.product.image || '',
    color: v.colorName || '',
    storage: v.capacityName || '',
    connectivity: v.connectivityTypeName || '',
    quantity: 1
  })
  added.value = true
  setTimeout(() => { added.value = false }, 1400)
}
</script>

<template>
  <button
    @click="handleAddToCart"
    :disabled="!(variant || product.variants?.[0]) || Number((variant || product.variants?.[0])?.stockQuantity) <= 0"
    v-bind="$attrs"
    :class="added ? 'added-pop' : ''"
  >
    <slot v-if="!added">Add to Cart</slot>
    <span v-else class="inline-flex items-center gap-1.5">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M5 13l4 4L19 7" />
      </svg>
      Added
    </span>
  </button>
</template>
