<script setup lang="ts">

import {
  ref,
  watch,
  onMounted,
  onUnmounted,
  computed
} from 'vue'

import { useRoute } from 'vue-router'

import { useProduct } from '~/composable/useProduct'
import type { Product } from '~/types/product'

import { useUserProfile } from '~/composable/useUserProfile'
import { useAuth } from '~/composable/useAuth'


/* =====================================================
   ROUTE
===================================================== */

const route = useRoute()


/* =====================================================
   AUTH
===================================================== */

const {
  user
} = useAuth()


/* =====================================================
   USER PROFILE
===================================================== */

const {
  profile,
  profileImageUrl,
  fetchProfile,
  clearProfile
} = useUserProfile()


/* =====================================================
   UI STATE
===================================================== */

const isMenuOpen = ref(false)

const isProfileMenuOpen = ref(false)

const isSearchOpen = ref(false)

const searchQuery = ref('')

const isScrolled = ref(false)


/* =====================================================
   SEARCH
===================================================== */

const {
  searchProducts
} = useProduct()

const searchResults =
  ref<Product[]>([])

const isSearching =
  ref(false)


/* =====================================================
   SEARCH CONTAINER
===================================================== */

const searchContainerRef =
  ref<HTMLElement | null>(null)


/* =====================================================
   PROFILE CONTAINER
===================================================== */

const profileContainerRef =
  ref<HTMLElement | null>(null)


/* =====================================================
   AUTH USER TYPE
===================================================== */

interface AuthUser {

  id?: number | string

  username?: string

  email?: string

  role?: string

  createdAt?: string

  updatedAt?: string

}


/* =====================================================
   CURRENT AUTH USER
===================================================== */

const currentAuthUser =
  computed(() => {

    return user.value as AuthUser | null

  })


/* =====================================================
   ROLE CHECK
===================================================== */

const userRole =
  computed(() => {

    return (
      currentAuthUser.value?.role
        ?.trim()
        .toUpperCase() || ''
    )

  })


/* =====================================================
   VALID ROLE
===================================================== */

const hasValidRole =
  computed(() => {

    const role =
      userRole.value

    return (
      role === 'USER' ||
      role === 'ADMIN'
    )

  })


/* =====================================================
   AUTHENTICATION CHECK
===================================================== */

const isLoggedIn =
  computed(() => {

    return (
      !!currentAuthUser.value &&
      hasValidRole.value
    )

  })


/* =====================================================
   REAL DISPLAY NAME
===================================================== */

const displayName =
  computed(() => {

    const firstName =
      profile.value?.firstName || ''

    const lastName =
      profile.value?.lastName || ''

    const fullName = [
      firstName,
      lastName
    ]
      .filter(Boolean)
      .join(' ')


    return (
      fullName ||
      currentAuthUser.value?.username ||
      'User'
    )

  })


/* =====================================================
   USER INITIAL
===================================================== */

const userInitial =
  computed(() => {

    const name =
      displayName.value || 'User'

    return name
      .trim()
      .split(/\s+/)
      .map(
        word =>
          word
            .charAt(0)
            .toUpperCase()
      )
      .slice(0, 2)
      .join('')

  })


/* =====================================================
   USER EMAIL
===================================================== */

const userEmail =
  computed(() => {

    return (
      currentAuthUser.value?.email ||
      ''
    )

  })


/* =====================================================
   USERNAME
===================================================== */

const username =
  computed(() => {

    return (
      currentAuthUser.value?.username ||
      ''
    )

  })


/* =====================================================
   NAVIGATION ITEMS
===================================================== */

const navItems = [

  {
    name: 'Home',
    path: '/'
  },

  {
    name: 'Mac',
    path: '/mac'
  },

  {
    name: 'iPad',
    path: '/ipad'
  },

  {
    name: 'iPhone',
    path: '/iphone'
  },

  {
    name: 'Accessories',
    path: '/accessories'
  }

]


/* =====================================================
   CLICK OUTSIDE
   SEARCH + PROFILE
===================================================== */

const handleClickOutside = (
  event: MouseEvent
) => {

  const target =
    event.target as Node


  /* ===================================================
     CLOSE SEARCH
  =================================================== */

  if (
    isSearchOpen.value &&
    searchContainerRef.value &&
    !searchContainerRef.value.contains(target)
  ) {

    isSearchOpen.value = false

  }


  /* ===================================================
     CLOSE PROFILE
  =================================================== */

  if (
    isProfileMenuOpen.value &&
    profileContainerRef.value &&
    !profileContainerRef.value.contains(target)
  ) {

    isProfileMenuOpen.value = false

  }

}


/* =====================================================
   SEARCH DEBOUNCE
===================================================== */

let searchTimeout:
  ReturnType<typeof setTimeout> | null =
  null


watch(
  searchQuery,
  (value) => {

    if (searchTimeout) {

      clearTimeout(searchTimeout)

    }


    const query =
      value.trim()


    if (!query) {

      searchResults.value = []

      isSearching.value = false

      return

    }


    searchTimeout =
      setTimeout(
        async () => {

          isSearching.value = true

          try {

            searchResults.value =
              await searchProducts(query)

          } catch (error) {

            console.error(
              'Search error:',
              error
            )

            searchResults.value = []

          } finally {

            isSearching.value = false

          }

        },
        300
      )

  }
)


/* =====================================================
   LOAD USER PROFILE
===================================================== */

const loadUserProfile = async () => {

  if (!isLoggedIn.value) {

    clearProfile()

    return

  }


  try {

    await fetchProfile()

  } catch (error) {

    console.error(
      'Failed to load user profile:',
      error
    )

  }

}


/* =====================================================
   WATCH AUTH STATE
===================================================== */

watch(
  isLoggedIn,
  async (loggedIn) => {

    if (loggedIn) {

      try {

        await fetchProfile()

      } catch (error) {

        console.error(
          'Failed to fetch profile:',
          error
        )

      }

    } else {

      clearProfile()

      isProfileMenuOpen.value = false

    }

  }
)


/* =====================================================
   ROUTE CHANGE
===================================================== */

watch(
  () => route.path,
  () => {

    isMenuOpen.value = false

    isProfileMenuOpen.value = false

    isSearchOpen.value = false

  }
)


/* =====================================================
   LOGOUT
===================================================== */

const handleLogout = () => {

  if (!import.meta.client) {
    return
  }


  /* Remove authentication */

  localStorage.removeItem(
    'auth_token'
  )

  localStorage.removeItem(
    'user'
  )

  localStorage.removeItem(
    'auth_user'
  )


  /* Clear profile */

  clearProfile()


  /* Close menus */

  isProfileMenuOpen.value = false

  isSearchOpen.value = false

  isMenuOpen.value = false


  /* Reload auth state */

  window.location.href =
    '/auth/login'

}


/* =====================================================
   SCROLL
===================================================== */

const handleScroll = () => {

  isScrolled.value =
    window.scrollY > 20

}


/* =====================================================
   MOUNT
===================================================== */

onMounted(
  async () => {

    window.addEventListener(
      'click',
      handleClickOutside
    )


    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true
      }
    )


    handleScroll()


    await loadUserProfile()

  }
)


/* =====================================================
   UNMOUNT
===================================================== */

onUnmounted(() => {

  window.removeEventListener(
    'click',
    handleClickOutside
  )


  window.removeEventListener(
    'scroll',
    handleScroll
  )


  if (searchTimeout) {

    clearTimeout(searchTimeout)

  }

})

</script>


<template>

  <header
    class="
      sticky
      top-4
      z-50
      max-w-7xl
      mx-auto
      px-4
      sm:px-7
    "
  >

    <!-- =================================================
         MAIN NAVBAR
    ================================================== -->

    <div
      class="
        bg-white/90
        backdrop-blur-md
        rounded-2xl
        border
        border-gray-100
        px-4
        sm:px-6
        py-3
        flex
        items-center
        justify-between
        gap-4
        transition-all
        duration-400
      "
      :class="
        isScrolled
          ? 'shadow-xl shadow-black/8 bg-white/95'
          : 'shadow-lg'
      "
    >

      <!-- =================================================
           MOBILE MENU BUTTON
      ================================================== -->

      <button
        type="button"
        @click="isMenuOpen = true"
        aria-label="Open Navigation Menu"
        class="
          lg:hidden
          p-2
          text-gray-800
          hover:text-black
          transition-all
          active:scale-95
          rounded-xl
          hover:bg-gray-100
          -ml-2
        "
      >

        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >

          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            d="M4 6h16M4 12h16M4 18h16"
          />

        </svg>

      </button>


      <!-- =================================================
           LOGO
      ================================================== -->

      <NuxtLink to="/">

        <NuxtImg
          src="/images/eshop.png"
          class="
            h-16
            w-auto
            object-contain
            transition-transform
            duration-500
            hover:scale-105
          "
          alt="E-Shop Logo"
        />

      </NuxtLink>


      <!-- =================================================
           DESKTOP NAVIGATION
      ================================================== -->

      <nav
        class="
          hidden
          lg:flex
          items-center
          gap-8
        "
      >

        <NuxtLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.path"
          class="
            nav-link
            relative
            font-medium
            transition-colors
            hover:text-blue-600
            py-1
            text-sm
          "
          :class="
            route.path === item.path
              ? 'text-black font-semibold is-active'
              : 'text-gray-600'
          "
        >

          {{ item.name }}

        </NuxtLink>

      </nav>


      <!-- =================================================
           RIGHT ACTIONS
      ================================================== -->

      <div
        class="
          flex
          items-center
          gap-2
          sm:gap-3
          shrink-0
        "
      >

        <!-- =================================================
             SEARCH
        ================================================== -->

        <div
          ref="searchContainerRef"
          class="relative"
        >

          <button
            type="button"
            @click="isSearchOpen = !isSearchOpen"
            aria-label="Search"
            class="
              p-2
              text-gray-600
              hover:text-black
              transition-colors
              rounded-full
              hover:bg-blue-100/70
              hover:text-blue-600
              flex
              items-center
              justify-center
            "
          >

            <Transition
              name="search-icon"
              mode="out-in"
            >

              <!-- SEARCH ICON -->

              <svg
                v-if="!isSearchOpen"
                key="search"
                class="w-5 h-5"
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


              <!-- CLOSE ICON -->

              <svg
                v-else
                key="close"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >

                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />

              </svg>

            </Transition>

          </button>


          <!-- =================================================
               SEARCH DROPDOWN
          ================================================== -->

          <Transition name="search-dropdown">

            <div
              v-if="isSearchOpen"
              class="
                fixed
                left-1/2
                -translate-x-1/2
                top-20
                w-[calc(100vw-2rem)]
                max-w-[384px]
                bg-white
                rounded-2xl
                shadow-2xl
                border
                border-gray-100
                z-[1000]
                overflow-hidden

                md:absolute
                md:left-auto
                md:right-0
                md:translate-x-0
                md:top-auto
                md:mt-3
                md:w-96
              "
            >

              <!-- SEARCH INPUT -->

              <div class="p-3">

                <div
                  class="
                    flex
                    items-center
                    gap-2
                    bg-gray-50
                    border
                    border-gray-200
                    rounded-xl
                    px-3
                    py-2
                    focus-within:bg-white
                    transition-all
                  "
                >

                  <svg
                    class="w-4 h-4 text-gray-400 shrink-0"
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
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search products..."
                    class="
                      w-full
                      bg-transparent
                      text-sm
                      text-gray-600
                      placeholder-gray-400
                      outline-none
                    "
                  />


                  <button
                    v-if="searchQuery"
                    type="button"
                    @click="searchQuery = ''"
                    class="
                      text-gray-400
                      hover:text-gray-600
                      shrink-0
                    "
                  >

                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >

                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />

                    </svg>

                  </button>

                </div>

              </div>


              <!-- =================================================
                   SEARCH RESULTS
              ================================================== -->

              <div
                v-if="searchQuery.trim()"
                class="border-t border-gray-100"
              >

                <!-- LOADING -->

                <div
                  v-if="isSearching"
                  class="
                    flex
                    items-center
                    justify-center
                    gap-2
                    py-6
                    text-sm
                    text-gray-500
                  "
                >

                  <svg
                    class="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >

                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />

                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />

                  </svg>

                  Searching...

                </div>


                <!-- RESULTS -->

                <div
                  v-else-if="
                    searchResults.length > 0
                  "
                  class="
                    max-h-[360px]
                    overflow-y-auto
                    scrollbar-thin
                  "
                >

                  <NuxtLink
                    v-for="product in searchResults"
                    :key="product.productId"
                    :to="`/products/${product.productId}`"
                    @click="isSearchOpen = false"
                    class="
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                      hover:bg-gray-50
                      transition-colors
                    "
                  >

                    <!-- PRODUCT IMAGE -->

                    <div
                      class="
                        w-12
                        h-12
                        rounded-xl
                        bg-gray-100
                        overflow-hidden
                        shrink-0
                        flex
                        items-center
                        justify-center
                      "
                    >

                      <img
                        v-if="product.image"
                        :src="product.image"
                        :alt="product.name"
                        class="
                          w-full
                          h-full
                          object-contain
                        "
                      />

                      <svg
                        v-else
                        class="w-6 h-6 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >

                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M3 7l9-4 9 4v10l-9 4-9-4V7z"
                        />

                      </svg>

                    </div>


                    <!-- PRODUCT INFO -->

                    <div
                      class="
                        min-w-0
                        flex-1
                      "
                    >

                      <p
                        class="
                          text-sm
                          font-semibold
                          text-gray-800
                          truncate
                        "
                      >
                        {{ product.name }}
                      </p>

                      <p
                        class="
                          text-xs
                          text-gray-500
                          mt-0.5
                        "
                      >
                        {{ product.chipName || 'Product' }}
                      </p>

                    </div>


                    <!-- ARROW -->

                    <svg
                      class="
                        w-4
                        h-4
                        text-gray-300
                        shrink-0
                      "
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >

                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />

                    </svg>

                  </NuxtLink>

                </div>


                <!-- NO RESULTS -->

                <div
                  v-else
                  class="
                    py-8
                    px-4
                    text-center
                  "
                >

                  <div
                    class="
                      mx-auto
                      w-10
                      h-10
                      rounded-full
                      bg-gray-100
                      flex
                      items-center
                      justify-center
                      mb-3
                    "
                  >

                    <svg
                      class="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >

                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.8"
                        d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
                      />

                    </svg>

                  </div>


                  <p
                    class="
                      text-sm
                      font-medium
                      text-gray-700
                    "
                  >
                    No products found
                  </p>


                  <p
                    class="
                      text-xs
                      text-gray-400
                      mt-1
                    "
                  >
                    Try searching for another product
                  </p>

                </div>

              </div>

            </div>

          </Transition>

        </div>


        <!-- =================================================
             CART
        ================================================== -->

        <CartIcon />


        <!-- =================================================
             LOGGED-IN USER PROFILE
        ================================================== -->

        <div
          v-if="isLoggedIn"
          ref="profileContainerRef"
          class="relative"
        >

          <!-- PROFILE BUTTON -->

          <button
            type="button"
            @click="
              isProfileMenuOpen =
                !isProfileMenuOpen
            "
            class="
              flex
              items-center
              gap-2
              p-0.5
              rounded-full
              border
              border-gray-200
              hover:border-blue-500
              transition-all
              focus:outline-none
            "
          >

            <div
              class="
                w-8
                h-8
                rounded-full
                overflow-hidden
                bg-gray-100
                flex
                items-center
                justify-center
              "
            >

              <img
                v-if="profileImageUrl"
                :src="profileImageUrl"
                alt="User Avatar"
                class="
                  w-full
                  h-full
                  object-cover
                "
              />

              <span
                v-else
                class="
                  text-xs
                  font-bold
                  text-blue-600
                "
              >
                {{ userInitial }}
              </span>

            </div>

          </button>


          <!-- =================================================
               PROFILE DROPDOWN
          ================================================== -->

          <Transition name="profile-dropdown">

            <div
              v-if="isProfileMenuOpen"
              class="
                absolute
                right-0
                mt-2
                w-64
                bg-white
                rounded-xl
                shadow-xl
                border
                border-gray-100
                py-2
                z-[1000]
              "
            >

              <!-- USER INFORMATION -->

              <div
                class="
                  px-4
                  py-3
                  border-b
                  border-gray-100
                "
              >

                <div
                  class="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <!-- AVATAR -->

                  <div
                    class="
                      w-10
                      h-10
                      rounded-full
                      overflow-hidden
                      bg-gray-100
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >

                    <img
                      v-if="profileImageUrl"
                      :src="profileImageUrl"
                      alt="Profile"
                      class="
                        w-full
                        h-full
                        object-cover
                      "
                    />

                    <span
                      v-else
                      class="
                        text-xs
                        font-bold
                        text-blue-600
                      "
                    >
                      {{ userInitial }}
                    </span>

                  </div>


                  <!-- USER INFO -->

                  <div class="min-w-0">

                    <p
                      class="
                        text-sm
                        font-semibold
                        text-gray-800
                        truncate
                      "
                    >
                      {{ displayName }}
                    </p>

                    <p
                      v-if="username"
                      class="
                        text-xs
                        text-gray-400
                        truncate
                      "
                    >
                      @{{ username }}
                    </p>

                  </div>

                </div>


                <!-- EMAIL -->

                <p
                  v-if="userEmail"
                  class="
                    text-xs
                    text-gray-400
                    mt-3
                    truncate
                  "
                >
                  {{ userEmail }}
                </p>


                <!-- ROLE -->

                <span
                  class="
                    inline-flex
                    mt-2
                    px-2
                    py-1
                    rounded-md
                    bg-blue-50
                    text-blue-600
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                  "
                >
                  {{ userRole }}
                </span>

              </div>


              <!-- MY PROFILE -->

              <NuxtLink
                to="/profile"
                @click="isProfileMenuOpen = false"
                class="
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  text-sm
                  text-gray-700
                  hover:bg-gray-50
                  hover:text-blue-600
                  transition-colors
                "
              >

                <i class="pi pi-user text-sm"></i>

                My Profile

              </NuxtLink>


              <!-- LOGOUT -->

              <button
                type="button"
                @click="handleLogout"
                class="
                  w-full
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  text-sm
                  text-red-600
                  hover:bg-red-50
                  text-left
                  transition-colors
                "
              >

                <i class="pi pi-sign-out text-sm"></i>

                Logout

              </button>

            </div>

          </Transition>

        </div>


        <!-- =================================================
             NOT LOGGED IN
        ================================================== -->

        <div
          v-else
          class="
            flex
            items-center
            gap-2
          "
        >

          <NuxtLink
            to="/auth/login"
            class="
              px-3
              sm:px-4
              py-2
              text-xs
              sm:text-sm
              font-medium
              text-gray-700
              hover:text-blue-600
              border
              border-gray-300
              hover:border-blue-600
              rounded-xl
              transition-all
              duration-200
            "
          >
            Login
          </NuxtLink>


          <NuxtLink
            to="/auth/register"
            class="
              px-3
              sm:px-4
              py-2
              text-xs
              sm:text-sm
              font-medium
              text-white
              bg-blue-600
              hover:bg-blue-700
              rounded-xl
              shadow-md
              hover:shadow-blue-500/20
              transition-all
              duration-200
            "
          >
            Register
          </NuxtLink>

        </div>

      </div>

    </div>


    <!-- =====================================================
         MOBILE DRAWER
    ====================================================== -->

    <ClientOnly>

      <Teleport to="body">

        <!-- OVERLAY -->

        <Transition name="mobile-overlay">

          <div
            v-if="isMenuOpen"
            @click="isMenuOpen = false"
            class="
              fixed
              inset-0
              bg-black/30
              backdrop-blur-xs
              z-[998]
            "
          ></div>

        </Transition>


        <!-- DRAWER -->

        <Transition name="mobile-drawer">

          <div
            v-if="isMenuOpen"
            class="
              fixed
              top-0
              left-0
              h-full
              w-[75vw]
              sm:w-72
              max-w-xs
              bg-white
              z-[999]
              p-6
              flex
              flex-col
              justify-between
              border-r
              border-gray-100
              shadow-xl
            "
          >

            <div>

              <!-- DRAWER HEADER -->

              <div
                class="
                  flex
                  items-center
                  justify-between
                  pb-4
                  border-b
                  border-gray-100
                "
              >

                <NuxtLink to="/">

                  <NuxtImg
                    src="/images/eshop.png"
                    class="
                      h-16
                      w-auto
                      object-contain
                      transition-transform
                      duration-500
                      hover:scale-105
                    "
                    alt="E-Shop Logo"
                  />

                </NuxtLink>


                <button
                  type="button"
                  @click="isMenuOpen = false"
                  aria-label="Close Menu"
                  class="
                    p-1.5
                    text-gray-400
                    hover:text-black
                    transition-colors
                    rounded-full
                    hover:bg-gray-100
                  "
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
                      stroke-width="1.8"
                      d="M6 18L18 6M6 6l12 12"
                    />

                  </svg>

                </button>

              </div>


              <!-- =================================================
                   MOBILE REAL PROFILE
              ================================================== -->

              <div
                v-if="isLoggedIn"
                class="
                  my-4
                  p-3
                  bg-gray-50
                  rounded-xl
                "
              >

                <div
                  class="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    class="
                      w-10
                      h-10
                      rounded-full
                      overflow-hidden
                      bg-white
                      border
                      border-gray-200
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >

                    <img
                      v-if="profileImageUrl"
                      :src="profileImageUrl"
                      alt="User Profile"
                      class="
                        w-full
                        h-full
                        object-cover
                      "
                    />

                    <span
                      v-else
                      class="
                        text-xs
                        font-bold
                        text-blue-600
                      "
                    >
                      {{ userInitial }}
                    </span>

                  </div>


                  <div
                    class="
                      overflow-hidden
                    "
                  >

                    <h4
                      class="
                        text-sm
                        font-semibold
                        text-gray-800
                        truncate
                      "
                    >
                      {{ displayName }}
                    </h4>

                    <p
                      v-if="username"
                      class="
                        text-[11px]
                        text-gray-400
                        truncate
                      "
                    >
                      @{{ username }}
                    </p>

                    <NuxtLink
                      to="/profile"
                      @click="isMenuOpen = false"
                      class="
                        text-xs
                        text-blue-600
                        font-medium
                        hover:underline
                      "
                    >
                      View Profile
                    </NuxtLink>

                  </div>

                </div>

              </div>


              <!-- =================================================
                   MOBILE NAVIGATION
              ================================================== -->

              <nav
                class="
                  flex
                  flex-col
                  gap-4
                  mt-4
                  px-1
                "
              >

                <NuxtLink
                  v-for="item in navItems"
                  :key="item.name"
                  :to="item.path"
                  class="
                    nav-link-mobile
                    relative
                    w-fit
                    font-medium
                    transition-colors
                    hover:text-blue-600
                    py-1
                    text-base
                  "
                  :class="
                    route.path === item.path
                      ? 'text-black font-semibold is-active'
                      : 'text-gray-600'
                  "
                  @click="isMenuOpen = false"
                >

                  {{ item.name }}

                </NuxtLink>

              </nav>


              <!-- =================================================
                   MOBILE AUTH BUTTONS
              ================================================== -->

              <div
                v-if="!isLoggedIn"
                class="
                  flex
                  flex-col
                  gap-2
                  mt-6
                  pt-4
                  border-t
                  border-gray-100
                "
              >

                <NuxtLink
                  to="/auth/login"
                  @click="isMenuOpen = false"
                  class="
                    w-full
                    text-center
                    py-2
                    text-sm
                    font-medium
                    text-gray-700
                    border
                    border-gray-300
                    rounded-xl
                  "
                >
                  Login
                </NuxtLink>


                <NuxtLink
                  to="/auth/register"
                  @click="isMenuOpen = false"
                  class="
                    w-full
                    text-center
                    py-2
                    text-sm
                    font-medium
                    text-white
                    bg-blue-600
                    rounded-xl
                    shadow-md
                  "
                >
                  Register
                </NuxtLink>

              </div>

            </div>


            <!-- =================================================
                 DRAWER FOOTER
            ================================================== -->

            <div
              class="
                pt-4
                border-t
                border-gray-100
                flex
                flex-col
                gap-3
                text-xs
                text-gray-400
              "
            >

              <div
                class="
                  flex
                  items-center
                  justify-between
                  text-black
                  font-medium
                "
              >

                <div
                  class="
                    flex
                    items-center
                    gap-1.5
                  "
                >

                  <i class="pi pi-apple"></i>

                  <span>
                    ETEC STORE
                  </span>

                </div>

              </div>

            </div>

          </div>

        </Transition>

      </Teleport>

    </ClientOnly>

  </header>

</template>