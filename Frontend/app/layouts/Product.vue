<template>
  <div class="product-container" v-if="product">
    <!-- Product Header -->
    <div class="product-header">
      <img :src="product.image" :alt="product.name" class="product-image" />
      <div class="product-main-info">
        <h1>{{ product.name }}</h1>
        <p class="category">{{ product.categoryName }}</p>
        <p class="os">{{ product.osVersion }}</p>
      </div>
    </div>

    <!-- Technical Specifications -->
    <div class="specs-grid">
      <div><strong>Chip:</strong> {{ product.chipName }}</div>
      <div><strong>RAM:</strong> {{ product.ramGb }} GB</div>
      <div><strong>Display:</strong> {{ product.displayName }} ({{ product.displayResolution }})</div>
      <div><strong>Cameras:</strong> {{ product.mainCameraMp }}MP Rear / {{ product.frontCameraMp }}MP Front</div>
    </div>

    <!-- Product Variants (Price & Options) -->
    <div class="variants-section">
      <h3>Available Options</h3>
      <div class="variant-cards">
        <div 
          v-for="variant in product.variants" 
          :key="variant.productVariantId" 
          class="variant-card"
        >
          <span class="color-badge" :style="{ backgroundColor: variant.colorName }"></span>
          <span>{{ variant.capacityName }} - {{ variant.colorName }}</span>
          <strong>${{ variant.price }}</strong>
          <small>In Stock: {{ variant.stockQuantity }}</small>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="loading">Loading product details...</div>
  <div v-else-if="errorMessage" class="error">{{ errorMessage }}</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const product = ref(null)
const loading = ref(true)
const errorMessage = ref('')

const fetchProduct = async () => {
  try {
    const response = await fetch('https://localhost:7234/api/Product/1')
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`)
    
    product.value = await response.json()
  } catch (error) {
    errorMessage.value = 'Failed to load product data.'
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProduct()
})
</script>

<style scoped>
.product-container { max-width: 800px; margin: 0 auto; padding: 20px; font-family: sans-serif; }
.product-header { display: flex; gap: 20px; align-items: center; }
.product-image { width: 200px; height: auto; border-radius: 8px; }
.specs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 6px; }
.variant-cards { display: flex; gap: 15px; flex-wrap: wrap; margin-top: 10px; }
.variant-card { border: 1px solid #ccc; padding: 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 4px; min-width: 140px; }
.error { color: red; }
</style>