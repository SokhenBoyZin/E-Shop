<!-- app/components/CartIcon.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCartStore } from '~/stores/cart'

const cartStore = useCartStore()
const isDrawerOpen = ref(false)
const bounce = ref(false)

watch(
  () => cartStore.totalItems,
  (next, prev) => {
    if (next > (prev ?? 0)) {
      bounce.value = false
      requestAnimationFrame(() => {
        bounce.value = true
        setTimeout(() => { bounce.value = false }, 500)
      })
    }
  }
)
</script>

<template>
  <div class="relative">
    <button
      type="button"
      @click="isDrawerOpen = true"
      aria-label="View Shopping Cart"
      class="relative inline-flex items-center justify-center p-2.5 rounded-full text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 active:scale-95 transition-all duration-200 focus:outline-none"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300"
        :class="bounce ? 'cart-badge-bounce' : ''"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.8"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>

      <span
        v-if="cartStore.totalItems > 0"
        class="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-black min-w-5 h-5 px-1 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm shadow-blue-500/30"
        :class="bounce ? 'cart-badge-bounce' : ''"
      >
        {{ cartStore.totalItems > 99 ? '99+' : cartStore.totalItems }}
      </span>
    </button>

    <CartDrawer :is-open="isDrawerOpen" @close="isDrawerOpen = false" />
  </div>
</template>
