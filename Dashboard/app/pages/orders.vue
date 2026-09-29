<template>
  <!-- Lock main page scroll when order detail drawer is open -->
  <div v-if="currentUser" :class="{ 'overflow-hidden h-screen': selectedOrder }"
    class="p-1 space-y-6 bg-slate-50 min-h-screen text-slate-800 relative" @click="isStatusDropdownOpen = false">

    <!-- HEADER -->
    <div
      class="flex flex-col sm:flex-row sm:items-center p-4 justify-between gap-4 bg-white rounded-lg border-slate-100 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">
          Orders Management
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Track customer orders, delivery status, and payment details.
        </p>
      </div>
    </div>

    <!-- FILTERS & SEARCH -->
    <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up flex flex-col space-y-4">
      <!-- Order Status Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 text-xs font-semibold">
        <button v-for="status in ['All', 'PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED']" :key="status"
          @click="selectedOrderStatus = status" :class="[
            'px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap uppercase',
            selectedOrderStatus === status
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]">
          {{ status }}
        </button>
      </div>

      <!-- Search & Payment Status Dropdown -->
      <div class="flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div class="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div class="relative flex-1 max-w-md">
            <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input v-model="searchQuery" type="text" placeholder="Search by customer name, phone, or order ID..."
              class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
          </div>

          <select v-model="selectedDeliveryMethod"
            class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
            <option value="ALL">All Delivery Methods</option>
            <option :value="DeliveryMethod.MOTOR">MOTOR</option>
            <option :value="DeliveryMethod.PICKUP">PICKUP</option>
          </select>
        </div>
      </div>
    </div>

    <!-- ORDERS TABLE -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead
            class="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4">Order ID</th>
              <th class="px-6 py-4">Customer</th>
              <th class="px-6 py-4">Date</th>
              <th class="px-6 py-4">Total</th>
              <th class="px-6 py-4">Delivery Method</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100">
            <tr v-if="ordersPending">
              <td colspan="7" class="px-6 py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <span class="text-sm text-slate-400">Loading orders...</span>
                </div>
              </td>
            </tr>

            <tr v-else-if="!filteredOrders || filteredOrders.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                No orders found.
              </td>
            </tr>

            <template v-else>
              <tr v-for="order in filteredOrders" :key="order.orderId" class="hover:bg-slate-50/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap font-mono font-medium text-slate-700">
                  #{{ order.orderId }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-semibold text-slate-800">
                  {{ order.deliveryLocation?.contactName || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-slate-500">
                  {{ formatDate(order.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">
                  ${{ order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="{
                    'bg-sky-100 text-sky-700 border-sky-200': order.deliveryMethod === DeliveryMethod.MOTOR,
                    'bg-violet-100 text-violet-700 border-violet-200': order.deliveryMethod === DeliveryMethod.PICKUP
                  }" class="px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wide">
                    {{ order.deliveryMethod }}
                  </span>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="{
                    'bg-amber-100 text-amber-800 border-amber-200': order.orderStatus === OrderStatus.PROCESSING,
                    'bg-blue-50 text-blue-700 border-blue-200': order.orderStatus === OrderStatus.SHIPPING,
                    'bg-emerald-50 text-emerald-700 border-emerald-200': order.orderStatus === OrderStatus.DELIVERED,
                    'bg-slate-100 text-slate-600 border-slate-200': order.orderStatus === OrderStatus.PENDING || order.orderStatus === OrderStatus.CANCELLED
                  }" class="px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wide">
                    {{ order.orderStatus }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <button @click="openOrderDetail(order)"
                    class="px-3.5 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer">
                    View
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div v-if="filteredOrders.length > 0"
        class="flex items-center justify-center gap-3 px-6 py-4 border-t border-slate-100 bg-white">

        <!-- Previous -->
        <button @click="previousPage" :disabled="currentPage === 1"
          class="px-8 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-blue-700 text-sm hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Previous page">
          Back
        </button>

        <!-- Page Info -->
        <span class="text-sm font-medium text-slate-600 min-w-[90px] text-center">
          {{ currentPage }} / {{ totalPages }}
        </span>

        <!-- Next -->
        <button @click="nextPage" :disabled="currentPage === totalPages"
          class="px-8 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-blue-700 text-sm hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Next page">
          Next
        </button>

      </div>

    </div>

    <!-- ORDER DETAIL DRAWER -->
    <div>
      <!-- Backdrop -->
      <transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300" leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="selectedOrder" @click="closeOrderDetail" class="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-xs">
        </div>
      </transition>

      <!-- Slide-Over Panel -->
      <transition enter-active-class="transform transition duration-300 ease-in-out" enter-from-class="translate-x-full"
        enter-to-class="translate-x-0" leave-active-class="transform transition duration-300 ease-in-out"
        leave-from-class="translate-x-0" leave-to-class="translate-x-full">
        <div v-if="selectedOrder"
          class="fixed inset-y-0 right-0 w-full max-w-xl bg-slate-50 text-slate-800 shadow-2xl z-50 flex flex-col border-l border-slate-200 h-full">

          <!-- Sticky Header -->
          <div class="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
            <h2 class="text-lg font-bold text-slate-900">Order Details</h2>
            <button @click="closeOrderDetail"
              class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Dedicated Scroll Container for Order Detail Panel -->
          <div class="p-6 space-y-5 overflow-y-auto flex-1 h-full">

            <!-- Title & Status Action Bar -->
            <div class="space-y-1">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <div class="flex items-center gap-2">
                  <h3 class="text-xl font-bold text-slate-900">Order #{{ selectedOrder.orderId }}</h3>
                  <span :class="{
                    'bg-amber-100 text-amber-800 border-amber-200/60': selectedOrder.orderStatus === OrderStatus.PROCESSING,
                    'bg-blue-100 text-blue-800 border-blue-200/60': selectedOrder.orderStatus === OrderStatus.SHIPPING,
                    'bg-emerald-100 text-emerald-800 border-emerald-200/60': selectedOrder.orderStatus === OrderStatus.DELIVERED,
                    'bg-slate-100 text-slate-700 border-slate-200/60': selectedOrder.orderStatus === OrderStatus.PENDING,
                    'bg-rose-100 text-rose-800 border-rose-200/60': selectedOrder.orderStatus === OrderStatus.CANCELLED
                  }" class="px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase">
                    {{ selectedOrder.orderStatus }}
                  </span>
                </div>

                <!-- Action Buttons & Change Status Dropdown -->
                <div class="flex items-center gap-2">

                  <!-- INTERACTIVE STATUS DROPDOWN -->
                  <div class="relative" @click.stop>
                    <button :disabled="isUpdatingStatus" @click="isStatusDropdownOpen = !isStatusDropdownOpen"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition-colors cursor-pointer disabled:opacity-50">
                      <span>{{ isUpdatingStatus ? 'Updating...' : 'Change Status' }}</span>
                      <ChevronDown class="w-3.5 h-3.5 text-slate-500 transition-transform duration-200"
                        :class="{ 'rotate-180': isStatusDropdownOpen }" />
                    </button>

                    <!-- Dropdown Menu -->
                    <div v-if="isStatusDropdownOpen"
                      class="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1 overflow-hidden">
                      <button v-for="status in statusOptions" :key="status" @click="handleUpdateStatus(status)"
                        class="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-between cursor-pointer">
                        <span>{{ status }}</span>
                        <Check v-if="selectedOrder.orderStatus === status" class="w-3.5 h-3.5 text-indigo-600" />
                      </button>
                    </div>
                  </div>

                  <!-- Cancel Order Quick Button -->
                  <button :disabled="isUpdatingStatus || selectedOrder.orderStatus === OrderStatus.CANCELLED"
                    @click="handleUpdateStatus(OrderStatus.CANCELLED)"
                    class="px-3 py-1.5 border border-rose-200 rounded-lg text-xs font-medium text-rose-600 bg-white hover:bg-rose-50 shadow-xs transition-colors cursor-pointer disabled:opacity-50">
                    Cancel Order
                  </button>
                </div>
              </div>

              <p class="text-xs text-slate-500">
                Created at: {{ formatDate(selectedOrder.createdAt, true) }}
              </p>
              <p class="text-xs text-slate-900 font-semibold mt-0.5">
                Total: ${{ selectedOrder.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </p>
            </div>

            <!-- Customer Information -->
            <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
              <div class="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <User class="w-4 h-4 text-slate-600" />
                <span>Customer Information</span>
              </div>
              <div class="text-xs space-y-1.5 pl-6">
                <div class="font-bold text-slate-900">{{ selectedOrder.deliveryLocation?.contactName || 'N/A' }}</div>
                <div class="flex items-center gap-2 text-slate-600">
                  <Phone class="w-3.5 h-3.5 text-slate-400" />
                  <span>{{ selectedOrder.deliveryLocation?.phoneNumber || 'N/A' }}</span>
                </div>
              </div>
            </div>

            <!-- Delivery Information -->
            <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
              <div class="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <MapPin class="w-4 h-4 text-slate-600" />
                <span>Delivery Information</span>
              </div>
              <div class="text-xs grid grid-cols-3 gap-y-2.5 gap-x-4 pl-6 text-slate-600">
                <div class="text-slate-400">Contact Name</div>
                <div class="col-span-2 text-slate-800 font-medium">{{ selectedOrder.deliveryLocation?.contactName }}
                </div>

                <div class="text-slate-400">Phone Number</div>
                <div class="col-span-2 text-slate-800 font-medium">{{ selectedOrder.deliveryLocation?.phoneNumber }}
                </div>

                <div class="text-slate-400">City</div>
                <div class="col-span-2 text-slate-800 font-medium">{{ selectedOrder.deliveryLocation?.city }}</div>

                <div class="text-slate-400">District</div>
                <div class="col-span-2 text-slate-800 font-medium">{{ selectedOrder.deliveryLocation?.district }}</div>

                <div class="text-slate-400">Address</div>
                <div class="col-span-2 text-slate-800 font-medium">{{ selectedOrder.deliveryLocation?.address }}</div>

                <div class="text-slate-400 self-center">Delivery Method</div>
                <div class="col-span-2">
                  <span
                    class="px-2 py-0.5 bg-sky-100 text-sky-700 font-bold text-[10px] rounded uppercase tracking-wider">
                    {{ selectedOrder.deliveryMethod }}
                  </span>
                </div>

                <div class="text-slate-400">Delivery Fee</div>
                <div class="col-span-2 text-slate-800 font-semibold">${{ selectedOrder.deliveryFee.toFixed(2) }}</div>
              </div>
            </div>

            <!-- Order Items Table -->
            <div class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <div class="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <ShoppingCart class="w-4 h-4 text-slate-600" />
                <span>Order Items</span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 border-y border-slate-100 text-slate-500 font-semibold">
                    <tr>
                      <th class="py-2.5 px-2">Product</th>
                      <th class="py-2.5 px-2">Variant</th>
                      <th class="py-2.5 px-2 text-center">Qty</th>
                      <th class="py-2.5 px-2 text-right">Unit Price</th>
                      <th class="py-2.5 px-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 text-slate-700">
                    <tr v-for="item in selectedOrder.orderItems" :key="item.orderItemId">
                      <td class="py-3 px-2 font-medium text-slate-900">
                        <div class="flex items-center gap-2">
                          <div
                            class="w-9 h-9 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                            <Smartphone class="w-5 h-5 text-slate-500" />
                          </div>
                          <span class="line-clamp-2">{{ item.productName }}</span>
                        </div>
                      </td>
                      <td class="py-3 px-2 text-slate-500 whitespace-nowrap">{{ formatVariant(item) }}</td>
                      <td class="py-3 px-2 text-center font-medium">{{ item.quantity }}</td>
                      <td class="py-3 px-2 text-right">${{ item.unitPrice.toLocaleString('en-US', {
                        minimumFractionDigits: 2
                      }) }}</td>
                      <td class="py-3 px-2 text-right font-semibold text-slate-900">${{ (item.unitPrice *
                        item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div
                class="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600 max-w-xs ml-auto text-right">
                <div class="flex justify-between">
                  <span class="text-slate-400">Subtotal</span>
                  <span class="font-medium text-slate-800">${{ selectedOrder.subtotal.toLocaleString('en-US', {
                    minimumFractionDigits: 2
                  }) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-400">Delivery Fee</span>
                  <span class="font-medium text-slate-800">${{ selectedOrder.deliveryFee.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between text-sm font-bold text-slate-900 pt-1">
                  <span>Total</span>
                  <span>${{ selectedOrder.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </transition>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Search,
  X,
  ChevronDown,
  Check,
  User,
  Phone,
  MapPin,
  ShoppingCart,
  Smartphone,
} from 'lucide-vue-next'
import { OrderStatus, DeliveryMethod, type OrderResponse, type OrderItemResponse } from '~/types/order'

definePageMeta({
  middleware: ['auth']
})

// ============================================
// AUTH
// ============================================
const { user: currentUser } = useAuth()

const userInitial = computed(() => {
  return currentUser.value?.username
    ? currentUser.value.username.charAt(0).toUpperCase()
    : 'A'
})

const { orders, ordersPending, updateOrderStatus } = useOrder()
const searchQuery = ref<string>('')
const selectedOrderStatus = ref<string>('All')
const selectedDeliveryMethod = ref<string>('ALL')

const selectedOrder = ref<OrderResponse | null>(null)
const isStatusDropdownOpen = ref<boolean>(false)
const isUpdatingStatus = ref<boolean>(false)

// Extract enum values cleanly
const statusOptions: OrderStatus[] = Object.values(OrderStatus)

// Helper: Format item variant attributes
function formatVariant(item: OrderItemResponse): string {
  const parts = [item.capacity, item.color, item.connectivity].filter(Boolean)
  return parts.length > 0 ? parts.join(' / ') : 'Default'
}

// Helper: Format ISO date string
function formatDate(dateString: string, full = false): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (full) {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Map OrderStatus enum to numeric value expected by the updateOrderStatus API method signature
function mapStatusToNumeric(status: OrderStatus): number {
  const orderStatusMap: Record<OrderStatus, number> = {
    [OrderStatus.PENDING]: 0,
    [OrderStatus.PROCESSING]: 1,
    [OrderStatus.SHIPPING]: 2,
    [OrderStatus.DELIVERED]: 3,
    [OrderStatus.CANCELLED]: 4
  }
  return orderStatusMap[status] ?? 0
}

// Filtered reactive list based on search and status inputs
const filteredOrders = computed<OrderResponse[]>(() => {
  if (!orders.value) return []

  return orders.value.filter((order: OrderResponse) => {
    const query = searchQuery.value.toLowerCase().trim()

    const matchesName =
      (order.deliveryLocation?.contactName?.toLowerCase().includes(query) ?? false) ||
      (order.deliveryLocation?.phoneNumber?.includes(query) ?? false) ||
      order.orderId.toString().includes(query)

    const matchesOrderStatus = selectedOrderStatus.value === 'All'
      ? true
      : order.orderStatus?.toUpperCase() === selectedOrderStatus.value.toUpperCase()

    const matchesDeliveryMethod =
      selectedDeliveryMethod.value === 'ALL'
        ? true
        : order.deliveryMethod === selectedDeliveryMethod.value

    return matchesName && matchesOrderStatus && matchesDeliveryMethod
  })
})


// ============================================
// PAGINATION
// ============================================

const itemsPerPage = 9
const currentPage = ref(1)

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / itemsPerPage)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage
})

const endIndex = computed(() => {
  return startIndex.value + itemsPerPage
})

const paginatedOrders = computed(() => {
  return filteredOrders.value.slice(
    startIndex.value,
    endIndex.value
  )
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

watch(
  [searchQuery, selectedOrderStatus, selectedDeliveryMethod],
  () => {
    currentPage.value = 1
  }
)


function openOrderDetail(order: OrderResponse): void {
  selectedOrder.value = order
  isStatusDropdownOpen.value = false
}

function closeOrderDetail(): void {
  selectedOrder.value = null
  isStatusDropdownOpen.value = false
}

// API status update handler
async function handleUpdateStatus(newStatus: OrderStatus): Promise<void> {
  if (!selectedOrder.value || isUpdatingStatus.value) return

  isUpdatingStatus.value = true

  // Convert enum to numeric value required by updateOrderStatus(orderId, status)
  const numericStatus = mapStatusToNumeric(newStatus)
  const res = await updateOrderStatus(selectedOrder.value.orderId, numericStatus)

  if (res.success) {
    selectedOrder.value.orderStatus = newStatus
  } else {
    alert(res.error || 'Failed to update order status')
  }

  isUpdatingStatus.value = false
  isStatusDropdownOpen.value = false
}
</script>