<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Header from '~/layouts/Header.vue'
import AfterFooter from '~/layouts/AfterFooter.vue'
import { getProducts } from '~/services/productService'
import type { Product } from '~/types/product'
import { useScrollReveal } from '~/composable/useScrollReveal'

const products = ref<Product[]>([])
const loading = ref(true)
const { refresh: refreshReveal } = useScrollReveal({ threshold: 0.08, rootMargin: '0px 0px -10% 0px' })

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Mac', path: '/mac' },
  { name: 'iPad', path: '/ipad' },
  { name: 'iPhone', path: '/iphone' },
  { name: 'Accessories', path: '/accessories' }
]

onMounted(async () => {
  try {
    products.value = await getProducts()
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    loading.value = false
    await refreshReveal()
  }
})

const ITEMS = computed(() =>
  products.value.filter(p => (p.categoryName || '').toLowerCase() === 'ipad')
)
</script>

<template>
  <div class="min-h-screen bg-white font-sans text-gray-900 antialiased scroll-gutter">
    <Header :nav-items="navItems" />

    <section class="px-6 pb-16 pt-12 text-center">
      <div class="mx-auto max-w-4xl">
        <p class="reveal text-xs font-semibold text-gray-500">Apple iPad</p>
        <p class="reveal stagger-1 mt-1 text-sm font-medium text-gray-400">Touch, draw, and type on one magical device.</p>

        <h1 class="reveal stagger-2 mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Find the right <span class="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">iPad Pro</span> for you.
        </h1>

        <div class="reveal-scale stagger-3 mt-10 flex justify-center">
          <img
            src="https://www.ione.com.kh/wp-content/uploads/2023/11/iPad-Overview-Banner.png"
            alt="iPad Lineup"
            class="animate-float max-h-[360px] w-auto object-contain"
            @error="(e) => ((e.target as HTMLElement).style.display = 'none')"
          />
        </div>

        <p class="reveal stagger-4 mx-auto mt-8 max-w-2xl text-xs leading-relaxed text-gray-400 sm:text-sm">
          Discover the whole Apple iPad lineup at iOne and experience them firsthand in our premium stores.<br />
          We have been an Apple Authorized Reseller for two decades in Cambodia.<br />
          <span class="font-medium text-gray-500">iOne - The One You Trust!</span>
        </p>
      </div>
    </section>

    <section class="mx-auto max-w-6xl border-t border-gray-100 px-6 py-12">
      <div v-if="loading" class="flex flex-col gap-12">
        <div v-for="i in 3" :key="i" class="flex flex-col gap-8 rounded-3xl bg-gray-50 p-8 sm:flex-row sm:items-center">
          <div class="flex-1 space-y-4">
            <div class="h-4 w-12 rounded skeleton-shimmer"></div>
            <div class="h-8 w-3/4 rounded skeleton-shimmer"></div>
            <div class="h-4 w-1/2 rounded skeleton-shimmer"></div>
            <div class="h-10 w-32 rounded-full skeleton-shimmer"></div>
          </div>
          <div class="h-56 w-full rounded-2xl skeleton-shimmer sm:w-1/2"></div>
        </div>
      </div>

      <div v-else-if="ITEMS.length" class="flex flex-col divide-y divide-gray-100">
        <div
          v-for="(p, idx) in ITEMS"
          :key="p.productId"
          class="product-row group flex flex-col-reverse items-center justify-between gap-8 py-16 sm:flex-row sm:gap-12"
          :class="[`reveal`, `stagger-${Math.min(idx + 1, 10)}`]"
        >
          <div class="flex-1 text-center sm:text-left">
            <span class="inline-block rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
              NEW
            </span>

            <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {{ p.name }}
            </h2>

            <p class="mt-3 text-sm text-gray-500 sm:text-base">
              {{ p.description || "Lovable. Drawable. Magical. Unbelievably thin and insanely powerful." }}
            </p>

            <p class="mt-2 text-sm font-semibold text-gray-400">
              {{ p.price != null ? `From $${Number(p.price).toFixed(2)}` : 'Contact for pricing' }}
            </p>

            <div class="mt-6">
              <NuxtLink
                :to="`/products/${p.productId}?from=ipad`"
                class="btn-premium inline-flex items-center gap-2 rounded-full border border-blue-500 px-6 py-2.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                Learn more
                <svg class="row-arrow h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </NuxtLink>
            </div>
          </div>

          <div class="flex h-64 w-full flex-1 items-center justify-center p-4 sm:h-80">
            <NuxtLink :to="`/products/${p.productId}?from=ipad`" class="block">
              <img
                :src="p.image"
                :alt="p.name"
                class="product-row-img max-h-full max-w-full object-contain"
              />
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-else class="reveal py-16 text-center text-gray-500">
        No iPad products found in the backend.
      </div>
    </section>

    <AfterFooter />
  </div>
</template>

<style scoped>
.scroll-gutter {
  scrollbar-gutter: stable;
}
</style>
