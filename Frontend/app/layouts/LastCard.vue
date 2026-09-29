<script setup lang="ts">
const cards = [
  {
    id: 1,
    image: 'https://i.pinimg.com/736x/f3/52/0e/f3520e2330f83dc497e10b89c7a60bc0.jpg',
    title: 'iOne Shopping',
    buttonText: 'iOne Shopping'
  },
  {
    id: 2,
    image: 'https://i.pinimg.com/736x/a7/30/9c/a7309ccb587387a75c6726c67e4a665c.jpg',
    title: 'iOne Installment',
    buttonText: 'Installment Plan'
  },
  {
    id: 3,
    image: 'https://i.pinimg.com/736x/4a/26/9a/4a269ae02d4304ae881698e0a1864b95.jpg',
    title: 'iOne Service',
    buttonText: 'Trade-In Service'
  }
]
</script>

<template>
  <div>
    <div class="text-center mx-auto my-12 max-w-4xl px-4 reveal">
      <p class="font-bold text-xl text-slate-600">Apple Authorized Reseller in Cambodia</p>
      <h1 class="text-purple-700 text-3xl md:text-5xl mt-6 font-bold tracking-tight">
        Visit our Phnom Penh Stores
      </h1>
      <div class="text-gray-400 text-lg md:text-xl mt-6 font-medium leading-relaxed">
        E-Shop operates two boutique Apple Reseller stores in Phnom Penh's premier AEON mega malls
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 max-w-6xl mx-auto">
      <div
        v-for="(card, idx) in cards"
        :key="card.id"
        class="group relative overflow-hidden rounded-2xl shadow-lg reveal-scale transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
        :class="`stagger-${idx + 1}`"
      >
        <div class="h-96 w-full overflow-hidden">
          <img
            :src="card.image"
            :alt="card.title"
            class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </div>

        <div
          class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"
        ></div>

        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 w-4/5">
          <button
            class="btn-premium w-full rounded-xl bg-white/95 py-3.5 px-4 font-semibold text-gray-900 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl active:scale-95"
          >
            {{ card.buttonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
