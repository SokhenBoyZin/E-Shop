<template>
  <div class="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up">
    <div class="flex items-center justify-between mb-4 sm:mb-6">
      <h3 class="text-base sm:text-lg font-bold text-slate-800">Products Overview</h3>
      <button
        @click="() => refresh()"
        class="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer btn-cool px-2 py-1 rounded-lg hover:bg-indigo-50"
      >
        Refresh
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="pending" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-12 skeleton-shimmer rounded-xl"></div>
    </div>

    <!-- Error Message -->
    <div v-else-if="error" class="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <span>Failed to connect to backend: {{ error }}</span>
      <button @click="() => refresh()" class="px-3 py-1 text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all duration-250 btn-cool">
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!products.length" class="text-sm text-slate-400 py-4 text-center">
      No products available.
    </div>

    <!-- Products List -->
    <div v-else class="space-y-2 sm:space-y-3">
      <div
        v-for="(product, idx) in products"
        :key="product.productId"
        class="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all duration-250 hover:shadow-sm hover:translate-x-1 animate-fade-up"
        :class="`stagger-${Math.min(idx + 1, 10)}`"
      >
        <div class="flex items-center gap-3 min-w-0">
          <img
            :src="product.image || 'https://via.placeholder.com/40'"
            :alt="product.name"
            class="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0 transition-transform duration-300 hover:scale-110"
          />
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-800 line-clamp-1">{{ product.name }}</p>
            <p class="text-xs text-slate-400 font-medium truncate">
              {{ product.category?.name || 'Uncategorized' }} • {{ product.chipName }}
            </p>
          </div>
        </div>

        <div class="text-right shrink-0 pl-2">
          <span class="text-sm font-bold text-slate-900">
            ${{ getStartingPrice(product) }}
          </span>
          <p class="text-[10px] text-slate-400">
            {{ product.variants?.length || 0 }} Variant(s)
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/products'

const { products, pending, error, refresh } = useProduct()

onMounted(() => {
  refresh()
})

const getStartingPrice = (product: Product): number => {
  if (!product.variants || product.variants.length === 0) return 0
  const prices = product.variants.map((v) => v.price)
  return prices.length > 0 ? Math.min(...prices) : 0
}
</script>
