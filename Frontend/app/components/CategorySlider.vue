<script setup lang="ts">
const categories = [
  {
    name:"Sweater",
    image:"https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400"
  },
  {
    name:"Shoes",
    image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
  },
  {
    name:"Hat",
    image:"https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400"
  },
  {
    name:"Gloves",
    image:"https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400"
  },
  {
    name:"Scarf",
    image:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400"
  }
]
</script>

<template>

<div class="flex gap-4 overflow-x-auto">

<div
  v-for="item in categories"
  :key="item.name"
  class="relative w-48 h-24 rounded-xl overflow-hidden flex-shrink-0">

  <img
  :src="item.image"
  class="w-full h-full object-cover"/>

  <div class="absolute inset-0 bg-black/40"/>

  <p class="absolute inset-0 flex items-center justify-center text-white font-semibold">
  {{ item.name }}
  </p>

</div>

</div>

</template>