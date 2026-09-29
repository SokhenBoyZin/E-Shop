<!-- app/components/CartDrawer.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { useCartStore } from "~/stores/cart";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(["close"]);
const cartStore = useCartStore();
const cartItems = computed<any[]>(() =>
  Array.isArray(cartStore.items) ? cartStore.items : [],
);

const closeDrawer = () => {
  emit("close");
};

</script>

<template>
    <Transition name="cart-panel">
      <aside
        v-if="props.isOpen"
        class=" fixed sm:absolute left-1/2 sm:left-auto -translate-x-1/2 sm:translate-x-0 top-1/2 sm:top-full -translate-y-1/2 sm:translate-y-0 right-auto sm:right-0 mt-50 md:mt-3 lg:mt-3 xl:mt-3 z-[1001] w-[calc(100vw-2rem)] sm:w-[360px] max-w-[360px] sm:max-w-[calc(100vw-2rem)] max-h-[70vh] sm:max-h-[min(70vh,560px)] bg-white shadow-2xl flex flex-col border border-slate-100 rounded-2xl overflow-hidden " 
        role="dialog"
        aria-label="Shopping cart"
      >
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div class="flex items-center gap-2">
            <span class="text-base font-extrabold text-slate-800">Your Cart</span>
            <span class="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs shadow-blue-500/30">
              {{ cartStore.totalItems }}
            </span>
          </div>
          <button
            type="button"
            @click="closeDrawer"
            class="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-all leading-none"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div
            v-if="cartItems.length === 0"
            class="py-16 px-4 text-center space-y-3"
          >
            <div class="w-14 h-14 mx-auto rounded-full bg-blue-50 text-blue-500 flex items-center justify-center animate-scale-in">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-slate-500">Your cart is empty.</p>
          </div>

          <TransitionGroup name="cart-item" tag="div" class="space-y-2.5">
            <div
              v-for="(item, index) in cartItems"
              :key="item.id ?? item.productId ?? index"
              class="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:bg-slate-50/80 hover:shadow-sm transition-all"
            >
              <div class="w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 p-1 flex items-center justify-center shrink-0">
                <img
                  :src="item.image"
                  :alt="item.name || item.title"
                  class="max-w-full max-h-full object-contain"
                />
              </div>

              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-bold text-slate-800 truncate">
                  {{ item.name || item.title }}
                </h4>
                <p class="text-sm font-extrabold text-blue-600 mt-0.5">
                  ${{ item.price }}
                </p>
              </div>

              <div class="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-sm shadow-xs">
                <button
                  type="button"
                  @click="cartStore.decreaseQuantity(item.id ?? item.productId)"
                  class="w-6 h-6 flex items-center justify-center text-slate-500 font-bold hover:text-blue-600 hover:bg-blue-50 rounded transition-all active:scale-90"
                >
                  -
                </button>
                <span class="font-bold text-slate-800 px-1 min-w-5 text-center">{{ item.quantity || 1 }}</span>
                <button
                  type="button"
                  @click="cartStore.increaseQuantity(item.id ?? item.productId)"
                  class="w-6 h-6 flex items-center justify-center text-slate-500 font-bold hover:text-blue-600 hover:bg-blue-50 rounded transition-all active:scale-90"
                >
                  +
                </button>
              </div>
            </div>
          </TransitionGroup>
        </div>

        <div
          v-if="cartItems.length > 0"
          class="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3"
        >
          <div class="flex justify-between items-center text-sm font-bold text-slate-800 px-1">
            <span class="text-slate-500 font-medium">Subtotal</span>
            <span class="text-lg font-black text-blue-600">${{ cartStore.totalPrice }}</span>
          </div>

          <NuxtLink
            to="/checkout"
            @click="closeDrawer()"
            class="btn-premium flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold py-3.5 rounded-xl shadow-md shadow-blue-500/20 text-center"
          >
            <span>Proceed to Checkout</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </NuxtLink>
        </div>
      </aside>
    </Transition>
</template>
