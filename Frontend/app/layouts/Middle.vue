<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isLoaded = ref(false)

onMounted(() => {
  isLoaded.value = true
})
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 sm:px-7 py-20">
    <div class="grid lg:grid-cols-2 gap-16 lg:gap-24">
      <!-- Sticky left copy -->
      <div class="sticky top-28 h-fit reveal-left">
        <p class="text-gray-500 font-semibold text-sm tracking-wide uppercase">
          Discover our services
        </p>

        <h1
          class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-indigo-500 mt-4 transition-all duration-700"
          :class="isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        >
          Enjoy your shopping<br />
          with our many<br />
          Etec services
        </h1>

        <p class="mt-8 text-gray-400 text-lg leading-relaxed max-w-md">
          Our installment and Trade-In packages, device insurance plans & free
          training sessions ensure the best experiences for our customers!
        </p>

        <button
          class="btn-premium mt-10 bg-slate-800 hover:bg-slate-900 text-white rounded-full px-8 py-4 font-medium shadow-lg shadow-slate-900/20"
        >
          Learn More
        </button>
      </div>

      <!-- Right service cards -->
      <div class="space-y-8">
        <!-- Card 1 -->
        <div
          class="reveal-right stagger-1 w-full bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-400 hover:shadow-2xl hover:-translate-y-1 group"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 items-center min-h-[280px]">
            <div class="p-8 sm:p-10 flex flex-col justify-center items-start">
              <h2 class="text-xl font-semibold text-gray-700 leading-snug tracking-tight">
                Benefit from our<br />
                worry-free<br />
                device insurance<br />
                plans.
              </h2>
              <button
                class="mt-6 bg-white border-2 border-gray-200 hover:border-indigo-400 hover:text-indigo-600 text-gray-500 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300"
              >
                Learn More
              </button>
            </div>
            <div
              class="bg-[#f4f5f7] h-full w-full flex items-center justify-center p-8 overflow-hidden"
            >
              <img
                src="https://www.ione.com.kh/wp-content/uploads/2025/07/ucb-card-cambodia.png"
                alt="Device insurance"
                class="w-full h-auto max-h-56 object-contain transition-transform duration-600 ease-out group-hover:scale-110"
              />
            </div>
          </div>
        </div>

        <!-- Card 2 -->
        <div
          class="reveal-right stagger-2 w-full bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-400 hover:shadow-2xl hover:-translate-y-1 group"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 items-center min-h-[280px]">
            <div class="p-8 sm:p-10 flex flex-col justify-center items-start">
              <h2 class="text-xl font-semibold text-gray-700 leading-snug tracking-tight">
                Easy Payment<br />
                installment to<br />
                own your Apple<br />
                devices right<br />
                away!
              </h2>
              <button
                class="mt-6 bg-white border-2 border-gray-200 hover:border-indigo-400 hover:text-indigo-600 text-gray-500 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300"
              >
                Learn More
              </button>
            </div>
            <div
              class="bg-[#f4f5f7] h-full w-full flex items-center justify-center p-8 overflow-hidden"
            >
              <img
                src="https://www.ione.com.kh/wp-content/uploads/2025/07/device-protection-plan.png"
                alt="Installment plans"
                class="w-full h-auto max-h-56 object-contain transition-transform duration-600 ease-out group-hover:scale-110"
              />
            </div>
          </div>
        </div>

        <!-- Card 3 -->
        <div
          class="reveal-right stagger-3 w-full bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-400 hover:shadow-2xl hover:-translate-y-1 group"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 items-center min-h-[280px]">
            <div
              class="bg-[#f4f5f7] h-full w-full flex items-center justify-center p-8 overflow-hidden order-2 md:order-1"
            >
              <img
                src="https://i.pinimg.com/1200x/13/4d/61/134d61a6d1d6946492aefb000914368f.jpg"
                alt="Apple Workshops"
                class="w-full h-auto max-h-56 object-contain transition-transform duration-600 ease-out group-hover:scale-110"
              />
            </div>
            <div
              class="p-8 sm:p-10 flex flex-col justify-center items-start order-1 md:order-2"
            >
              <h2 class="text-xl font-semibold text-gray-700 leading-snug tracking-tight">
                Join our free<br />
                Apple Workshops<br />
                & Quick Training<br />
                Sessions.
              </h2>
              <button
                class="mt-6 bg-white border-2 border-gray-200 hover:border-indigo-400 hover:text-indigo-600 text-gray-500 rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
