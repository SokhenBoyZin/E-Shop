<template>

  
  <div 
  class="relative min-h-screen w-full p-4 bg-cover bg-center bg-no-repeat mb-1"
  style="background-image: url('https://getwallpapers.com/wallpaper/full/f/5/f/1444406-white-background-wallpaper-images-1920x1200-for-ios.jpg');"
  >
  <Header/>
    <!-- Dark Soft Backdrop Overlay -->
    <div class="absolute inset-0 bg-slate-900/15 backdrop-blur-[2px]"></div>


    <div class="mt-20 flex items-center justify-center">

      <div class="auth-card relative z-10 w-full max-w-md bg-white/85 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl p-8 space-y-6 my-auto"
        :class="errorMessage ? 'shake' : ''">
        
        <!-- Logo & Title Header -->
        <div class="text-center space-y-3">
          <div class="flex justify-center">
            <img 
              src="/images/eshop.png" 
              class="h-14 w-auto object-contain drop-shadow-sm" 
              alt="E-Shop Logo" 
            />
          </div>
          <div class="space-y-1">
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
            <p class="text-xs text-slate-500 font-medium">Register a new user account</p>
          </div>
        </div>
  
        <!-- Alert Message -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div 
            v-if="errorMessage" 
            class="p-3.5 bg-rose-50/90 border border-rose-200/80 rounded-2xl text-rose-600 text-xs font-medium flex items-center gap-2.5 shadow-sm"
          >
            <svg class="w-4 h-4 shrink-0 fill-rose-500" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        </transition>
  
        <!-- Registration Form -->
        <form @submit.prevent="registerUser" class="form-stagger space-y-4">
          <!-- Username -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              v-model="form.username"
              type="text"
              required
              placeholder="johndoe"
              class="input-pop w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 shadow-sm"
            />
          </div>
  
          <!-- Email -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="user@eshop.com"
              class="input-pop w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 shadow-sm"
            />
          </div>
  
          <!-- Password -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              v-model="form.password"
              type="password"
              required
              placeholder="••••••••"
              class="input-pop w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 shadow-sm"
            />
          </div>
  
          <!-- Confirm Password -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <input
              v-model="form.confirm_password"
              type="password"
              required
              placeholder="••••••••"
              class="input-pop w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 shadow-sm"
            />
          </div>
  
          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="btn-premium w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ isLoading ? 'Creating Account...' : 'Register' }}</span>
          </button>
        </form>
  
        <!-- Footer Navigation Link -->
        <div class="text-center pt-2">
          <p class="text-xs text-slate-500">
            Already have an account?
            <NuxtLink
              to="/auth/login"
              class="text-indigo-600 font-bold hover:underline ml-1"
            >
              Sign In
            </NuxtLink>
          </p>
        </div>
  
      </div>

    </div>
    <!-- Main Card Container -->
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import Header from "~/layouts/Header.vue";

definePageMeta({
  layout: false
});

const form = reactive({
  username: "",
  email: "",
  password: "",
  confirm_password: "",
});

const isLoading = ref(false);
const errorMessage = ref("");

const registerUser = async () => {
  if (form.password !== form.confirm_password) {
    errorMessage.value = "Passwords do not match!";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  const config = useRuntimeConfig();

  try {
    const data = await $fetch<any>(`${config.public.apiBase}/Auth/register`, { 
      method: "POST", 
      body: form 
    });

    if (data.token) {
      if (import.meta.client) {
        localStorage.setItem("auth_token", data.token);
        if (data.user) localStorage.setItem("auth_user", JSON.stringify(data.user));
      }
      await navigateTo("/");
    } else {
      await navigateTo("/auth/login");
    }
  } catch (error: any) {
    errorMessage.value = error?.data?.message || error?.data?.error || "Registration failed. Please try again.";
  } finally {
    isLoading.value = false;
  }
};
</script>