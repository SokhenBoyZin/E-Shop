<template>
  <div v-if="currentUser" class="p-1 space-y-6 bg-slate-50 min-h-screen text-slate-800">

    <!-- HEADER -->
    <div
      class="flex flex-col sm:flex-row sm:items-center p-4 justify-between gap-4 bg-white rounded-lg border-slate-100 shadow-sm">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">
          Transactions Management
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Monitor incoming payments, transaction references, and payment statuses.
        </p>
      </div>
    </div>

    <!-- SUMMARY CARDS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up flex flex-col justify-between">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Transactions</span>
        <div class="mt-2 flex items-baseline justify-between">
          <span class="text-3xl font-extrabold text-slate-900">{{ summary.total }}</span>
          <span class="text-xs font-semibold text-slate-500">${{ summary.totalAmount.toLocaleString() }}</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up flex flex-col justify-between">
        <span class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Paid</span>
        <div class="mt-2 flex items-baseline justify-between">
          <span class="text-3xl font-extrabold text-emerald-600">{{ summary.paid }}</span>
          <span class="text-xs font-semibold text-emerald-600/80">${{ summary.paidAmount.toLocaleString() }}</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up flex flex-col justify-between">
        <span class="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending</span>
        <div class="mt-2 flex items-baseline justify-between">
          <span class="text-3xl font-extrabold text-amber-600">{{ summary.pending }}</span>
          <span class="text-xs font-semibold text-amber-600/80">${{ summary.pendingAmount.toLocaleString() }}</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up flex flex-col justify-between">
        <span class="text-xs font-bold text-red-600 uppercase tracking-wider">Failed</span>
        <div class="mt-2 flex items-baseline justify-between">
          <span class="text-3xl font-extrabold text-red-600">{{ summary.failed }}</span>
          <span class="text-xs font-semibold text-red-600/80">${{ summary.failedAmount.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- FILTERS & SEARCH -->
    <div
      class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up flex flex-col sm:flex-row items-center gap-4 justify-between">
      <div class="flex flex-1 items-center gap-3 w-full sm:w-auto">
        <div class="relative flex-1 max-w-md">
          <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model="searchQuery" type="text" placeholder="Search by Transaction ID, Order ID, or Ref..."
            class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
        </div>

        <select v-model="selectedStatus"
          class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
          <option :value="null">All Statuses</option>
          <option :value="PaymentStatus.PAID">Paid</option>
          <option :value="PaymentStatus.PENDING">Pending</option>
          <option :value="PaymentStatus.FAILED">Failed</option>
        </select>
      </div>
    </div>

    <!-- TRANSACTIONS TABLE -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead
            class="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4">Transaction ID</th>
              <th class="px-6 py-4">Order ID</th>
              <th class="px-6 py-4">Bank / Method</th>
              <th class="px-6 py-4">Amount</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">Paid At</th>
              <th class="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100">
            <tr v-if="transactionsPending">
              <td colspan="7" class="px-6 py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <span class="text-sm text-slate-400">Loading transactions...</span>
                </div>
              </td>
            </tr>

            <tr v-else-if="transactionsError">
              <td colspan="7" class="px-6 py-16 text-center">
                <div class="text-sm text-red-500">{{ transactionsError }}</div>
                <button @click="fetchTransactions"
                  class="mt-3 text-xs font-semibold text-indigo-600 hover:underline cursor-pointer">
                  Try Again
                </button>
              </td>
            </tr>

            <tr v-else-if="!filteredTransactions || filteredTransactions.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                No transactions found.
              </td>
            </tr>

            <template v-else>
              <tr v-for="tx in paginatedTransactions" :key="tx.transactionId"
                class="hover:bg-slate-50/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-bold text-slate-800">#TX-{{ tx.transactionId }}</div>
                  <div class="text-xs text-slate-400 font-mono">
                    {{ tx.transactionRef || 'No Ref' }}
                  </div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Order #{{ tx.orderId }}
                  </span>
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-xs text-slate-800 font-semibold">{{ tx.bankName || 'Standard Bank' }}</div>
                  <div class="text-[11px] text-slate-400">Method ID: #{{ tx.paymentMethodId }}</div>
                </td>

                <td class="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                  ${{ tx.amount.toFixed(2) }}
                </td>

                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(tx.paymentStatus)"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border">
                    <span :class="getStatusDotClass(tx.paymentStatus)" class="w-1.5 h-1.5 rounded-full"></span>
                    {{ tx.paymentStatus }}
                  </span>
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                  {{ tx.paidAt ? new Date(tx.paidAt).toLocaleString() : '—' }}
                </td>

                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <button @click="openDetailDrawer(tx)"
                    class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-xs rounded-lg transition-colors cursor-pointer">
                    View
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div v-if="filteredTransactions.length > 0"
        class="flex items-center justify-center gap-3 px-6 py-4 border-t border-slate-100 bg-white">
        <button @click="previousPage" :disabled="currentPage === 1"
          class="px-8 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-blue-700 text-sm hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Previous page">
          Back
        </button>

        <span class="text-sm font-medium text-slate-600 min-w-[90px] text-center">
          {{ currentPage }} / {{ totalPages }}
        </span>

        <button @click="nextPage" :disabled="currentPage === totalPages"
          class="px-8 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-blue-700 text-sm hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Next page">
          Next
        </button>
      </div>

    </div>

    <!-- RIGHT-TO-LEFT TRANSACTION DETAILS DRAWER -->
    <Teleport to="body">
      <!-- Backdrop Overlay -->
      <Transition enter-active-class="transition-opacity ease-out duration-300" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-opacity ease-in duration-200"
        leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="isDrawerOpen" @click="closeDrawer" class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs"></div>
      </Transition>

      <!-- Slide Panel -->
      <Transition enter-active-class="transition transform ease-out duration-300" enter-from-class="translate-x-full"
        enter-to-class="translate-x-0" leave-active-class="transition transform ease-in duration-200"
        leave-from-class="translate-x-0" leave-to-class="translate-x-full">
        <div v-if="isDrawerOpen && selectedTx"
          class="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-100">

          <!-- DRAWER HEADER -->
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 class="text-base font-bold text-slate-900">Transaction Details</h2>

            <div class="flex items-center gap-3">
              <!-- Update Payment Select Dropdown -->
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium text-slate-500 hidden sm:inline">Update Payment:</span>
                <select v-model="selectedTx.paymentStatus" @change="handleStatusChange" :disabled="updatingPayment"
                  class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  <option :value="PaymentStatus.PAID">PAID</option>
                  <option :value="PaymentStatus.PENDING">PENDING</option>
                  <option :value="PaymentStatus.FAILED">FAILED</option>
                </select>
              </div>

              <!-- Close Button -->
              <button @click="closeDrawer"
                class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- DRAWER BODY CONTENT -->
          <div class="p-6 space-y-6 overflow-y-auto flex-1">

            <!-- Main Summary Header Card -->
            <div class="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs text-slate-400 font-medium">Transaction ID</div>
                  <div class="text-xl font-extrabold text-slate-900">#TX-{{ selectedTx.transactionId }}</div>
                </div>
                <span :class="getStatusBadgeClass(selectedTx.paymentStatus)"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border">
                  <span :class="getStatusDotClass(selectedTx.paymentStatus)" class="w-1.5 h-1.5 rounded-full"></span>
                  {{ selectedTx.paymentStatus }}
                </span>
              </div>

              <div class="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <span class="text-xs text-slate-500">Total Amount</span>
                <span class="text-xl font-extrabold text-slate-900">${{ selectedTx.amount.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Transaction Information List -->
            <div class="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Overview</h3>

              <div class="divide-y divide-slate-100 text-sm">
                <!-- Order ID -->
                <div class="py-3 flex items-center justify-between">
                  <span class="text-slate-500 font-medium">Order ID</span>
                  <span
                    class="font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 text-xs">
                    Order #{{ selectedTx.orderId }}
                  </span>
                </div>

                <!-- Payment Method -->
                <div class="py-3 flex items-center justify-between">
                  <span class="text-slate-500 font-medium">Payment Method</span>
                  <div class="text-right">
                    <div class="font-semibold text-slate-800">{{ selectedTx.bankName || 'Standard Bank' }}</div>
                    <div class="text-xs text-slate-400">Method ID: #{{ selectedTx.paymentMethodId }}</div>
                  </div>
                </div>

                <!-- Transaction Reference -->
                <div class="py-3 flex items-center justify-between">
                  <span class="text-slate-500 font-medium">Transaction Reference</span>
                  <span class="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                    {{ selectedTx.transactionRef || 'N/A' }}
                  </span>
                </div>

                <!-- Paid At -->
                <div class="py-3 flex items-center justify-between">
                  <span class="text-slate-500 font-medium">Paid At</span>
                  <span class="text-xs font-semibold text-slate-700">
                    {{ selectedTx.paidAt ? new Date(selectedTx.paidAt).toLocaleString() : 'Not Paid Yet' }}
                  </span>
                </div>
              </div>
            </div>

          </div>

          <!-- DRAWER FOOTER -->
          <div class="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button @click="closeDrawer"
              class="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer">
              Close
            </button>
          </div>

        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, X } from 'lucide-vue-next'

import type { Transaction } from '@/types/transaction'
import { PaymentStatus } from '@/types/paymentStatus'
import { useTransaction } from '@/composables/useTransaction'

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

// COMPOSABLE
const {
  transactions,
  loading: transactionsPending,
  error: transactionsError,
  getAllTransactions,
  getTransactionById,
  updatePayment
} = useTransaction()

// FILTERS
const searchQuery = ref('')
const selectedStatus = ref<PaymentStatus | null>(null)

// DRAWER STATE
const isDrawerOpen = ref(false)
const selectedTx = ref<Transaction | null>(null)
const updatingPayment = ref(false)

const fetchTransactions = async () => {
  await getAllTransactions()
}

onMounted(async () => {
  await fetchTransactions()
})

// SUMMARY COMPUTED
const summary = computed(() => {
  const list = transactions.value
  return {
    total: list.length,
    totalAmount: list.reduce((acc, curr) => acc + curr.amount, 0),
    paid: list.filter(t => t.paymentStatus === PaymentStatus.PAID).length,
    paidAmount: list.filter(t => t.paymentStatus === PaymentStatus.PAID).reduce((acc, curr) => acc + curr.amount, 0),
    pending: list.filter(t => t.paymentStatus === PaymentStatus.PENDING).length,
    pendingAmount: list.filter(t => t.paymentStatus === PaymentStatus.PENDING).reduce((acc, curr) => acc + curr.amount, 0),
    failed: list.filter(t => t.paymentStatus === PaymentStatus.FAILED).length,
    failedAmount: list.filter(t => t.paymentStatus === PaymentStatus.FAILED).reduce((acc, curr) => acc + curr.amount, 0)
  }
})

// FILTER TRANSACTIONS
const filteredTransactions = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  return transactions.value.filter(tx => {
    const matchesSearch = !q ||
      tx.transactionId.toString().includes(q) ||
      tx.orderId.toString().includes(q) ||
      (tx.transactionRef && tx.transactionRef.toLowerCase().includes(q))

    const matchesStatus = !selectedStatus.value || tx.paymentStatus === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

// BADGES & DOTS
function getStatusBadgeClass(status: PaymentStatus) {
  switch (status) {
    case PaymentStatus.PAID:
      return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    case PaymentStatus.PENDING:
      return 'bg-amber-50 text-amber-600 border-amber-100'
    case PaymentStatus.FAILED:
      return 'bg-red-50 text-red-600 border-red-100'
    default:
      return 'bg-slate-50 text-slate-600 border-slate-100'
  }
}

function getStatusDotClass(status: PaymentStatus) {
  switch (status) {
    case PaymentStatus.PAID:
      return 'bg-emerald-500'
    case PaymentStatus.PENDING:
      return 'bg-amber-500'
    case PaymentStatus.FAILED:
      return 'bg-red-500'
    default:
      return 'bg-slate-500'
  }
}

// HANDLERS
async function openDetailDrawer(tx: Transaction) {
  isDrawerOpen.value = true
  selectedTx.value = { ...tx }

  const detail = await getTransactionById(tx.transactionId)
  if (detail) {
    selectedTx.value = { ...detail }
  }
}

// ============================================
// PAGINATION
// ============================================

const itemsPerPage = 9
const currentPage = ref(1)

const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage
})

const endIndex = computed(() => {
  return startIndex.value + itemsPerPage
})

const paginatedTransactions = computed(() => {
  return filteredTransactions.value.slice(
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

watch(totalPages, (pages) => {
  if (pages === 0) {
    currentPage.value = 1
  } else if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

watch(
  [searchQuery, selectedStatus],
  () => {
    currentPage.value = 1
  }
)

function closeDrawer() {
  isDrawerOpen.value = false
  selectedTx.value = null
}

async function handleStatusChange() {
  if (!selectedTx.value || updatingPayment.value) return

  const transactionId = selectedTx.value.transactionId
  const newStatus = selectedTx.value.paymentStatus

  updatingPayment.value = true

  try {
    const response = await updatePayment(transactionId, { paymentStatus: newStatus })

    if (!response) {
      await fetchTransactions()
      const original = transactions.value.find(tx => tx.transactionId === transactionId)
      if (original) selectedTx.value = { ...original }
      return
    }

    await fetchTransactions()
    const updated = transactions.value.find(tx => tx.transactionId === transactionId)
    if (updated) selectedTx.value = { ...updated }
  } finally {
    updatingPayment.value = false
  }
}
</script>