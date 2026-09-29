<template>
  <div class="flex min-h-screen bg-slate-50/50 overflow-x-hidden">
    <!-- Mobile overlay -->
    <Transition name="overlay">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar: desktop always visible, mobile drawer -->
    <div
      class="fixed inset-y-0 left-0 z-50 lg:static lg:z-auto transition-transform duration-300 ease-out"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <LayoutSidebar @close="sidebarOpen = false" />
    </div>

    <!-- Main Container -->
    <div class="flex-1 flex flex-col min-w-0 w-full">
      <!-- Navbar Header -->
      <LayoutNavbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Main Dashboard Canvas -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false)

// Close sidebar on route change (mobile)
const route = useRoute()
watch(() => route.path, () => {
  sidebarOpen.value = false
})
</script>
