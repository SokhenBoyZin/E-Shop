<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 font-sans">
    <Header />

    <!-- =========================================
         MAIN
    ========================================== -->

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

      <!-- =========================================
           LOADING
      ========================================== -->

      <div
        v-if="pending"
        class="min-h-[65vh] flex flex-col items-center justify-center"
      >
        <div
          class="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"
        ></div>

        <p
          class="mt-5 text-sm font-semibold text-slate-500"
        >
          Fetching product details...
        </p>
      </div>


      <!-- =========================================
           ERROR
      ========================================== -->

      <div
        v-else-if="error || !product"
        class="max-w-xl mx-auto py-24"
      >
        <div
          class="bg-white border border-red-100 rounded-3xl p-10 text-center shadow-sm"
        >
          <div
            class="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto"
          >
            <svg
              class="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v4m0 4h.01M10.29 3.86l-7.4 12.82A2 2 0 004.63 20h14.74a2 2 0 001.74-3.32l-7.4-12.82a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>

          <h2
            class="mt-5 text-xl font-bold text-slate-900"
          >
            Product Unavailable
          </h2>

          <p
            class="mt-2 text-sm text-slate-500 leading-relaxed"
          >
            We couldn't load this product right now.
            Please try again later.
          </p>

          <button
            @click="navigateTo('/')"
            class="mt-7 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>


      <!-- =========================================
           PRODUCT
      ========================================== -->

      <div
        v-else
        class="space-y-8"
      >

        <!-- =======================================
             PRODUCT CARD
        ======================================== -->

        <section
          class="reveal-scale bg-white rounded-[28px] border border-slate-200/70 shadow-sm overflow-hidden"
        >

          <div
            class="grid grid-cols-1 lg:grid-cols-12"
          >

            <!-- =====================================
                 GALLERY
            ====================================== -->

            <div
              class="lg:col-span-7 p-5 sm:p-7 lg:p-10"
            >

              <div
                class="flex flex-col md:flex-row gap-5"
              >

                <!-- Thumbnails -->
                <div
                  v-if="productImages.length > 1"
                  class="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[520px] shrink-0 pb-1 md:pb-0"
                >

                  <button
                    v-for="(img, idx) in productImages"
                    :key="idx"
                    @click="activeImageIndex = idx"
                    class="w-[72px] h-[72px] rounded-2xl border flex items-center justify-center shrink-0 bg-white overflow-hidden transition-all"
                    :class="
                      activeImageIndex === idx
                        ? 'border-blue-600 ring-4 ring-blue-50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    "
                  >
                    <img
                      :src="img"
                      :alt="`${product.name} image ${idx + 1}`"
                      class="max-w-[85%] max-h-[85%] object-contain"
                    />
                  </button>

                </div>


                <!-- Main Image -->
                <div
                  class="order-1 md:order-2 flex-1"
                >

                  <div
                    class="relative h-[390px] sm:h-[460px] lg:h-[520px] rounded-[24px] bg-gradient-to-br from-slate-50 via-white to-blue-50/60 border border-slate-100 flex items-center justify-center overflow-hidden"
                  >

                    <!-- Decorative circles -->
                    <div
                      class="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-500/5"
                    ></div>

                    <div
                      class="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-indigo-500/5"
                    ></div>

                    <!-- Image -->
                    <Transition name="img-swap" mode="out-in">
                    <img
                      :key="activeImageIndex"
                      :src="
                        productImages[activeImageIndex] ||
                        product.image
                      "
                      :alt="product.name"
                      class="relative z-10 max-h-[330px] sm:max-h-[400px] lg:max-h-[450px] max-w-[90%] object-contain transition-transform duration-500 hover:scale-[1.04]"
                    />
                    </Transition>

                    <!-- Image counter -->
                    <div
                      v-if="productImages.length > 1"
                      class="absolute bottom-4 right-4 z-20 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur border border-slate-200 text-xs font-semibold text-slate-600 shadow-sm"
                    >
                      {{ activeImageIndex + 1 }}
                      /
                      {{ productImages.length }}
                    </div>

                  </div>

                </div>

              </div>

            </div>


            <!-- =====================================
                 PRODUCT INFO
            ====================================== -->

            <div
              class="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-100 p-6 sm:p-8 lg:p-10"
            >

              <div
                class="lg:sticky lg:top-24 space-y-7"
              >

                <!-- Badge -->
                <div>
                  <span
                    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full bg-blue-600"
                    ></span>

                    Original Product
                  </span>
                </div>


                <!-- Product name -->
                <div class="space-y-3">

                  <h1
                    class="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-slate-950"
                  >
                    {{ product.name }}
                  </h1>

                  <div
                    v-if="selectedVariant"
                    class="flex flex-wrap items-center gap-2"
                  >

                    <span
                      v-if="selectedVariant.capacityName"
                      class="text-sm font-medium text-slate-500"
                    >
                      {{ selectedVariant.capacityName }}
                    </span>

                    <span
                      v-if="
                        selectedVariant.capacityName &&
                        selectedVariant.colorName
                      "
                      class="text-slate-300"
                    >
                      •
                    </span>

                    <span
                      v-if="selectedVariant.colorName"
                      class="text-sm font-medium text-slate-500"
                    >
                      {{ selectedVariant.colorName }}
                    </span>

                  </div>

                </div>


                <!-- Price -->
                <div
                  class="rounded-2xl bg-slate-50 border border-slate-100 p-5"
                >

                  <p
                    class="text-xs font-bold uppercase tracking-widest text-slate-400"
                  >
                    Price
                  </p>

                  <div
                    class="flex items-end justify-between gap-4 mt-1"
                  >

                    <div
                      class="text-4xl font-black text-slate-950 tracking-tight"
                    >
                      <span class="text-xl font-bold">$</span>{{
                        selectedVariant?.price ??
                        product.price ??
                        "N/A"
                      }}
                    </div>

                    <!-- Stock -->
                    <div
                      v-if="selectedVariant"
                      class="text-right"
                    >

                      <div
                        v-if="
                          (selectedVariant.stockQuantity ?? 0) > 0
                        "
                        class="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-bold"
                      >
                        <span
                          class="w-2 h-2 rounded-full bg-emerald-500"
                        ></span>

                        In Stock
                      </div>

                      <div
                        v-else
                        class="inline-flex items-center gap-1.5 text-red-600 text-xs font-bold"
                      >
                        <span
                          class="w-2 h-2 rounded-full bg-red-500"
                        ></span>

                        Out of Stock
                      </div>

                      <p
                        v-if="
                          (selectedVariant.stockQuantity ?? 0) > 0
                        "
                        class="text-[11px] text-slate-400 mt-1"
                      >
                        {{ selectedVariant.stockQuantity }}
                        available
                      </p>

                    </div>

                  </div>

                </div>


                <!-- =================================
                     VARIANTS
                ================================== -->

                <div
                  v-if="
                    product.variants &&
                    product.variants.length > 0
                  "
                  class="space-y-6"
                >

                  <!-- Color -->
                  <div
                    v-if="availableColors.length"
                    class="space-y-3"
                  >

                    <div
                      class="flex items-center justify-between"
                    >

                      <label
                        class="text-sm font-bold text-slate-900"
                      >
                        Color
                      </label>

                      <span
                        class="text-xs font-medium text-slate-500"
                      >
                        {{ selectedVariant?.colorName }}
                      </span>

                    </div>

                    <div
                      class="flex flex-wrap gap-3"
                    >

                      <button
                        v-for="color in availableColors"
                        :key="color.id"
                        @click="
                          selectedColorId = color.id
                        "
                        class="group relative w-10 h-10 rounded-full p-1 transition-all"
                        :class="
                          selectedColorId === color.id
                            ? 'ring-2 ring-blue-600 ring-offset-2'
                            : 'hover:scale-105'
                        "
                        :title="color.name"
                      >

                        <span
                          class="block w-full h-full rounded-full border border-slate-300 shadow-inner"
                          :style="{
                            backgroundColor:
                              getColorHex(color.name)
                          }"
                        ></span>

                      </button>

                    </div>

                  </div>


                  <!-- Connectivity -->
                  <div
                    v-if="availableConnectivities.length"
                    class="space-y-3"
                  >

                    <label
                      class="text-sm font-bold text-slate-900"
                    >
                      Connectivity
                    </label>

                    <div
                      class="grid grid-cols-2 gap-2"
                    >

                      <button
                        v-for="c in availableConnectivities"
                        :key="c.id"
                        @click="
                          selectedConnectivityId = c.id
                        "
                        class="px-4 py-3 rounded-xl border text-sm font-semibold transition-all"
                        :class="
                          selectedConnectivityId === c.id
                            ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/30'
                        "
                      >
                        {{ c.name }}
                      </button>

                    </div>

                  </div>


                  <!-- Capacity -->
                  <div
                    v-if="availableCapacities.length"
                    class="space-y-3"
                  >

                    <label
                      class="text-sm font-bold text-slate-900"
                    >
                      Storage Capacity
                    </label>

                    <div
                      class="grid grid-cols-2 gap-2"
                    >

                      <button
                        v-for="cap in availableCapacities"
                        :key="cap.id"
                        @click="
                          selectedCapacityId = cap.id
                        "
                        class="px-4 py-3 rounded-xl border text-sm font-semibold transition-all"
                        :class="
                          selectedCapacityId === cap.id
                            ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        "
                      >
                        {{ cap.name }}
                      </button>

                    </div>

                  </div>

                </div>


                <!-- Divider -->
                <div
                  class="border-t border-slate-100"
                ></div>


                <!-- Add cart -->
                <button
                  @click="handleAddToCart"
                  :disabled="
                    Boolean(
                      product.variants?.length &&
                      (
                        !selectedVariant ||
                        selectedVariant.stockQuantity === 0
                      )
                    )
                  "
                  class="btn-premium w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 transition-all"
                  :class="justAdded ? 'added-pop btn-glow' : ''"
                >

                  <svg
                    v-if="!justAdded"
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 7h13L17 13M10 17h.01M14 17h.01"
                    />
                  </svg>
                  <svg
                    v-else
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>

                  {{ justAdded ? 'Added to Cart' : 'Add to Cart' }}

                </button>

              </div>

            </div>

          </div>

        </section>


        <!-- =========================================
             PRODUCT INFORMATION
        ========================================== -->

        <section
          class="reveal bg-white rounded-[28px] border border-slate-200/70 shadow-sm overflow-hidden"
        >

          <!-- Tabs -->
          <div
            class="border-b border-slate-100 px-6 sm:px-8 lg:px-10"
          >

            <div
              class="flex gap-8"
            >

              <button
                @click="activeTab = 'specs'"
                class="relative py-5 text-sm font-bold transition-colors"
                :class="
                  activeTab === 'specs'
                    ? 'text-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                "
              >
                Specifications

                <span
                  v-if="activeTab === 'specs'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                ></span>

              </button>


              <button
                @click="activeTab = 'about'"
                class="relative py-5 text-sm font-bold transition-colors"
                :class="
                  activeTab === 'about'
                    ? 'text-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                "
              >
                About Product

                <span
                  v-if="activeTab === 'about'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                ></span>

              </button>

            </div>

          </div>


          <!-- =======================================
               SPECS
          ======================================== -->

          <Transition name="tab-fade" mode="out-in">
          <div
            v-if="activeTab === 'specs'"
            key="specs"
            class="p-6 sm:p-8 lg:p-10"
          >

            <div
              class="grid grid-cols-1 md:grid-cols-2 gap-5"
            >

              <!-- Performance -->
              <div
                class="rounded-2xl border border-slate-100 bg-slate-50/60 p-6"
              >

                <div
                  class="flex items-center gap-3 mb-5"
                >

                  <div
                    class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3
                      class="font-bold text-slate-900"
                    >
                      Performance
                    </h3>

                    <p
                      class="text-xs text-slate-400"
                    >
                      Hardware & system
                    </p>
                  </div>

                </div>


                <div
                  class="divide-y divide-slate-200/70"
                >

                  <div
                    class="flex items-center justify-between gap-4 py-3"
                  >
                    <span
                      class="text-sm text-slate-500"
                    >
                      Chipset
                    </span>

                    <span
                      class="text-sm font-bold text-slate-900 text-right"
                    >
                      {{ product.chipName || "N/A" }}
                    </span>
                  </div>


                  <div
                    class="flex items-center justify-between gap-4 py-3"
                  >
                    <span
                      class="text-sm text-slate-500"
                    >
                      CPU Cores
                    </span>

                    <span
                      class="text-sm font-bold text-slate-900"
                    >
                      {{ product.cpuCores || "N/A" }}
                    </span>
                  </div>


                  <div
                    class="flex items-center justify-between gap-4 py-3"
                  >
                    <span
                      class="text-sm text-slate-500"
                    >
                      GPU Cores
                    </span>

                    <span
                      class="text-sm font-bold text-slate-900"
                    >
                      {{ product.gpuCores || "N/A" }}
                    </span>
                  </div>


                  <div
                    class="flex items-center justify-between gap-4 py-3"
                  >
                    <span
                      class="text-sm text-slate-500"
                    >
                      RAM
                    </span>

                    <span
                      class="text-sm font-bold text-slate-900"
                    >
                      {{
                        product.ramGb
                          ? `${product.ramGb} GB`
                          : "N/A"
                      }}
                    </span>
                  </div>


                  <div
                    class="flex items-center justify-between gap-4 py-3"
                  >
                    <span
                      class="text-sm text-slate-500"
                    >
                      Operating System
                    </span>

                    <span
                      class="text-sm font-bold text-slate-900 text-right"
                    >
                      {{ product.osVersion || "N/A" }}
                    </span>
                  </div>

                </div>

              </div>


              <!-- Display -->
              <div
                class="rounded-2xl border border-slate-100 bg-slate-50/60 p-6"
              >

                <div
                  class="flex items-center gap-3 mb-5"
                >

                  <div
                    class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>

                  <div>
                    <h3
                      class="font-bold text-slate-900"
                    >
                      Display & Camera
                    </h3>

                    <p
                      class="text-xs text-slate-400"
                    >
                      Visual specifications
                    </p>
                  </div>

                </div>


                <div
                  class="divide-y divide-slate-200/70"
                >

                  <div
                    class="flex items-center justify-between gap-4 py-3"
                  >
                    <span
                      class="text-sm text-slate-500"
                    >
                      Display Type
                    </span>

                    <span
                      class="text-sm font-bold text-slate-900 text-right"
                    >
                      {{ product.displayName || "N/A" }}
                    </span>
                  </div>


                  <div
                    class="flex items-center justify-between gap-4 py-3"
                  >
                    <span
                      class="text-sm text-slate-500"
                    >
                      Resolution
                    </span>

                    <span
                      class="text-sm font-bold text-slate-900 text-right"
                    >
                      {{
                        product.displayResolution ||
                        "N/A"
                      }}
                    </span>
                  </div>


                  <div
                    class="flex items-center justify-between gap-4 py-3"
                  >
                    <span
                      class="text-sm text-slate-500"
                    >
                      Main Camera
                    </span>

                    <span
                      class="text-sm font-bold text-slate-900"
                    >
                      {{
                        product.mainCameraMp
                          ? `${product.mainCameraMp} MP`
                          : "N/A"
                      }}
                    </span>
                  </div>


                  <div
                    class="flex items-center justify-between gap-4 py-3"
                  >
                    <span
                      class="text-sm text-slate-500"
                    >
                      Front Camera
                    </span>

                    <span
                      class="text-sm font-bold text-slate-900"
                    >
                      {{
                        product.frontCameraMp
                          ? `${product.frontCameraMp} MP`
                          : "N/A"
                      }}
                    </span>
                  </div>

                </div>

              </div>

            </div>

          </div>


          <!-- =======================================
               ABOUT
          ======================================== -->

          <div
            v-else
            key="about"
            class="p-6 sm:p-8 lg:p-10"
          >

            <div
              class="max-w-4xl"
            >

              <h3
                class="text-xl font-black text-slate-900"
              >
                Product Overview
              </h3>

              <p
                class="mt-4 text-sm sm:text-base text-slate-600 leading-8"
              >
                The
                <strong
                  class="text-slate-900"
                >
                  {{ product.name }}
                </strong>
                is powered by the
                <span
                  class="font-semibold text-blue-600"
                >
                  {{ product.chipName || "N/A" }}
                </span>
                chip, featuring
                <span
                  class="font-semibold text-blue-600"
                >
                  {{ product.cpuCores || "N/A" }}
                  CPU cores
                </span>
                and
                <span
                  class="font-semibold text-blue-600"
                >
                  {{ product.gpuCores || "N/A" }}
                  GPU cores
                </span>
                with
                <span
                  class="font-semibold text-blue-600"
                >
                  {{ product.ramGb || "N/A" }}GB
                </span>
                of memory running
                <span
                  class="font-semibold text-blue-600"
                >
                  {{ product.osVersion || "N/A" }}
                </span>.
              </p>

            </div>

          </div>
          </Transition>

        </section>

      </div>

    </main>


    <!-- Footer -->
    <AfterFooter />

  </div>
</template>


<script setup lang="ts">

import {
  ref,
  computed,
  watch
} from 'vue'

import { useRoute } from 'vue-router'

import { useCartStore } from '~/stores/cart'

import Header from '~/layouts/Header.vue'
import AfterFooter from '~/layouts/AfterFooter.vue'

import { getProduct } from '~/services/productService'

import type {
  Product,
  ProductVariant
} from '~/types/product'


/* =========================================
   ROUTE
========================================= */

const route = useRoute()

const productId =
  route.params.id


const fromCategory =
  (route.query.from as string) || ''


const getBackPath = () => {

  return !fromCategory ||
    fromCategory.toLowerCase() === 'home'
      ? '/'
      : `/${fromCategory.toLowerCase()}`

}


/* =========================================
   CART
========================================= */

const cartStore =
  useCartStore()


/* =========================================
   STATE
========================================= */

const activeTab =
  ref<'specs' | 'about'>('specs')

const justAdded =
  ref(false)

const activeImageIndex =
  ref(0)


const selectedColorId =
  ref<number | null>(null)


const selectedCapacityId =
  ref<number | null>(null)


const selectedConnectivityId =
  ref<number | null>(null)


const product =
  ref<Product | null>(null)


const pending =
  ref(true)


const error =
  ref<unknown>(null)


/* =========================================
   FETCH PRODUCT
========================================= */

try {

  product.value =
    await getProduct(
      productId as string
    )

  if (!product.value) {

    error.value =
      new Error(
        'Product not found'
      )

  }

} catch (e) {

  error.value = e

} finally {

  pending.value = false

}


/* =========================================
   AVAILABLE COLORS
========================================= */

const availableColors =
  computed(() => {

    if (!product.value?.variants) {
      return []
    }

    const map =
      new Map<
        number,
        {
          id: number
          name: string
        }
      >()

    product.value.variants.forEach(
      (v) => {

        if (
          v.colorId != null &&
          !map.has(v.colorId)
        ) {

          map.set(
            v.colorId,
            {
              id: v.colorId,
              name:
                v.colorName || ''
            }
          )

        }

      }
    )

    return Array.from(
      map.values()
    )

  })


/* =========================================
   AVAILABLE CAPACITIES
========================================= */

const availableCapacities =
  computed(() => {

    if (!product.value?.variants) {
      return []
    }

    const map =
      new Map<
        number,
        {
          id: number
          name: string
        }
      >()

    product.value.variants.forEach(
      (v) => {

        if (
          v.capacityId != null &&
          !map.has(v.capacityId)
        ) {

          map.set(
            v.capacityId,
            {
              id: v.capacityId,
              name:
                v.capacityName || ''
            }
          )

        }

      }
    )

    return Array.from(
      map.values()
    )

  })


/* =========================================
   AVAILABLE CONNECTIVITY
========================================= */

const availableConnectivities =
  computed(() => {

    const map =
      new Map<
        number,
        {
          id: number
          name: string
        }
      >()

    for (
      const v of
      product.value?.variants ?? []
    ) {

      if (
        v.connectivityTypeId != null &&
        !map.has(
          v.connectivityTypeId
        )
      ) {

        map.set(
          v.connectivityTypeId,
          {
            id:
              v.connectivityTypeId,
            name:
              v.connectivityTypeName || ''
          }
        )

      }

    }

    return Array.from(
      map.values()
    )

  })


/* =========================================
   SELECTED VARIANT
========================================= */

const selectedVariant =
  computed<ProductVariant | null>(
    () => {

      const variants =
        product.value?.variants ?? []

      if (!variants.length) {
        return null
      }

      return (
        variants.find(
          v =>
            (
              selectedColorId.value == null ||
              v.colorId ===
                selectedColorId.value
            ) &&
            (
              selectedCapacityId.value == null ||
              v.capacityId ===
                selectedCapacityId.value
            ) &&
            (
              selectedConnectivityId.value == null ||
              v.connectivityTypeId ===
                selectedConnectivityId.value
            )
        ) ||
        variants[0] ||
        null
      )

    }
  )


/* =========================================
   COLOR HEX
========================================= */

const getColorHex =
  (name: string) => {

    const lower =
      name.toLowerCase()

    if (
      lower.includes('black') ||
      lower.includes('space gray')
    ) {
      return '#1e293b'
    }

    if (
      lower.includes('white') ||
      lower.includes('silver')
    ) {
      return '#f8fafc'
    }

    if (
      lower.includes('natural') ||
      lower.includes('gold')
    ) {
      return '#d1d5db'
    }

    if (
      lower.includes('blue')
    ) {
      return '#2563eb'
    }

    if (
      lower.includes('red')
    ) {
      return '#dc2626'
    }

    if (
      lower.includes('green')
    ) {
      return '#16a34a'
    }

    if (
      lower.includes('purple')
    ) {
      return '#9333ea'
    }

    return '#94a3b8'

  }


/* =========================================
   PRODUCT IMAGES
========================================= */

const productImages =
  computed(() => {

    if (!product.value) {
      return []
    }


    if (
      product.value.images &&
      product.value.images.length > 0
    ) {

      return product.value.images

    }


    const variantImages =
      product.value.variants
        ?.map(
          v => v.image
        )
        .filter(
          (
            img
          ): img is string =>
            !!img
        ) || []


    if (
      variantImages.length > 0 &&
      product.value.image
    ) {

      return Array.from(
        new Set([
          product.value.image,
          ...variantImages
        ])
      )

    }


    return product.value.image
      ? [product.value.image]
      : []

  })


/* =========================================
   SYNC IMAGE WITH VARIANT
========================================= */

watch(
  selectedVariant,
  (newVariant) => {

    if (!newVariant?.image) {
      return
    }

    const index =
      productImages.value.indexOf(
        newVariant.image
      )

    if (index !== -1) {

      activeImageIndex.value =
        index

    }

  }
)


/* =========================================
   DEFAULT VARIANT
========================================= */

watch(
  product,
  (newProduct) => {

    if (
      !newProduct?.variants ||
      !newProduct.variants.length
    ) {
      return
    }

    const firstVariant =
      newProduct.variants[0]

    if (!firstVariant) {
      return
    }

    selectedColorId.value =
      firstVariant.colorId ?? null

    selectedCapacityId.value =
      firstVariant.capacityId ?? null

    selectedConnectivityId.value =
      firstVariant.connectivityTypeId ?? null

  },
  {
    immediate: true
  }
)

/* =========================================
   ADD TO CART
========================================= */

const handleAddToCart =
  () => {

    if (
      !product.value ||
      !selectedVariant.value ||
      selectedVariant.value.stockQuantity <= 0
    ) {
      return
    }


    const variant =
      selectedVariant.value


    const id =
      Number(
        product.value.productId
      )


    cartStore.addToCart({

      id:
        `${id}-${variant.productVariantId}`,

      productId:
        id,

      productVariantId:
        variant.productVariantId,

      name:
        product.value.name,

      title:
        product.value.name,

      price:
        Number(
          variant.price
        ),

      image:
        variant.image ||
        product.value.image ||
        '',

      color:
        variant.colorName || '',

      storage:
        variant.capacityName || '',

      connectivity:
        variant.connectivityTypeName || '',

      quantity:
        1

    })

    justAdded.value = true
    setTimeout(() => {
      justAdded.value = false
    }, 1600)

  }

</script>