<template>
  <!-- Render content only when user is logged in -->
  <div v-if="currentUser" class="space-y-6 sm:space-y-8">

    <!-- Top Action Bar -->
    <div class="flex items-center justify-between bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up">
      <div class="flex items-center gap-3 sm:gap-4 min-w-0">
        <div
          class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm shrink-0 shadow-sm">
          {{ userInitial }}
        </div>

        <div class="min-w-0">
          <h1 class="text-sm sm:text-base font-bold text-slate-800 truncate">
            Welcome back, {{ currentUser?.username || 'Admin' }}
          </h1>

          <p class="text-xs text-slate-400 truncate">
            {{ currentUser?.email || 'System Administrator' }}
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

      <!-- Total Revenue -->
      <div
        class="card-cool card-glow bg-white p-5 sm:p-6 rounded-2xl border border-emerald-100/80 flex items-center justify-between group animate-fade-up stagger-1 cursor-default">
        <div>
          <span class="text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Total Revenue
          </span>

          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            <span v-if="revenueLoading" class="skeleton-shimmer inline-block w-20 h-8 rounded-lg">&nbsp;</span>
            <span v-else class="text-emerald-600 tabular-nums">
              ${{ totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </span>
          </h2>

          <p class="text-[11px] text-slate-400 mt-1">
            Paid transactions
          </p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
          <span class="text-emerald-500 text-lg">$</span>
        </div>
      </div>


      <!-- Total Orders -->
      <div
        class="card-cool card-glow bg-white p-5 sm:p-6 rounded-2xl border border-indigo-100/80 flex items-center justify-between group animate-fade-up stagger-2 cursor-default">
        <div>
          <span class="text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Total Orders
          </span>

          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            <span v-if="ordersPending" class="skeleton-shimmer inline-block w-12 h-8 rounded-lg">&nbsp;</span>
            <span v-else class="text-indigo-600 tabular-nums">
              {{ orders.length }}
            </span>
          </h2>
        </div>
        <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
          <span class="text-indigo-500 text-lg">📦</span>
        </div>
      </div>


      <!-- Total Products -->
      <div
        class="card-cool card-glow bg-white p-5 sm:p-6 rounded-2xl border border-blue-100/80 flex items-center justify-between group animate-fade-up stagger-3 cursor-default">
        <div>
          <span class="text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Total Products
          </span>

          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            <span v-if="productsPending" class="skeleton-shimmer inline-block w-12 h-8 rounded-lg">&nbsp;</span>
            <span v-else class="text-blue-600 tabular-nums">
              {{ products.length }}
            </span>
          </h2>
        </div>
        <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
          <span class="text-blue-500 text-lg">🏷️</span>
        </div>
      </div>


      <!-- Pending Orders -->
      <div
        class="card-cool card-glow bg-white p-5 sm:p-6 rounded-2xl border border-amber-100/80 flex items-center justify-between group animate-fade-up stagger-4 cursor-default">
        <div>
          <span class="text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Pending Orders
          </span>

          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            <span v-if="pendingOrdersLoading" class="skeleton-shimmer inline-block w-12 h-8 rounded-lg">&nbsp;</span>
            <span v-else class="text-amber-600 tabular-nums">
              {{ pendingOrdersCount }}
            </span>
          </h2>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
          <span class="text-amber-500 text-lg">⏳</span>
        </div>
      </div>

    </div>


    <!-- ========================= -->
    <!-- ANALYTICS -->
    <!-- ========================= -->

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

      <!-- ========================= -->
      <!-- REVENUE CHART -->
      <!-- ========================= -->

      <div class="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up stagger-5">

        <!-- Chart Header -->
        <div class="flex items-center justify-between mb-6">

          <div>
            <h3 class="text-lg font-bold text-slate-800">
              Revenue Chart
            </h3>

            <p class="text-xs text-slate-400 mt-1">
              {{ revenuePeriod === 'day'
                ? `Daily revenue - ${currentMonthName} ${selectedYear}`
                : `Monthly revenue - ${selectedYear}`
              }}
            </p>
          </div>


          <!-- Day / Month -->
          <div class="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">

            <button @click="changeRevenuePeriod('day')" class="px-3 py-1 rounded-lg transition-all" :class="revenuePeriod === 'day'
                ? 'bg-white shadow-sm text-slate-800'
                : 'text-slate-500 hover:text-slate-800'
              ">
              Day
            </button>

            <button @click="changeRevenuePeriod('month')" class="px-3 py-1 rounded-lg transition-all" :class="revenuePeriod === 'month'
                ? 'bg-white shadow-sm text-slate-800'
                : 'text-slate-500 hover:text-slate-800'
              ">
              Month
            </button>

          </div>
        </div>


        <!-- Loading -->
        <div v-if="revenueLoading" class="h-64 flex items-center justify-center">
          <div class="text-sm text-slate-400">
            Loading revenue...
          </div>
        </div>


        <!-- Error -->
        <div v-else-if="revenueError" class="h-64 flex items-center justify-center">
          <div class="text-sm text-rose-500">
            {{ revenueError }}
          </div>
        </div>


        <!-- Chart -->
        <div v-else>

          <!-- Chart Area -->
          <div class="h-64 w-full flex items-end gap-2 px-2 pt-8 overflow-x-auto">

            <div v-for="item in revenueData" :key="item.label" class="h-full flex-1 min-w-[24px] flex items-end group">

              <!-- Bar -->
              <div
                class="w-full bg-gradient-to-t from-indigo-500 to-indigo-300 rounded-t-lg transition-all hover:brightness-110 relative"
                :style="{
                  height: `${getBarHeight(item.revenue)}%`
                }">

                <!-- Tooltip -->
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div class="bg-slate-800 text-white text-[10px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap">
                    ${{ item.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </div>
                </div>

              </div>

            </div>

          </div>


          <!-- Labels -->
          <div class="flex gap-2 px-2 mt-4 overflow-x-auto">

            <div v-for="item in revenueData" :key="item.label"
              class="flex-1 min-w-[24px] text-center text-[10px] text-slate-400 font-medium">
              {{ item.label }}
            </div>

          </div>


          <!-- No Revenue -->
          <div v-if="!revenueData.length" class="text-center text-sm text-slate-400 py-8">
            No revenue data available.
          </div>

        </div>

      </div>


      <!-- ========================= -->
      <!-- RECENT ORDERS -->
      <!-- ========================= -->

      <div class="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between card-cool animate-fade-up stagger-6">

        <div>

          <div class="flex items-center justify-between mb-6">

            <h3 class="text-lg font-bold text-slate-800">
              Recent Orders
            </h3>

            <NuxtLink to="/orders" class="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              View All
            </NuxtLink>

          </div>


          <!-- Loading -->
          <div v-if="ordersPending" class="space-y-3">
            <div v-for="i in 4" :key="i" class="h-12 bg-slate-100 animate-pulse rounded-xl"></div>
          </div>


          <!-- Empty -->
          <div v-else-if="!recentOrders.length" class="text-xs text-slate-400 py-6 text-center">
            No recent orders found.
          </div>


          <!-- Orders -->
          <div v-else class="space-y-3">

            <div v-for="order in recentOrders" :key="order.orderId"
              class="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all duration-250 hover:translate-x-1 hover:shadow-sm">

              <div class="flex items-center gap-3">

                <div
                  class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                  #{{ order.orderId }}
                </div>

                <div>

                  <p class="text-sm font-semibold text-slate-800 line-clamp-1">
                    {{
                      order.deliveryLocation?.contactName ||
                      `User #${order.userId}`
                    }}
                  </p>

                  <p class="text-xs text-slate-400">
                    {{ formatDate(order.createdAt) }}
                  </p>

                </div>

              </div>


              <div class="text-right">

                <span class="text-sm font-bold text-slate-900">
                  ${{ order.totalAmount.toFixed(2) }}
                </span>

                <div class="mt-0.5">

                  <span :class="getStatusBadge(order.orderStatus)"
                    class="text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    {{ getStatusLabel(order.orderStatus) }}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>


        <NuxtLink to="/orders"
          class="w-full mt-6 py-2.5 text-center text-xs font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors block">
          Show details
        </NuxtLink>

      </div>

    </div>

    <!-- ========================= -->
    <!-- LOW STOCK ALERT -->
    <!-- ========================= -->

    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden card-cool animate-fade-up stagger-7">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01M10.29 3.86l-8.82 15a2 2 0 001.71 3h17.64a2 2 0 001.71-3l-8.82-15a2 2 0 00-3.42 0z" />
            </svg>
          </div>

          <div>
            <h3 class="text-lg font-bold text-slate-800">
              Low Stock Alert
            </h3>

            <p class="text-xs text-slate-400 mt-0.5">
              Products that need restocking
            </p>
          </div>
        </div>

        <NuxtLink to="/products" class="text-xs font-bold text-indigo-600 hover:text-indigo-700">
          View Products
        </NuxtLink>
      </div>

      <!-- Loading -->
      <div v-if="lowStockLoading" class="p-6 space-y-3">
        <div v-for="i in 3" :key="i" class="h-16 bg-slate-100 animate-pulse rounded-xl"></div>
      </div>

      <!-- Error -->
      <div v-else-if="lowStockError" class="p-8 text-center">
        <p class="text-sm text-rose-500">
          {{ lowStockError }}
        </p>
      </div>

      <!-- Empty -->
      <div v-else-if="!lowStockProducts.length" class="p-10 text-center">
        <div class="w-12 h-12 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-3">
          <svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <p class="text-sm font-semibold text-slate-700">
          All products are well stocked
        </p>

        <p class="text-xs text-slate-400 mt-1">
          No products need restocking right now.
        </p>
      </div>

      <!-- Low Stock Products -->
      <div v-else class="divide-y divide-slate-100">
        <div v-for="product in lowStockProducts" :key="product.productVariantId"
          class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-indigo-50/40 transition-all duration-250 hover:pl-7">
          <!-- Product -->
          <div class="flex items-center gap-4 min-w-0">

            <!-- Image -->
            <div class="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
              <img v-if="product.image" :src="product.image" :alt="product.productName"
                class="w-full h-full object-cover" />

              <div v-else class="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                IMG
              </div>
            </div>

            <!-- Info -->
            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-800 truncate">
                {{ product.productName }}
              </p>

              <p class="text-xs text-slate-400 mt-1">
                {{ product.color || 'N/A' }}
                <span class="mx-1">•</span>
                {{ product.capacity || 'N/A' }}
                <span class="mx-1">•</span>
                {{ product.connectivityType || 'N/A' }}
              </p>
            </div>
          </div>

          <!-- Stock -->
          <div class="flex items-center gap-4 ml-4">

            <div class="hidden sm:block text-right">
              <p class="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Stock
              </p>

              <p class="text-sm font-bold mt-0.5" :class="product.stockQuantity <= 2
                  ? 'text-rose-600'
                  : 'text-amber-600'
                ">
                {{ product.stockQuantity }}
              </p>
            </div>

            <!-- Badge -->
            <span class="px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap" :class="product.stockQuantity <= 2
                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                : 'bg-amber-50 text-amber-600 border border-amber-100'
              ">
              {{
                product.stockQuantity <= 2 ? 'Critical' : 'Low Stock' }} </span>
          </div>
        </div>
      </div>
    </div>


    <!-- Product list -->
    <DashboardProductList />

  </div>
</template>


<script setup lang="ts">

import { useLowStock } from '~/composables/useLowStock'
import { OrderStatus } from '~/types/order'

definePageMeta({
  middleware: ['auth']
})

// ============================================
// LOW STOCK
// ============================================

const {
  lowStockProducts,
  loading: lowStockLoading,
  error: lowStockError,
  fetchLowStockProducts
} = useLowStock()


// ============================================
// AUTH
// ============================================

const { user: currentUser } = useAuth()

const userInitial = computed(() => {
  return currentUser.value?.username
    ? currentUser.value.username.charAt(0).toUpperCase()
    : 'A'
})


// ============================================
// ORDERS
// ============================================

const {
  orders,
  pendingOrdersCount,
  ordersPending,
  pendingOrdersLoading
} = useOrder()


// ============================================
// PRODUCTS
// ============================================

const {
  products,
  pending: productsPending
} = await useProduct()


// ============================================
// REVENUE
// ============================================

const {
  revenue,
  loading: revenueLoading,
  error: revenueError,
  fetchRevenue
} = useRevenue()


// Current chart period
const revenuePeriod = ref<'day' | 'month'>('day')

// Current year
const selectedYear = ref(new Date().getFullYear())

// Current month
const selectedMonth = ref(new Date().getMonth() + 1)


// Month name
const currentMonthName = computed(() => {

  return new Date(
    selectedYear.value,
    selectedMonth.value - 1,
    1
  ).toLocaleDateString('en-US', {
    month: 'long'
  })

})


// Revenue chart data
const revenueData = computed(() => {
  return revenue.value?.data || []
})


// Total revenue
const totalRevenue = computed(() => {
  return revenue.value?.totalRevenue || 0
})


// Maximum revenue for chart
const maxRevenue = computed(() => {

  if (!revenueData.value.length) {
    return 0
  }

  return Math.max(
    ...revenueData.value.map(item => item.revenue)
  )
})


// Calculate bar height
const getBarHeight = (value: number) => {

  if (maxRevenue.value <= 0) {
    return 0
  }

  const height =
    (value / maxRevenue.value) * 100

  // Keep small revenue visible
  return Math.max(height, value > 0 ? 5 : 0)
}


// Change Day / Month
const changeRevenuePeriod = async (
  period: 'day' | 'month'
) => {

  revenuePeriod.value = period

  await loadRevenue()

}


// Fetch revenue
const loadRevenue = async () => {

  if (revenuePeriod.value === 'day') {

    await fetchRevenue(
      'day',
      selectedYear.value,
      selectedMonth.value
    )

  } else {

    await fetchRevenue(
      'month',
      selectedYear.value
    )

  }

}


// ============================================
// RECENT ORDERS
// ============================================

const recentOrders = computed(() => {

  return [...orders.value]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 4)

})


// ============================================
// ORDER STATUS
// ============================================

const getStatusLabel = (
  status: OrderStatus
) => {

  switch (status) {

    case OrderStatus.PENDING:
      return 'Pending'

    case OrderStatus.PROCESSING:
      return 'Processing'

    case OrderStatus.SHIPPING:
      return 'Shipping'

    case OrderStatus.DELIVERED:
      return 'Delivered'

    case OrderStatus.CANCELLED:
      return 'Cancelled'

    default:
      return 'Unknown'

  }

}

const getStatusBadge = (
  status: OrderStatus
) => {

  switch (status) {

    case OrderStatus.PENDING:
      return 'bg-amber-50 text-amber-600'

    case OrderStatus.PROCESSING:
      return 'bg-blue-50 text-blue-600'

    case OrderStatus.SHIPPING:
      return 'bg-purple-50 text-purple-600'

    case OrderStatus.DELIVERED:
      return 'bg-emerald-50 text-emerald-600'

    case OrderStatus.CANCELLED:
      return 'bg-rose-50 text-rose-600'

    default:
      return 'bg-slate-100 text-slate-500'

  }

}

// ============================================
// DATE
// ============================================

const formatDate = (dateStr: string) => {

  if (!dateStr) {
    return ''
  }

  return new Date(dateStr).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric'
    }
  )

}

// ============================================
// INITIAL LOAD
// ============================================

await Promise.all([
  loadRevenue(),
  fetchLowStockProducts()
])

</script>