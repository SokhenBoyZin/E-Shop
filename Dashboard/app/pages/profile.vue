<template>
  <div v-if="currentUser" class="space-y-6 sm:space-y-8">

    <!-- ========================================= -->
    <!-- MAIN PROFILE GRID -->
    <!-- ========================================= -->

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

      <!-- ======================================= -->
      <!-- LEFT SECTION -->
      <!-- ======================================= -->

      <div class="lg:col-span-2 space-y-8">

        <!-- ===================================== -->
        <!-- MY ACCOUNT HEADER -->
        <!-- ===================================== -->

        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up">
          <div>
            <p class="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider mb-2">
              My Account
            </p>

            <h1 class="text-lg sm:text-xl font-bold text-slate-800">
              Welcome back,
              {{ currentUser.firstName || currentUser.username || 'User' }}!
            </h1>

            <p class="text-xs text-slate-400 mt-1">
              Manage your account and check your order activity
            </p>
          </div>
        </div>


        <!-- ===================================== -->
        <!-- 4 STAT CARDS -->
        <!-- ===================================== -->

        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">

          <!-- Total Orders -->
          <div class="bg-white p-5 rounded-2xl border border-indigo-100/80 shadow-sm card-cool animate-fade-up hover:shadow-md transition-all">
            <span class="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              Total Orders
            </span>

            <h2 class="text-3xl font-extrabold text-indigo-600 mt-1">
              {{ userStats.totalOrders }}
            </h2>

            <p class="text-[11px] text-slate-400 mt-1">
              All orders
            </p>
          </div>


          <!-- Total Spent -->
          <div class="bg-white p-5 rounded-2xl border border-emerald-100/80 shadow-sm card-cool animate-fade-up hover:shadow-md transition-all">
            <span class="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              Total Spent
            </span>

            <h2 class="text-3xl font-extrabold text-emerald-600 mt-1">
              ${{ userStats.totalSpent.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) }}
            </h2>

            <p class="text-[11px] text-slate-400 mt-1">
              Successful purchases
            </p>
          </div>


          <!-- Paid Orders -->
          <div class="bg-white p-5 rounded-2xl border border-blue-100/80 shadow-sm card-cool animate-fade-up hover:shadow-md transition-all">
            <span class="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              Paid Orders
            </span>

            <h2 class="text-3xl font-extrabold text-blue-600 mt-1">
              {{ userStats.paidOrders }}
            </h2>

            <p class="text-[11px] text-slate-400 mt-1">
              Successfully paid
            </p>
          </div>


          <!-- Pending Orders -->
          <div class="bg-white p-5 rounded-2xl border border-amber-100/80 shadow-sm card-cool animate-fade-up hover:shadow-md transition-all">
            <span class="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              Pending Orders
            </span>

            <h2 class="text-3xl font-extrabold text-amber-600 mt-1">
              {{ userStats.pendingOrders }}
            </h2>

            <p class="text-[11px] text-slate-400 mt-1">
              Waiting for payment/action
            </p>
          </div>

        </div>


        <!-- ===================================== -->
        <!-- RECENT ORDERS -->
        <!-- ===================================== -->

        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up overflow-hidden">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <h3 class="text-lg font-bold text-slate-800">
                Recent Orders
              </h3>

              <p class="text-xs text-slate-400 mt-1">
                Your latest orders and payment status
              </p>
            </div>
          </div>


          <!-- Loading -->
          <div v-if="ordersLoading" class="p-6 space-y-3">

            <div v-for="i in 4" :key="i" class="h-14 bg-slate-100 rounded-xl animate-pulse"></div>

          </div>


          <!-- Empty -->
          <div v-else-if="recentOrders.length === 0" class="py-12 text-center">

            <div class="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center mb-3 text-lg">
              🛍
            </div>

            <p class="text-sm font-semibold text-slate-700">
              No recent orders
            </p>

            <p class="text-xs text-slate-400 mt-1">
              Your orders will appear here.
            </p>

          </div>


          <!-- Order Table -->
          <div v-else class="overflow-x-auto">

            <table class="w-full min-w-[650px]">

              <!-- Table Header -->
              <thead>
                <tr class="bg-slate-50/70 border-b border-slate-100">

                  <th class="px-6 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Order
                  </th>

                  <th class="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Product
                  </th>

                  <th class="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Date
                  </th>

                  <th class="px-4 py-3 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Total
                  </th>

                  <th class="px-4 py-3 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>

                  <th class="px-6 py-3 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Action
                  </th>

                </tr>
              </thead>


              <!-- Table Body -->
              <tbody class="divide-y divide-slate-100">

                <tr v-for="order in paginatedRecentOrders" :key="order.id"
                  class="hover:bg-slate-50/60 transition-colors">

                  <!-- Order -->
                  <td class="px-6 py-4">

                    <div class="flex items-center gap-3">

                      <div
                        class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-bold">
                        #
                      </div>

                      <div>

                        <p class="text-sm font-semibold text-slate-800">
                          #{{ order.id }}
                        </p>

                        <p class="text-[10px] text-slate-400 mt-0.5">
                          Order
                        </p>

                      </div>

                    </div>

                  </td>


                  <!-- Product -->
                  <td class="px-4 py-4">

                    <p class="text-sm font-semibold text-slate-800 max-w-[170px] truncate">
                      {{ order.name }}
                    </p>

                    <p class="text-[11px] text-slate-400 mt-0.5">
                      Order item
                    </p>

                  </td>


                  <!-- Date -->
                  <td class="px-4 py-4">

                    <p class="text-xs font-medium text-slate-600">
                      {{ formatDate(order.createdAt) }}
                    </p>

                  </td>


                  <!-- Total -->
                  <td class="px-4 py-4 text-right">

                    <p class="text-sm font-bold text-slate-900">
                      ${{ Number(order.amount).toFixed(2) }}
                    </p>

                  </td>


                  <!-- Status -->
                  <td class="px-4 py-4 text-center">

                    <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                      :class="getStatusBadge(order.status)">
                      {{ getStatusLabel(order.status) }}
                    </span>

                  </td>


                  <!-- Action -->
                  <td class="px-6 py-4 text-right">

                    <button @click="viewOrder(order)"
                      class="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold hover:bg-indigo-100 transition-colors">
                      View
                    </button>

                  </td>

                </tr>

              </tbody>

            </table>

          </div>


          <!-- ===================================== -->
          <!-- PAGINATION -->
          <!-- ===================================== -->

          <div v-if="recentOrders.length > 0"
            class="flex items-center justify-center gap-3 px-6 py-4 border-t border-slate-100 bg-white">

            <!-- BACK -->
            <button @click="previousPage" :disabled="currentPage === 1"
              class="px-8 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-blue-700 text-sm hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous page">
              Back
            </button>


            <!-- PAGE NUMBER -->
            <span class="text-sm font-medium text-slate-600 min-w-[90px] text-center">
              {{ currentPage }} / {{ totalPages }}
            </span>


            <!-- NEXT -->
            <button @click="nextPage" :disabled="currentPage === totalPages"
              class="px-8 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-blue-700 text-sm hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next page">
              Next
            </button>

          </div>

        </div>

      </div>


      <!-- ======================================= -->
      <!-- RIGHT PROFILE SECTION -->
      <!-- ======================================= -->

      <div class="lg:col-span-1 h-full">

        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up h-full overflow-hidden">

          <!-- Profile Top -->
          <div class="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-6 pt-7 pb-8">

            <!-- Edit Button -->
            <button @click="openEditProfile"
              class="absolute top-5 right-5 px-3 py-1.5 rounded-lg bg-white border border-slate-100 shadow-sm text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all">
              Edit
            </button>


            <!-- Avatar -->
            <div class="flex flex-col items-center text-center">

              <div
                class="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center">

                <img v-if="profileImageUrl" :src="profileImageUrl" alt="Profile" class="w-full h-full object-cover" />

                <span v-else class="text-2xl font-extrabold text-indigo-600">
                  {{ userInitial }}
                </span>

              </div>


              <!-- Name -->
              <h2 class="text-lg font-bold text-slate-800 mt-4">
                {{
                  currentUser.fullName ||
                  currentUser.username ||
                  'User'
                }}
              </h2>


              <!-- Username -->
              <p v-if="currentUser.username" class="text-xs text-slate-400 mt-1">
                @{{ currentUser.username }}
              </p>


              <!-- Role -->
              <span
                class="mt-2 px-3 py-1 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-semibold uppercase tracking-wider">
                {{ currentUser.role || 'USER' }}
              </span>

            </div>

          </div>


          <!-- Profile Information -->
          <div class="p-6 space-y-6">

            <!-- Email -->
            <div>
              <p class="text-xs font-semibold text-slate-400">
                Email
              </p>

              <p class="text-sm font-semibold text-slate-700 mt-1 break-all">
                {{ currentUser.email || '—' }}
              </p>
            </div>


            <!-- Phone -->
            <div>
              <p class="text-xs font-semibold text-slate-400">
                Phone Number
              </p>

              <p class="text-sm font-semibold text-slate-700 mt-1">
                {{ currentUser.phoneNumber || 'Not provided' }}
              </p>
            </div>


            <!-- Member Since -->
            <div>
              <p class="text-xs font-semibold text-slate-400">
                Member Since
              </p>

              <p class="text-sm font-semibold text-slate-700 mt-1">
                {{ formatDate(currentUser.createdAt) }}
              </p>
            </div>


            <!-- Updated -->
            <div>
              <p class="text-xs font-semibold text-slate-400">
                Last Updated
              </p>

              <p class="text-sm font-semibold text-slate-700 mt-1">
                {{ formatDate(currentUser.updatedAt) }}
              </p>
            </div>


            <!-- Divider -->
            <div class="border-t border-slate-100"></div>


            <!-- Account Status -->
            <div class="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-100">

              <div>

                <p class="text-xs font-semibold text-slate-500">
                  Account Status
                </p>

                <p class="text-sm font-bold text-emerald-600 mt-1">
                  Active
                </p>

              </div>

              <span class="w-3 h-3 rounded-full bg-emerald-500"></span>

            </div>


            <!-- Account Summary -->
            <div>

              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Account Summary
              </p>

              <div class="space-y-4">

                <!-- Orders -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-500">
                    Orders
                  </span>

                  <span class="text-sm font-bold text-slate-800">
                    {{ userStats.totalOrders }}
                  </span>
                </div>


                <!-- Paid -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-500">
                    Paid Orders
                  </span>

                  <span class="text-sm font-bold text-blue-600">
                    {{ userStats.paidOrders }}
                  </span>
                </div>


                <!-- Pending -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-500">
                    Pending Orders
                  </span>

                  <span class="text-sm font-bold text-amber-600">
                    {{ userStats.pendingOrders }}
                  </span>
                </div>


                <!-- Spent -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-slate-500">
                    Total Spent
                  </span>

                  <span class="text-sm font-bold text-emerald-600">
                    ${{ userStats.totalSpent.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) }}
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>


    <!-- ========================================= -->
    <!-- EDIT PROFILE MODAL -->
    <!-- ========================================= -->

    <Transition name="fade">

      <div v-if="showEditProfile"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
        @click.self="closeEditProfile">

        <div class="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">

          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">

            <div>

              <h3 class="text-lg font-bold text-slate-800">
                Edit Profile
              </h3>

              <p class="text-xs text-slate-400 mt-1">
                Update your personal information
              </p>

            </div>


            <button @click="closeEditProfile"
              class="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
              ✕
            </button>

          </div>


          <!-- Form -->
          <form @submit.prevent="saveProfile" class="p-6 space-y-5">

            <!-- First Name -->
            <div>

              <label class="block text-xs font-semibold text-slate-500 mb-2">
                First Name
              </label>

              <input v-model="editForm.firstName" type="text" placeholder="Enter first name"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />

            </div>


            <!-- Last Name -->
            <div>

              <label class="block text-xs font-semibold text-slate-500 mb-2">
                Last Name
              </label>

              <input v-model="editForm.lastName" type="text" placeholder="Enter last name"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />

            </div>


            <!-- Phone -->
            <div>

              <label class="block text-xs font-semibold text-slate-500 mb-2">
                Phone Number
              </label>

              <input v-model="editForm.phoneNumber" type="tel" placeholder="Enter phone number"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />

            </div>


            <!-- Profile Image -->
            <div>

              <label class="block text-xs font-semibold text-slate-500 mb-2">
                Profile Image
              </label>

              <input type="file" accept="image/*" @change="handleImageChange"
                class="w-full text-xs text-slate-500 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600 file:font-semibold" />

              <p v-if="selectedImage" class="text-[11px] text-slate-400 mt-2">
                Selected: {{ selectedImage.name }}
              </p>

            </div>


            <!-- Buttons -->
            <div class="flex justify-end gap-3 pt-2">

              <button type="button" @click="closeEditProfile" :disabled="profilePending"
                class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 disabled:opacity-50">
                Cancel
              </button>


              <button type="submit" :disabled="profilePending"
                class="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {{
                  profilePending
                    ? 'Saving...'
                    : 'Save Changes'
                }}
              </button>

            </div>

          </form>

        </div>

      </div>

    </Transition>

  </div>


  <!-- ========================================= -->
  <!-- LOADING -->
  <!-- ========================================= -->

  <div v-else class="flex items-center justify-center py-20">

    <div class="text-center">

      <div class="w-10 h-10 mx-auto rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>

      <p class="text-sm text-slate-400 mt-4">
        Loading profile...
      </p>

    </div>

  </div>

</template>

<script setup lang="ts">

import {
  computed,
  ref,
  onMounted
} from 'vue'

import { useUserProfile } from '~/composables/useUserProfile'
import { useOrderProfile } from '~/composables/useOrderProfile'


/* =========================================
   AUTH
========================================= */

const {
  user
} = useAuth()


/* =========================================
   USER PROFILE
========================================= */

const {
  profile,
  profileImageUrl,
  pending: profilePending,
  fetchProfile,
  updateProfile
} = useUserProfile()


/* =========================================
   ORDERS
========================================= */

const {
  orders: userOrders,
  pending: ordersLoading,
  fetchOrders
} = useOrderProfile()


/* =========================================
   TYPES
========================================= */

interface AuthUser {
  id?: number | string
  username?: string
  email?: string
  role?: string
  createdAt?: string
  updatedAt?: string
}

interface UserProfile {
  userProfileId?: number
  userId?: number | string
  firstName?: string
  lastName?: string
  phoneNumber?: string | null
  profileImage?: string | null
}

interface Order {
  id: number | string
  name: string
  amount: number
  status: string
  createdAt: string
}

interface EditProfileForm {
  firstName: string
  lastName: string
  phoneNumber: string
  image: File | null
}


/* =========================================
   CURRENT USER
========================================= */

const currentUser = computed(() => {

  const authUser =
    user.value as AuthUser | null

  const userProfile =
    profile.value as UserProfile | null

  if (!authUser && !userProfile) {
    return null
  }

  const firstName =
    userProfile?.firstName || ''

  const lastName =
    userProfile?.lastName || ''

  const fullName = [
    firstName,
    lastName
  ]
    .filter(Boolean)
    .join(' ')

  return {

    id: authUser?.id,

    username:
      authUser?.username || '',

    email:
      authUser?.email || '',

    role:
      authUser?.role || 'USER',

    firstName,

    lastName,

    fullName,

    phoneNumber:
      userProfile?.phoneNumber || '',

    profileImage:
      userProfile?.profileImage || '',

    createdAt:
      authUser?.createdAt || '',

    updatedAt:
      authUser?.updatedAt || ''

  }

})


/* =========================================
   USER INITIAL
========================================= */

const userInitial = computed(() => {

  const name =
    currentUser.value?.fullName ||
    currentUser.value?.username ||
    'User'

  return name
    .trim()
    .split(/\s+/)
    .map(
      word =>
        word.charAt(0).toUpperCase()
    )
    .slice(0, 2)
    .join('')

})


/* =========================================
   NORMALIZE ORDERS
========================================= */

const allOrders = computed<Order[]>(() => {

  const rawOrders =
    Array.isArray(userOrders.value)
      ? userOrders.value
      : []

  return rawOrders.map(
    (order: any) => {

      const firstItem =
        order.orderItems?.[0] ||
        order.items?.[0] ||
        order.OrderItems?.[0] ||
        order.Items?.[0]


      const productName =
        order.productName ||
        order.name ||
        order.product?.name ||
        order.Product?.Name ||
        firstItem?.productName ||
        firstItem?.name ||
        firstItem?.product?.name ||
        firstItem?.Product?.Name ||
        'Order'


      const amount = Number(
        order.totalAmount ??
        order.amount ??
        order.total ??
        order.TotalAmount ??
        0
      )


      const status = String(
        order.status ??
        order.orderStatus ??
        order.Status ??
        order.OrderStatus ??
        'PENDING'
      ).toUpperCase()


      const createdAt =
        order.createdAt ??
        order.orderDate ??
        order.CreatedAt ??
        ''


      return {

        id:
          order.id ??
          order.orderId ??
          order.Id ??
          order.OrderId,

        name:
          productName,

        amount,

        status,

        createdAt

      }

    }
  )

})

/* =========================================
   RECENT ORDERS
========================================= */

const recentOrders = computed(() => {

  return [...allOrders.value]
    .filter(order => order.id !== undefined)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )

})


// ============================================
// RECENT ORDERS PAGINATION
// ============================================

const itemsPerPage = 4

const currentPage = ref(1)


// ============================================
// TOTAL PAGES
// ============================================

const totalPages = computed(() => {

  return Math.ceil(
    recentOrders.value.length /
    itemsPerPage
  )

})


// ============================================
// START INDEX
// ============================================

const startIndex = computed(() => {

  return (
    (currentPage.value - 1) *
    itemsPerPage
  )

})


// ============================================
// END INDEX
// ============================================

const endIndex = computed(() => {

  return (
    startIndex.value +
    itemsPerPage
  )

})


// ============================================
// PAGINATED ORDERS
// ============================================

const paginatedRecentOrders = computed(() => {

  return recentOrders.value.slice(
    startIndex.value,
    endIndex.value
  )

})


// ============================================
// NEXT PAGE
// ============================================

const nextPage = () => {

  if (
    currentPage.value <
    totalPages.value
  ) {

    currentPage.value++

  }

}


// ============================================
// PREVIOUS PAGE
// ============================================

const previousPage = () => {

  if (
    currentPage.value > 1
  ) {

    currentPage.value--

  }

}


// ============================================
// KEEP PAGE VALID
// ============================================

watch(
  () => recentOrders.value.length,

  () => {

    if (totalPages.value === 0) {

      currentPage.value = 1

    }
    else if (
      currentPage.value >
      totalPages.value
    ) {

      currentPage.value =
        totalPages.value

    }

  }
)

/* =========================================
   USER STATISTICS
========================================= */

const userStats = computed(() => {

  const orders =
    allOrders.value


  const totalOrders =
    orders.length


  const paidStatuses = [
    'PAID',
    'PROCESSING',
    'SHIPPING',
    'SHIPPED',
    'DELIVERED'
  ]


  const paidOrders =
    orders.filter(
      order =>
        paidStatuses.includes(
          order.status
        )
    ).length


  const pendingOrders =
    orders.filter(
      order =>
        order.status === 'PENDING'
    ).length


  const totalSpent =
    orders
      .filter(
        order =>
          paidStatuses.includes(
            order.status
          )
      )
      .reduce(
        (total, order) =>
          total +
          Number(order.amount || 0),
        0
      )


  return {

    totalOrders,

    totalSpent,

    paidOrders,

    pendingOrders

  }

})


/* =========================================
   EDIT PROFILE
========================================= */

const showEditProfile =
  ref(false)


const selectedImage =
  ref<File | null>(null)


const editForm =
  ref<EditProfileForm>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    image: null
  })


/* =========================================
   OPEN EDIT PROFILE
========================================= */

const openEditProfile = () => {

  editForm.value = {

    firstName:
      currentUser.value?.firstName || '',

    lastName:
      currentUser.value?.lastName || '',

    phoneNumber:
      currentUser.value?.phoneNumber || '',

    image:
      null

  }

  selectedImage.value = null

  showEditProfile.value = true

}


/* =========================================
   CLOSE EDIT PROFILE
========================================= */

const closeEditProfile = () => {

  if (profilePending.value) {
    return
  }

  showEditProfile.value = false

  selectedImage.value = null

  editForm.value.image = null

}


/* =========================================
   IMAGE CHANGE
========================================= */

const handleImageChange = (
  event: Event
) => {

  const input =
    event.target as HTMLInputElement

  const file =
    input.files?.[0] || null

  selectedImage.value = file

  editForm.value.image = file

}


/* =========================================
   SAVE PROFILE
========================================= */

const saveProfile = async () => {

  try {

    const firstName =
      editForm.value.firstName.trim()

    const lastName =
      editForm.value.lastName.trim()

    const phoneNumber =
      editForm.value.phoneNumber.trim()


    /* -------------------------------
       VALIDATION
    -------------------------------- */

    if (!firstName) {

      console.error(
        'First name is required'
      )

      return

    }


    if (!lastName) {

      console.error(
        'Last name is required'
      )

      return

    }


    /* -------------------------------
       UPDATE PROFILE
    -------------------------------- */

    const result =
      await updateProfile({

        firstName,

        lastName,

        phoneNumber,

        image:
          selectedImage.value

      })


    /* -------------------------------
       CHECK API RESULT
    -------------------------------- */

    if (!result.success) {

      console.error(
        'Profile update failed:',
        result.error
      )

      return

    }


    /* -------------------------------
       REFRESH PROFILE
    -------------------------------- */

    await fetchProfile()


    /* -------------------------------
       CLOSE MODAL
    -------------------------------- */

    showEditProfile.value =
      false

    selectedImage.value =
      null

    editForm.value.image =
      null


  } catch (error) {

    console.error(
      'Failed to update profile:',
      error
    )

  }

}


/* =========================================
   VIEW ORDER
========================================= */

const viewOrder = (
  order: Order
) => {

  navigateTo(
    `/orders/${order.id}`
  )

}


/* =========================================
   STATUS LABEL
========================================= */

const getStatusLabel = (
  status: string
) => {

  switch (status) {

    case 'PENDING':
      return 'Pending'

    case 'PAID':
      return 'Paid'

    case 'PROCESSING':
      return 'Processing'

    case 'SHIPPING':
      return 'Shipping'

    case 'SHIPPED':
      return 'Shipped'

    case 'DELIVERED':
      return 'Delivered'

    case 'CANCELLED':
      return 'Cancelled'

    case 'FAILED':
      return 'Failed'

    default:
      return status

  }

}


/* =========================================
   STATUS BADGE
========================================= */

const getStatusBadge = (
  status: string
) => {

  switch (status) {

    case 'PAID':
      return 'bg-emerald-50 text-emerald-600'

    case 'PROCESSING':
      return 'bg-blue-50 text-blue-600'

    case 'SHIPPING':
    case 'SHIPPED':
      return 'bg-indigo-50 text-indigo-600'

    case 'DELIVERED':
      return 'bg-green-50 text-green-600'

    case 'PENDING':
      return 'bg-amber-50 text-amber-600'

    case 'CANCELLED':
    case 'FAILED':
      return 'bg-red-50 text-red-600'

    default:
      return 'bg-slate-50 text-slate-600'

  }

}


/* =========================================
   DATE FORMAT
========================================= */

const formatDate = (
  date: string | undefined
) => {

  if (!date) {
    return '—'
  }


  const parsedDate =
    new Date(date)


  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {

    return '—'

  }


  return parsedDate.toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }
  )

}


/* =========================================
   INITIAL LOAD
========================================= */

onMounted(async () => {

  try {

    await Promise.all([
      fetchProfile(),
      fetchOrders()
    ])


  } catch (error) {

    console.error(
      'Failed to load profile page:',
      error
    )

  }

})

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>