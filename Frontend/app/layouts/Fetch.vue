<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Products</h1>

    <div v-if="pending">Loading products...</div>
    <div v-else-if="error" class="text-red-500">
      Error loading products: {{ error.message }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div 
        v-for="product in products" 
        :key="product.productId" 
        class="border rounded-lg p-4 shadow"
      >
        <img 
          :src="product.image" 
          :alt="product.name" 
          class="w-full h-48 object-cover rounded mb-2" 
        />
        <h2 class="text-xl font-semibold">{{ product.name }}</h2>
        <p class="text-gray-600">{{ product.chipName }} ({{ product.ramGb }}GB RAM)</p>
        <p class="text-sm text-gray-500">{{ product.displayName }}</p>
        <p class="text-sm text-gray-500">Camera: {{ product.mainCameraMp }} MP</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getProducts } from '~/services/productService'
import type { Product } from '~/types/product'
const products=ref<Product[]>([]); const pending=ref(true); const error=ref<any>(null)
onMounted(async()=>{try{products.value=await getProducts()}catch(e){error.value=e}finally{pending.value=false}})
</script>