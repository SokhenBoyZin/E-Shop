<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { ref, onMounted, watch } from "vue";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import AppleAccess from "~/layouts/AppleAccess.vue";
import Middle from "~/layouts/Middle.vue";
import LastCard from "~/layouts/LastCard.vue";
import AfterFooter from "~/layouts/AfterFooter.vue";
import Header from "~/layouts/Header.vue";

import { useScrollReveal } from "~/composable/useScrollReveal";

const activeNav = ref("Mac");

const config = useRuntimeConfig();

interface ProductVariant {
  price: number;
  stockQuantity: number;
}

interface ProductItem {
  productId: number;
  name: string;
  image: string;
  chipName: string;
  cpuCores: number;
  gpuCores: number;
  ramGb: number;
  displayName: string;
  displayResolution: string;
  mainCameraMp: number;
  frontCameraMp: number;
  osVersion: string;
  isArchived: boolean;
  variants?: ProductVariant[];
}

const Products = ref<ProductItem[]>([]);
const loading = ref(true);

const { refresh } = useScrollReveal();

const fetchProducts = async () => {
  try {
    loading.value = true;

    const response = await $fetch<ProductItem[]>(
      `${config.public.apiBase}/Product`
    );

    Products.value = response
      .filter((product) => !product.isArchived)
      .slice(0, 4);
  } catch (error) {
    console.error("Failed to fetch products:", error);
  } finally {
    loading.value = false;
  }
};

const getProductPrice = (product: ProductItem) => {
  if (!product.variants || product.variants.length === 0) {
    return "Price unavailable";
  }

  const prices = product.variants.map((v) => v.price);
  const lowestPrice = Math.min(...prices);

  return `$${lowestPrice.toFixed(2)}`;
};

onMounted(() => {
  fetchProducts();
});

watch(loading, (val) => {
  if (!val) {
    // Re-observe newly rendered product cards
    setTimeout(() => refresh(), 80);
  }
});

const banners = [
  "https://mir-s3-cdn-cf.behance.net/project_modules/max_3840_webp/34b5bf180145769.6505ae7623131.jpg",
  "https://news.macgasm.net/wp-content/uploads/2023/09/iphone-15-release.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjMPEqI1ybMxZiHNjL3oZDJjLR8vqZBgUOmCzmv6DEotLG2Y-GvFM17xio&s=10",
  "https://www.ione.com.kh/wp-content/uploads/2025/07/ipad-pro-hero-cambodia.png",
];

const navItems = [
  { name: "Home", path: "/" },
  { name: "Mac", path: "/mac" },
  { name: "IPad", path: "/ipad" },
  { name: "IPhone", path: "/iphone" },
  { name: "Accessories", path: "/accessories" },
  { name: "Service", path: "/service" },
  { name: "Offers", path: "/offers" },
  { name: "Stores", path: "/stores" },
];
</script>

<template>
  <Header :nav-items="navItems" />

  <!-- Hero Banner -->
  <section class="mx-auto pt-28 pb-8 px-4 sm:px-8 md:px-6 lg:px-8 xl:px-48 max-w-[1600px]">
    <div class="reveal rounded-2xl overflow-hidden shadow-xl shadow-black/5">
      <Swiper
        :modules="[Autoplay, Pagination, EffectFade]"
        :slides-per-view="1"
        :loop="true"
        :effect="'fade'"
        :fade-effect="{ crossFade: true }"
        :autoplay="{
          delay: 4200,
          disableOnInteraction: false,
        }"
        :pagination="{
          clickable: true,
        }"
        class="banner-swiper rounded-2xl overflow-hidden"
      >
        <SwiperSlide
          v-for="(item, index) in banners"
          :key="index"
          class="banner-slide"
        >
          <img
            :src="item"
            class="w-full h-[280px] sm:h-[380px] lg:h-[460px] object-cover"
            alt="Banner"
          />
        </SwiperSlide>
      </Swiper>
    </div>
  </section>

  <!-- Latest Products -->
  <section class="max-w-7xl mx-auto px-4 sm:px-7 py-16">
    <div class="flex items-end justify-center mb-16 reveal">
      <h1 class="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
        Explore the latest Apple products.
      </h1>
    </div>

    <!-- Loading skeletons -->
    <div
      v-if="loading"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="h-80 rounded-2xl skeleton-shimmer"
      ></div>
    </div>

    <!-- Product grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <NuxtLink
        v-for="(pro, idx) in Products"
        :key="pro.productId"
        :to="`/products/${pro.productId}`"
        class="product-card reveal bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between cursor-pointer group"
        :class="`stagger-${Math.min(idx + 1, 8)}`"
      >
        <div class="p-5">
          <div class="h-36 flex items-center justify-center mb-5 overflow-hidden">
            <img
              :src="pro.image"
              :alt="pro.name"
              class="product-img max-h-full max-w-[85%] object-contain"
            />
          </div>

          <h2
            class="text-lg font-semibold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors duration-300"
          >
            {{ pro.name }}
          </h2>

          <p class="text-slate-400 font-medium mt-2 text-sm">
            {{ getProductPrice(pro) }}
          </p>
        </div>

        <div
          class="bg-slate-50/80 border-t border-slate-100 px-5 py-3.5 flex justify-end items-center"
        >
          <div
            class="text-slate-700 group-hover:text-blue-600 font-medium text-xs flex items-center gap-1.5 transition-colors duration-300"
          >
            <span>Learn More</span>
            <i
              class="pi pi-angle-right text-sm learn-more-arrow text-slate-500 group-hover:text-blue-600"
            ></i>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div
      v-if="!loading && Products.length === 0"
      class="text-center py-16 text-slate-400 reveal"
    >
      No products available.
    </div>
  </section>

  <!-- Accessories -->
  <section class="reveal">
    <p class="font-bold text-3xl sm:text-4xl my-16 text-center text-slate-800 tracking-tight">
      Our featured Apple accessories
    </p>
    <AppleAccess />
  </section>

  <section class="reveal">
    <Middle />
  </section>

  <section class="pb-16 reveal">
    <LastCard />
  </section>

  <section class="reveal">
    <AfterFooter />
  </section>
</template>
