<script setup lang="ts">
import type { Product } from '~/types/product'
defineProps<{ product: Product }>()
</script>

<template>
  <div
    class="product-card bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full"
  >
    <NuxtLink :to="`/products/${product.productId}`" class="block flex-1">
      <div class="relative overflow-hidden bg-slate-50/50">
        <img
          :src="product.image"
          :alt="product.name"
          class="product-img w-full h-64 object-contain p-4"
        />
        <span
          class="absolute top-3 left-3 bg-slate-900/90 text-white text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm"
        >
          {{ product.categoryName || 'PRODUCT' }}
        </span>
      </div>
      <div class="p-4 pb-2">
        <p class="text-[11px] uppercase tracking-widest text-gray-400 font-medium">
          {{ product.categoryName || 'Apple' }}
        </p>
        <h2 class="font-semibold text-lg mt-1 text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
          {{ product.name }}
        </h2>
        <p class="text-blue-600 text-xl font-bold mt-2">
          {{
            product.price != null
              ? `$${Number(product.price).toFixed(2)}`
              : 'View options'
          }}
        </p>
      </div>
    </NuxtLink>
    <div class="p-4 pt-1">
      <CartButton
        :product="product"
        class="btn-premium w-full bg-slate-900 hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
      />
    </div>
  </div>
</template>
