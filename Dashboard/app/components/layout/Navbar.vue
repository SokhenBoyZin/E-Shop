<template>
  <header
    class="h-16 sm:h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 animate-fade-down"
  >
    <!-- LEFT: hamburger (mobile) + search -->
    <div class="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
      <!-- Mobile menu button -->
      <button
        type="button"
        class="lg:hidden p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-250 btn-cool shrink-0"
        @click="$emit('toggle-sidebar')"
        aria-label="Open menu"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Search -->
      <div class="relative flex-1 max-w-md hidden sm:block">
        <svg
          class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search..."
          class="input-cool w-full bg-slate-100/70 text-slate-700 text-sm pl-10 pr-4 py-2.5 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-transparent outline-none"
        />
      </div>
    </div>

    <!-- RIGHT: profile -->
    <div class="flex items-center gap-3 sm:gap-5 shrink-0">
      <!-- Mobile search icon (optional visual) -->
      <button
        type="button"
        class="sm:hidden p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-all duration-200"
        aria-label="Search"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <button
        type="button"
        @click="goToProfile"
        class="flex items-center gap-2.5 sm:gap-3 cursor-pointer group btn-cool"
      >
        <div
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-indigo-50 border-2 border-transparent group-hover:border-indigo-200 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:shadow-md group-hover:shadow-indigo-100"
        >
          <img
            v-if="profileImageUrl"
            :src="profileImageUrl"
            alt="Profile"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-xs font-bold text-indigo-600">
            {{ userInitial }}
          </span>
        </div>

        <span
          class="hidden md:inline text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors duration-200"
        >
          {{ displayName }}
        </span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserProfile } from '~/composables/useUserProfile'

defineEmits(['toggle-sidebar'])

const router = useRouter()
const { user } = useAuth()
const { profile, profileImageUrl, fetchProfile } = useUserProfile()

const displayName = computed(() => {
  const firstName = profile.value?.firstName || ''
  const lastName = profile.value?.lastName || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  return fullName || user.value?.username || 'Admin'
})

const userInitial = computed(() => {
  const name = displayName.value || 'Admin'
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
})

const goToProfile = () => {
  router.push('/profile')
}

onMounted(async () => {
  await fetchProfile()
})
</script>
