<template>
  <aside
    class="w-64 sm:w-72 bg-white border-r border-slate-100 flex flex-col justify-between h-screen sticky top-0 px-3 sm:px-4 py-5 sm:py-6 select-none shrink-0 shadow-xl lg:shadow-none"
  >
    <div>
      <!-- Logo + close (mobile) -->
      <div class="flex items-center justify-between mb-5 sm:mb-6 shrink-0">
        <NuxtLink to="/" class="flex items-center gap-3 group" @click="$emit('close')">
          <img
            src="/images/eshop.png"
            class="h-12 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            alt="E-Shop Logo"
          />
        </NuxtLink>
        <button
          type="button"
          class="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
          @click="$emit('close')"
          aria-label="Close menu"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="space-y-1">
        <NuxtLink
          v-for="(item, idx) in navLinks"
          :key="item.name"
          :to="item.path"
          class="nav-link-cool flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-250"
          :class="[
            route.path === item.path
              ? 'active bg-indigo-50/90 text-indigo-600 font-bold shadow-sm shadow-indigo-100/50'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
            'animate-fade-right',
            `stagger-${idx + 1}`
          ]"
          @click="$emit('close')"
        >
          <component
            :is="item.icon"
            class="w-5 h-5 shrink-0 transition-transform duration-250"
            :class="route.path === item.path ? 'scale-110' : ''"
          />
          <span>{{ item.name }}</span>
        </NuxtLink>
      </nav>
    </div>

    <!-- Logout Option -->
    <button
      @click="handleLogout"
      class="flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-250 w-full text-left group btn-cool"
    >
      <svg
        class="w-5 h-5 transition-transform duration-250 group-hover:-translate-x-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      <span>Logout</span>
    </button>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import {
  LayoutDashboard,
  Package,
  Grid,
  ShoppingBag,
  ArrowRightLeft,
  Users,
  User
} from 'lucide-vue-next'

defineEmits(['close'])

const route = useRoute()
const { logout } = useAuth()
const handleLogout = async () => {
  await logout()
}

const navLinks = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Categories', path: '/category', icon: Grid },
  { name: 'Orders', path: '/orders', icon: ShoppingBag },
  { name: 'Transactions', path: '/transactions', icon: ArrowRightLeft },
  { name: 'Users', path: '/users', icon: Users },
  { name: 'Profile', path: '/profile', icon: User }
]
</script>
