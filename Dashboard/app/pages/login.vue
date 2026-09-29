<template>
  <div
    class="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-cover bg-center bg-no-repeat overflow-hidden"
    style="background-image: url('https://getwallpapers.com/wallpaper/full/f/5/f/1444406-white-background-wallpaper-images-1920x1200-for-ios.jpg');"
  >
    <!-- Animated gradient orbs (decorative) -->
    <div class="absolute top-1/4 -left-20 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-float pointer-events-none" />
    <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-400/15 rounded-full blur-3xl animate-float pointer-events-none" style="animation-delay: 1s" />

    <!-- Dark Soft Backdrop Overlay -->
    <div class="absolute inset-0 bg-slate-900/15 backdrop-blur-[2px]" />

    <!-- Main Card Container -->
    <div
      class="relative z-10 w-full max-w-md bg-white/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/60 shadow-2xl p-6 sm:p-8 space-y-5 sm:space-y-6 animate-scale-up"
    >
      <!-- Logo & Title Header -->
      <div class="text-center space-y-3 animate-fade-down">
        <div class="flex justify-center">
          <img
            src="/images/eshop.png"
            class="h-12 sm:h-14 w-auto object-contain drop-shadow-sm transition-transform duration-500 hover:scale-110"
            alt="E-Shop Logo"
          />
        </div>
        <div class="space-y-1">
          <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            E-Shop Dashboard
          </h1>
          <p class="text-xs text-slate-500 font-medium">
            Please sign in to manage your store
          </p>
        </div>
      </div>

      <!-- Alert Message -->
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform scale-95 opacity-0 -translate-y-2"
        enter-to-class="transform scale-100 opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="errorMessage"
          class="p-3.5 bg-rose-50/90 border border-rose-200/80 rounded-2xl text-rose-600 text-xs font-medium flex items-center gap-2.5 shadow-sm"
        >
          <svg class="w-4 h-4 shrink-0 fill-rose-500" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>
      </transition>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4 animate-fade-up stagger-2">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="admin@eshop.com"
            class="input-cool w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            v-model="form.password"
            type="password"
            required
            placeholder="••••••••"
            class="input-cool w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="btn-cool w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-[0.98] text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          <span
            v-if="isLoading"
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          />
          <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
        </button>
      </form>

      <!-- Footer Info -->
      <div class="text-center pt-2 animate-fade-in stagger-4">
        <p class="text-xs text-slate-400">
          Forgot your password? Contact your system administrator.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Role } from '~/types/auth'

definePageMeta({
  layout: false
})

const { login } = useAuth()

const form = reactive({
  email: '',
  password: ''
})

const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!form.email || !form.password) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await login({
      email: form.email,
      password: form.password
    })

    if (result.success && result.data) {
      if (result.data.user && result.data.user.role !== Role.ADMIN) {
        errorMessage.value = 'Access denied. Only administrators are allowed.'
        if (import.meta.client) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
        }
        return
      }

      await navigateTo('/')
    } else {
      errorMessage.value = result.error || 'Invalid email or password.'
    }
  } catch (err) {
    errorMessage.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>
