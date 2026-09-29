
<script setup lang="ts">
import { ref, onMounted, computed } from "vue"

type Product = {
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
    categoryId: number
    categoryName: string
    variants: any[]
}

const products = ref<Product[]>([])
const isLoading = ref(true)
const error = ref("")

// ============================================
// FETCH PRODUCTS
// ============================================

const fetchProducts = async () => {
    try {
        isLoading.value = true
        error.value = ""

        const response = await $fetch<Product[]>(
            "https://localhost:7234/api/Product"
        )

        products.value = response

        console.log("All products:", products.value)
    } catch (err) {
        console.error("Failed to fetch products:", err)
        error.value = "Failed to load products."
    } finally {
        isLoading.value = false
    }
}

// ============================================
// FILTER ACCESSORIES
// ============================================

const accessoriesProducts = computed(() => {
    return products.value.filter(
        product =>
            product.categoryName?.trim().toLowerCase() === "accessories"
    )
})

// ============================================
// LOAD ON MOUNT
// ============================================

onMounted(() => {
    fetchProducts()
})
</script>

<template>
    <section class="max-w-7xl mx-auto px-4 sm:px-7 pb-8">

        <!-- LOADING -->
        <div
            v-if="isLoading"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
            <div
                v-for="i in 4"
                :key="i"
                class="bg-white rounded-xl shadow-md p-6 animate-pulse flex flex-col justify-between h-[360px]"
            >
                <div class="h-48 bg-slate-100 rounded-lg"></div>

                <div class="space-y-2 mt-4">
                    <div class="h-4 bg-slate-100 rounded w-5/6"></div>
                    <div class="h-4 bg-slate-100 rounded w-1/2"></div>
                </div>
            </div>
        </div>

        <!-- ERROR -->
        <div
            v-else-if="error"
            class="text-center py-12 text-red-500 font-medium"
        >
            {{ error }}
        </div>

        <!-- ACCESSORIES PRODUCTS -->
        <div
            v-else-if="accessoriesProducts.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
            <!-- ONLY LOOP ACCESSORIES -->
            <NuxtLink
                v-for="product in accessoriesProducts"
                :key="product.productId"
                :to="`/products/${product.productId}`"
                class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between group cursor-pointer border border-gray-50 hover:-translate-y-1"
            >
                <!-- PRODUCT IMAGE -->
                <div
                    class="w-full h-52 flex items-center justify-center p-2 mb-4"
                >
                    <img
                        :src="product.image"
                        :alt="product.name"
                        class="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                </div>

                <!-- PRODUCT INFO -->
                <div class="flex items-end justify-between gap-2 pt-2">
                    <h3
                        class="font-bold text-gray-800 text-lg leading-snug line-clamp-2"
                    >
                        {{ product.name }}
                    </h3>

                    <svg
                        class="w-4 h-4 text-gray-400 shrink-0 mb-1 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-gray-800"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.5"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </div>
            </NuxtLink>
        </div>

        <!-- NO ACCESSORIES -->
        <div
            v-else
            class="text-center py-12 text-slate-500"
        >
            No accessories products found.
        </div>

    </section>
</template>
