<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Header from '~/layouts/Header.vue'
import AfterFooter from '~/layouts/AfterFooter.vue'
import { useCartStore, type CartItem } from '~/stores/cart'
import { useAuth } from '~/composable/useAuth'

definePageMeta({
  middleware: ['auth']
})

interface Location {
  deliveryLocationId: number
  label: string
  address: string
  phoneNumber?: string
  contactName?: string
  city?: string
  district?: string
}

interface Payment {
  paymentMethodId: number
  name: string
  bankName?: string
}

interface NewLocationForm {
  contactName: string
  phoneNumber: string
  city: string
  district: string
  address: string
}

const config = useRuntimeConfig()

const apiBase = String(config.public.apiBase)
const bakongApi = String(config.public.bakongApi)

const cartStore = useCartStore()
const { getToken } = useAuth()

const cartItems = computed<CartItem[]>(() => cartStore.items)

const totalPrice = computed(() =>
  Number(cartStore.totalPrice)
)

const selectedLocation = ref<number | null>(null)
const selectedDelivery = ref(1)
const selectedPayment = ref<number | null>(null)

const locations = ref<Location[]>([])
const paymentMethods = ref<Payment[]>([])

const loadingCheckoutData = ref(true)
const checkoutDataError = ref('')


// ======================================================
// ADD DELIVERY LOCATION
// ======================================================

const showLocationModal = ref(false)
const savingLocation = ref(false)
const locationError = ref('')

const newLocation = ref<NewLocationForm>({
  contactName: '',
  phoneNumber: '',
  city: 'Phnom Penh',
  district: '',
  address: ''
})

const resetLocationForm = () => {
  newLocation.value = {
    contactName: '',
    phoneNumber: '',
    city: 'Phnom Penh',
    district: '',
    address: ''
  }

  locationError.value = ''
}

const openLocationModal = () => {
  resetLocationForm()
  showLocationModal.value = true
}

const closeLocationModal = () => {
  if (savingLocation.value) {
    return
  }

  showLocationModal.value = false
  locationError.value = ''
}

const validateLocationForm = () => {
  const form = newLocation.value

  if (!form.contactName.trim()) {
    locationError.value = 'Please enter the contact name.'
    return false
  }

  if (!form.phoneNumber.trim()) {
    locationError.value = 'Please enter the phone number.'
    return false
  }

  if (!form.city.trim()) {
    locationError.value = 'Please enter the city.'
    return false
  }

  if (!form.district.trim()) {
    locationError.value = 'Please enter the district.'
    return false
  }

  if (!form.address.trim()) {
    locationError.value = 'Please enter the address.'
    return false
  }

  return true
}

const addDeliveryLocation = async () => {
  const token = getToken()

  if (!token) {
    return navigateTo('/auth/login')
  }

  locationError.value = ''

  if (!validateLocationForm()) {
    return
  }

  try {
    savingLocation.value = true

    const created = await $fetch<any>(
      `${apiBase}/delivery-locations`,
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },

        body: {
          contactName:
            newLocation.value.contactName.trim(),

          phoneNumber:
            newLocation.value.phoneNumber.trim(),

          city:
            newLocation.value.city.trim(),

          district:
            newLocation.value.district.trim(),

          address:
            newLocation.value.address.trim()
        }
      }
    )

    console.log(
      'Created delivery location:',
      created
    )

    const createdId = Number(
      created?.deliveryLocationId ??
      created?.id
    )

    // --------------------------------------------------
    // Add newly created location to current list
    // --------------------------------------------------

    const createdLocation: Location = {
      deliveryLocationId: createdId,

      label:
        created?.label ??
        created?.contactName ??
        newLocation.value.contactName,

      address:
        created?.address ??
        newLocation.value.address,

      phoneNumber:
        created?.phoneNumber ??
        newLocation.value.phoneNumber,

      contactName:
        created?.contactName ??
        newLocation.value.contactName,

      city:
        created?.city ??
        newLocation.value.city,

      district:
        created?.district ??
        newLocation.value.district
    }

    if (createdId) {
      locations.value.push(createdLocation)

      // Automatically select the new address
      selectedLocation.value = createdId
    } else {
      // ------------------------------------------------
      // Fallback:
      // refresh all locations if response does not
      // contain the ID we expect.
      // ------------------------------------------------

      await loadLocations()

      const newestLocation =
        locations.value[locations.value.length - 1]

      if (newestLocation) {
        selectedLocation.value =
          newestLocation.deliveryLocationId
      }
    }

    showLocationModal.value = false
    resetLocationForm()

  } catch (e: any) {
    console.error(
      'Add delivery location error:',
      e
    )

    locationError.value = msg(e)

  } finally {
    savingLocation.value = false
  }
}


// ======================================================
// DELIVERY METHODS
// ======================================================

const deliveryMethods = [
  {
    id: 1,
    name: 'Pickup',
    backendValue: 'PICKUP',
    price: 0,
    description: 'Collect from the store'
  },
  {
    id: 2,
    name: 'Motor Delivery',
    backendValue: 'MOTOR',
    price: 5,
    description: 'Delivery within Phnom Penh'
  }
]

const shippingPrice = computed(() =>
  deliveryMethods.find(
    x => x.id === selectedDelivery.value
  )?.price ?? 0
)

const grandTotal = computed(() =>
  totalPrice.value + shippingPrice.value
)


// ======================================================
// BAKONG PAYMENT
// ======================================================

const showBakongModal = ref(false)

const qrImage = ref('')
const bakongMd5 = ref('')
const currentBillNumber = ref('')
const currentTransactionRef = ref('')

const currentOrderId = ref<number | null>(null)
const currentTransactionId = ref<number | null>(null)

const paymentChecking = ref(false)
const paymentPaid = ref(false)
const paymentVerifying = ref(false)

const orderCreating = ref(false)

let timer: ReturnType<typeof setInterval> | null = null


// ======================================================
// ERROR MESSAGE
// ======================================================

const msg = (e: any) =>
  e?.data?.message ||
  e?.data?.error ||
  e?.message ||
  'Something went wrong.'


// ======================================================
// LOAD LOCATIONS
// ======================================================

const loadLocations = async () => {
  const token = getToken()

  if (!token) {
    return
  }

  try {
    const ls = await $fetch<any[]>(
      `${apiBase}/delivery-locations`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    locations.value = Array.isArray(ls)
      ? ls.map(x => ({
        deliveryLocationId: Number(
          x.deliveryLocationId ?? x.id
        ),

        label:
          x.label ??
          x.name ??
          x.contactName ??
          'Delivery address',

        address:
          x.address ??
          x.location ??
          x.fullAddress ??
          '',

        phoneNumber:
          x.phoneNumber ??
          x.phone,

        contactName:
          x.contactName,

        city:
          x.city,

        district:
          x.district
      }))
      : []

    // Only automatically select the first location
    // when nothing is currently selected.
    if (
      selectedLocation.value === null ||
      !locations.value.some(
        x =>
          x.deliveryLocationId ===
          selectedLocation.value
      )
    ) {
      selectedLocation.value =
        locations.value[0]?.deliveryLocationId ?? null
    }

  } catch (e) {
    console.error(
      'Load delivery locations error:',
      e
    )

    throw e
  }
}


// ======================================================
// LOAD PAYMENT METHODS
// ======================================================

const loadPaymentMethods = async () => {
  const token = getToken()

  if (!token) {
    return
  }

  const ps = await $fetch<any[]>(
    `${apiBase}/payment-methods`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  paymentMethods.value = Array.isArray(ps)
    ? ps.map(x => ({
      paymentMethodId: Number(
        x.paymentMethodId ?? x.id
      ),

      name:
        x.name ??
        x.bankName ??
        'Payment method',

      bankName:
        x.bankName
    }))
    : []

  const b = paymentMethods.value.find(
    x =>
      /bakong|khqr|aba/i.test(
        `${x.name} ${x.bankName ?? ''}`
      )
  )

  selectedPayment.value =
    b?.paymentMethodId ??
    paymentMethods.value[0]?.paymentMethodId ??
    null
}


// ======================================================
// LOAD CHECKOUT DATA
// ======================================================

const load = async () => {
  const token = getToken()

  if (!token) {
    loadingCheckoutData.value = false
    return
  }

  try {
    await Promise.all([
      loadLocations(),
      loadPaymentMethods()
    ])

  } catch (e) {
    console.error(e)

    checkoutDataError.value = msg(e)

  } finally {
    loadingCheckoutData.value = false
  }
}

onMounted(load)


// ======================================================
// STOP PAYMENT CHECKING
// ======================================================

const stop = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}


// ======================================================
// VERIFY PAYMENT WITH ASP.NET
// ======================================================

const verifyTransaction = async () => {
  const token = getToken()

  if (
    !token ||
    !currentTransactionId.value
  ) {
    return false
  }

  try {
    paymentVerifying.value = true

    console.log(
      'Verifying transaction:',
      currentTransactionId.value
    )

    console.log(
      'Payment reference:',
      currentTransactionRef.value
    )

    const result = await $fetch<any>(
      `${apiBase}/transactions/${currentTransactionId.value}/verify-payment`,
      {
        method: 'PUT',

        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },

        body: {
          transactionRef:
            currentTransactionRef.value || null
        }
      }
    )

    console.log(
      'Transaction verification result:',
      result
    )

    if (!result?.success) {
      console.error(
        'Transaction verification failed:',
        result
      )

      return false
    }

    return true

  } catch (e) {
    console.error(
      'Transaction verification error:',
      e
    )

    return false

  } finally {
    paymentVerifying.value = false
  }
}


// ======================================================
// CHECK BAKONG PAYMENT
// ======================================================

const check = async () => {
  if (
    !bakongMd5.value ||
    paymentChecking.value ||
    paymentPaid.value
  ) {
    return
  }

  try {
    paymentChecking.value = true

    const r = await $fetch<any>(
      `${bakongApi}/check-payment`,
      {
        query: {
          md5: bakongMd5.value
        }
      }
    )

    console.log(
      'Bakong payment status:',
      r
    )

    // ==================================================
    // PAYMENT FOUND
    // ==================================================

    if (r.status === 'PAID') {

      console.log(
        'Bakong payment is PAID'
      )

      currentTransactionRef.value =
        r.transaction?.transaction_ref ??
        r.transaction?.bill_number ??
        currentBillNumber.value ??
        ''

      console.log(
        'Payment reference:',
        currentTransactionRef.value
      )

      // Stop polling immediately
      stop()

      // ==================================================
      // VERIFY PAYMENT WITH ASP.NET
      // ==================================================

      const verified =
        await verifyTransaction()

      // ==================================================
      // DATABASE UPDATE FAILED
      // ==================================================

      if (!verified) {

        console.error(
          'Bakong says PAID but ASP.NET verification failed.'
        )

        alert(
          'Payment was detected, but we could not update the order. Please contact the store.'
        )

        return
      }

      // ==================================================
      // DATABASE UPDATE SUCCESS
      // ==================================================

      console.log(
        'Payment successfully verified in ASP.NET.'
      )

      paymentPaid.value = true

      // Clear cart ONLY after database verification
      cartStore.clearCart()

      // Give success UI a moment
      setTimeout(() => {

        showBakongModal.value = false

        navigateTo(`/`)

      }, 1200)
    }

  } catch (e) {

    console.error(
      'Bakong check error:',
      e
    )

  } finally {

    paymentChecking.value = false
  }
}


// ======================================================
// START PAYMENT POLLING
// ======================================================

const start = () => {

  stop()

  // Check immediately
  check()

  // Then check every 10 seconds
  timer = setInterval(
    check,
    10000
  )
}


// ======================================================
// PLACE ORDER
// ======================================================

const placeOrder = async () => {

  if (!cartItems.value.length) {
    return alert(
      'Your cart is empty.'
    )
  }

  const token = getToken()

  if (!token) {
    return navigateTo(
      '/auth/login'
    )
  }

  if (!selectedLocation.value) {
    return alert(
      'Please add/select a delivery location first.'
    )
  }

  if (!selectedPayment.value) {
    return alert(
      'Please select a payment method.'
    )
  }

  const invalid = cartItems.value.find(
    i =>
      !i.productVariantId ||
      i.quantity < 1
  )

  if (invalid) {
    return alert(
      'A cart item is missing its product variant. Please add it again.'
    )
  }

  const dm = deliveryMethods.find(
    x =>
      x.id === selectedDelivery.value
  )

  if (!dm) {
    return alert(
      'Please select a delivery method.'
    )
  }

  try {

    orderCreating.value = true

    // ==================================================
    // RESET PREVIOUS PAYMENT STATE
    // ==================================================

    stop()

    qrImage.value = ''
    bakongMd5.value = ''
    currentBillNumber.value = ''
    currentTransactionRef.value = ''

    currentOrderId.value = null
    currentTransactionId.value = null

    paymentPaid.value = false

    // ==================================================
    // 1. CREATE ORDER
    // ==================================================

    const order = await $fetch<any>(
      `${apiBase}/orders`,
      {
        method: 'POST',

        headers: {
          Authorization:
            `Bearer ${token}`
        },

        body: {
          deliveryLocationId:
            Number(
              selectedLocation.value
            ),

          deliveryMethod:
            dm.backendValue,

          items:
            cartItems.value.map(
              i => ({
                productVariantId:
                  Number(
                    i.productVariantId
                  ),

                quantity:
                  Number(
                    i.quantity
                  )
              })
            )
        }
      }
    )

    currentOrderId.value =
      Number(order.orderId)

    console.log(
      'Created order:',
      currentOrderId.value
    )

    // ==================================================
    // 2. CREATE TRANSACTION
    // ==================================================

    const tx = await $fetch<any>(
      `${apiBase}/transactions`,
      {
        method: 'POST',

        headers: {
          Authorization:
            `Bearer ${token}`
        },

        body: {
          orderId:
            currentOrderId.value,

          paymentMethodId:
            Number(
              selectedPayment.value
            )
        }
      }
    )

    currentTransactionId.value =
      Number(tx.transactionId)

    console.log(
      'Created transaction:',
      currentTransactionId.value
    )

    // ==================================================
    // 3. GENERATE BAKONG QR
    // ==================================================

    const qr = await $fetch<any>(
      `${bakongApi}/generate-qr`,
      {
        method: 'POST',

        body: {
          amount:
            Number(
              order.totalAmount
            ),

          currency:
            'USD',

          description:
            `Order #${currentOrderId.value}`
        }
      }
    )

    if (
      !qr?.success ||
      !qr.qr_image ||
      !qr.md5
    ) {
      throw new Error(
        qr?.error ||
        'Bakong QR generation failed.'
      )
    }

    // ==================================================
    // 4. SAVE QR INFORMATION
    // ==================================================

    qrImage.value =
      qr.qr_image

    bakongMd5.value =
      qr.md5

    currentBillNumber.value =
      qr.bill_number ?? ''

    // Use bill number as fallback payment reference
    currentTransactionRef.value =
      qr.bill_number ?? ''

    paymentPaid.value =
      false

    console.log(
      'Generated Bakong bill number:',
      currentBillNumber.value
    )

    // ==================================================
    // 5. SHOW QR
    // ==================================================

    showBakongModal.value =
      true

    // ==================================================
    // 6. START PAYMENT CHECKING
    // ==================================================

    start()

  } catch (e: any) {

    console.error(
      'Checkout error:',
      e
    )

    alert(
      msg(e)
    )

  } finally {

    orderCreating.value =
      false
  }
}


// ======================================================
// CANCEL PAYMENT / ORDER
// ======================================================

const cancelPayment = async () => {

  const token = getToken()

  if (
    !token ||
    !currentOrderId.value
  ) {
    return
  }

  try {

    await $fetch(
      `${apiBase}/orders/${currentOrderId.value}/cancel`,
      {
        method: 'POST',

        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    )

    // Stop Bakong polling
    stop()

    // Close modal
    showBakongModal.value = false

    // Clear payment state
    qrImage.value = ''
    bakongMd5.value = ''
    currentBillNumber.value = ''
    currentTransactionRef.value = ''

    currentTransactionId.value = null
    currentOrderId.value = null

    paymentPaid.value = false

  } catch (e) {

    console.error(
      'Cancel order error:',
      e
    )

    alert(
      msg(e)
    )
  }
}


// ======================================================
// CLEANUP
// ======================================================

onBeforeUnmount(() => {
  stop()
})
</script>


<template>

  <div class="min-h-screen bg-slate-50/70 text-slate-800 relative font-sans antialiased">

    <Header />

    <!-- ====================================================== -->
    <!-- CHECKOUT HEADER -->
    <!-- ====================================================== -->

    <div class="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">

      <!-- MAIN GRID -->

      <div class="grid lg:grid-cols-12 gap-8 items-start">

        <!-- ================================================== -->
        <!-- LEFT COLUMN -->
        <!-- ================================================== -->

        <div class="lg:col-span-7 xl:col-span-8 space-y-6">

          <!-- ================================================ -->
          <!-- DELIVERY LOCATION -->
          <!-- ================================================ -->

          <div class="reveal bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm shadow-slate-200/50">

            <!-- SECTION HEADER -->

            <div class="flex items-center justify-between gap-4 mb-5">

              <div class="flex items-center gap-3">

                <div
                  class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>

                <h2 class="font-bold text-lg text-slate-900">
                  Delivery Location
                </h2>

              </div>


              <!-- ADD LOCATION BUTTON -->

              <button type="button" @click="openLocationModal"
                class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-300 active:bg-blue-200 transition-all text-xs sm:text-sm font-bold shrink-0">

                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>

                <span>
                  Add New Location
                </span>

              </button>

            </div>


            <!-- LOADING -->

            <div v-if="loadingCheckoutData" class="flex items-center gap-2 text-sm text-slate-500 py-4">

              <div class="w-4 h-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>

              <span>
                Loading your saved locations...
              </span>

            </div>


            <!-- NO LOCATIONS -->

            <div v-else-if="!locations.length" class="space-y-4">

              <div
                class="rounded-xl bg-amber-50/80 border border-amber-200/60 text-amber-900 p-4 text-sm flex items-start gap-3">

                <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>

                <div>
                  <p class="font-semibold">
                    No delivery location found.
                  </p>

                  <p class="mt-0.5 text-amber-800/80">
                    Add a delivery location to continue with checkout.
                  </p>
                </div>

              </div>


              <!-- EMPTY STATE BUTTON -->

              <button type="button" @click="openLocationModal"
                class="w-full rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 p-5 transition-all group">

                <div class="flex flex-col items-center justify-center text-center">

                  <div
                    class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">

                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>

                  </div>

                  <span class="mt-2 text-sm font-bold text-slate-700 group-hover:text-blue-600">
                    Add your first delivery location
                  </span>

                  <span class="mt-1 text-xs text-slate-400">
                    Save an address for this order
                  </span>

                </div>

              </button>

            </div>


            <!-- LOCATIONS -->

            <div v-else class="space-y-3">

              <label v-for="location in locations" :key="location.deliveryLocationId"
                class="relative flex items-start p-4 rounded-xl border transition-all cursor-pointer select-none"
                :class="selectedLocation === location.deliveryLocationId
                    ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-600/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  ">

                <input type="radio" v-model="selectedLocation" :value="location.deliveryLocationId"
                  class="mt-1 h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500" />


                <div class="ml-3.5 flex-1 min-w-0">

                  <div class="flex items-center gap-2">

                    <h3 class="font-bold text-sm text-slate-800">
                      {{ location.label }}
                    </h3>

                    <span v-if="
                      selectedLocation ===
                      location.deliveryLocationId
                    "
                      class="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                      Selected
                    </span>

                  </div>


                  <p class="text-slate-600 text-xs sm:text-sm mt-1">
                    {{ location.address }}
                  </p>


                  <p v-if="location.district || location.city" class="text-slate-400 text-xs mt-1">
                    {{ location.district }}<span v-if="location.district && location.city">, </span>{{ location.city }}
                  </p>


                  <p v-if="location.phoneNumber" class="text-slate-400 text-xs mt-1 font-medium">
                    {{ location.phoneNumber }}
                  </p>

                </div>

              </label>

            </div>

          </div>


          <!-- ================================================ -->
          <!-- DELIVERY METHOD -->
          <!-- ================================================ -->

          <div class="reveal stagger-2 bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm shadow-slate-200/50">

            <div class="flex items-center gap-3 mb-5">

              <div
                class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                2
              </div>

              <h2 class="font-bold text-lg text-slate-900">
                Delivery Method
              </h2>

            </div>


            <div class="space-y-3">

              <div v-for="item in deliveryMethods" :key="item.id" class="rounded-xl border transition-all" :class="selectedDelivery === item.id
                  ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-600/10'
                  : 'border-slate-200 bg-white hover:border-slate-300'
                ">

                <label class="flex items-center justify-between p-4 cursor-pointer select-none">

                  <div class="flex items-start">

                    <input type="radio" v-model="selectedDelivery" :value="item.id"
                      class="mt-1 h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500" />

                    <div class="ml-3.5">

                      <h3 class="font-bold text-sm text-slate-800">
                        {{ item.name }}
                      </h3>

                      <p class="text-slate-500 text-xs mt-0.5">
                        {{ item.description }}
                      </p>

                    </div>

                  </div>


                  <span class="font-extrabold text-sm text-blue-600 ml-4 shrink-0">
                    ${{ item.price.toFixed(2) }}
                  </span>

                </label>

              </div>

            </div>

          </div>


          <!-- ================================================ -->
          <!-- PAYMENT METHOD -->
          <!-- ================================================ -->

          <div class="reveal stagger-2 bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm shadow-slate-200/50">

            <div class="flex items-center gap-3 mb-5">

              <div
                class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                3
              </div>

              <h2 class="font-bold text-lg text-slate-900">
                Payment Method
              </h2>

            </div>


            <!-- LOADING -->

            <div v-if="loadingCheckoutData" class="flex items-center gap-2 text-sm text-slate-500 py-4">

              <div class="w-4 h-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>

              <span>
                Loading payment methods...
              </span>

            </div>


            <!-- NO PAYMENT -->

            <div v-else-if="!paymentMethods.length"
              class="rounded-xl bg-amber-50/80 border border-amber-200/60 text-amber-900 p-4 text-sm">
              No payment methods were returned by the backend.
            </div>


            <!-- PAYMENT METHODS -->

            <div v-else class="space-y-3">

              <label v-for="payment in paymentMethods" :key="payment.paymentMethodId"
                class="flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer select-none"
                :class="selectedPayment === payment.paymentMethodId
                    ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-600/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  ">

                <div class="flex items-center">

                  <input type="radio" v-model="selectedPayment" :value="payment.paymentMethodId"
                    class="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500" />

                  <span class="ml-3.5 font-bold text-sm text-slate-800">
                    {{ payment.name }}
                  </span>

                </div>


                <span v-if="payment.bankName"
                  class="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-500">
                  {{ payment.bankName }}
                </span>

              </label>

            </div>

          </div>

        </div>


        <!-- ================================================== -->
        <!-- RIGHT COLUMN -->
        <!-- ================================================== -->

        <div class="lg:col-span-5 xl:col-span-4">

          <div
            class="reveal-right bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-md shadow-slate-200/60 sticky top-8 z-10">

            <h2 class="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
              Order Review
            </h2>


            <!-- CART ITEMS -->

            <div class="space-y-4 max-h-80 overflow-y-auto pr-1">

              <div v-for="item in cartItems" :key="item.productVariantId ||
                item.productId ||
                item.id
                " class="flex items-center gap-3.5">

                <div
                  class="w-16 h-16 rounded-xl border border-slate-100 bg-slate-50 p-1 shrink-0 flex items-center justify-center">

                  <img :src="item.image" class="max-w-full max-h-full object-contain" />

                </div>


                <div class="flex-1 min-w-0">

                  <h3 class="font-bold text-xs sm:text-sm text-slate-800 truncate">
                    {{ item.name || item.title }}
                  </h3>

                  <p class="text-slate-400 text-xs mt-0.5 font-medium">
                    Qty:
                    <span class="text-slate-700">
                      {{ item.quantity }}
                    </span>
                  </p>

                </div>


                <span class="font-extrabold text-sm text-slate-900 shrink-0">
                  ${{ Number(item.price || 0).toFixed(2) }}
                </span>

              </div>

            </div>


            <hr class="my-6 border-slate-100" />


            <!-- SUMMARY -->

            <div class="space-y-3 text-sm">

              <div class="flex justify-between text-slate-500 font-medium">

                <span>
                  Subtotal
                </span>

                <span class="text-slate-800 font-semibold">
                  ${{ totalPrice.toFixed(2) }}
                </span>

              </div>


              <div class="flex justify-between text-slate-500 font-medium">

                <span>
                  Shipping Fee
                </span>

                <span class="text-slate-800 font-semibold">
                  ${{ shippingPrice.toFixed(2) }}
                </span>

              </div>


              <div class="pt-3 border-t border-slate-100 flex justify-between items-baseline">

                <span class="text-base font-bold text-slate-900">
                  Total
                </span>

                <span class="text-2xl font-black text-blue-600">
                  ${{ grandTotal.toFixed(2) }}
                </span>

              </div>

            </div>


            <!-- PLACE ORDER -->

            <button @click="placeOrder" :disabled="orderCreating"
              class="w-full mt-8 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">

              <span v-if="!orderCreating">
                Place Order
              </span>

              <span v-else class="flex items-center gap-2">

                <div class="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>

                Processing...

              </span>

            </button>


            <!-- TRUST BADGE -->

            <div class="mt-4 text-center flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">

              <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>

              <span>
                Encrypted & Safe Checkout
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>


    <!-- ====================================================== -->
    <!-- ADD DELIVERY LOCATION MODAL -->
    <!-- ====================================================== -->

    <Teleport to="body">

      <Transition name="modal-overlay">
      <div v-if="showLocationModal"
        class="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
        @click.self="closeLocationModal">

        <div
          class="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10 animate-scale-in">

          <!-- MODAL HEADER -->

          <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">

            <div>

              <h2 class="text-lg font-bold text-slate-900">
                Add New Delivery Location
              </h2>

              <p class="text-xs text-slate-400 mt-1">
                Add an address for your order delivery.
              </p>

            </div>


            <button type="button" @click="closeLocationModal" :disabled="savingLocation"
              class="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50">

              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>

            </button>

          </div>


          <!-- MODAL BODY -->

          <div class="p-6 overflow-y-auto max-h-[calc(90vh-150px)]">

            <!-- ERROR -->

            <div v-if="locationError"
              class="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-3">

              <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01M12 5.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13z" />
              </svg>

              <span>
                {{ locationError }}
              </span>

            </div>


            <div class="space-y-5">

              <!-- CONTACT NAME -->

              <div>

                <label for="contactName" class="block text-sm font-bold text-slate-700 mb-2">
                  Contact Name
                  <span class="text-red-500">*</span>
                </label>

                <input id="contactName" v-model="newLocation.contactName" type="text" autocomplete="name"
                  placeholder="Enter contact name" :disabled="savingLocation"
                  class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:cursor-not-allowed" />

              </div>


              <!-- PHONE -->

              <div>

                <label for="phoneNumber" class="block text-sm font-bold text-slate-700 mb-2">
                  Phone Number
                  <span class="text-red-500">*</span>
                </label>

                <input id="phoneNumber" v-model="newLocation.phoneNumber" type="tel" autocomplete="tel"
                  placeholder="e.g. 012 345 678" :disabled="savingLocation"
                  class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:cursor-not-allowed" />

              </div>


              <!-- CITY + DISTRICT -->

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <!-- CITY -->

                <div>

                  <label for="city" class="block text-sm font-bold text-slate-700 mb-2">
                    City
                    <span class="text-red-500">*</span>
                  </label>

                  <input id="city" v-model="newLocation.city" type="text" placeholder="e.g. Phnom Penh"
                    :disabled="savingLocation"
                    class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:cursor-not-allowed" />

                </div>


                <!-- DISTRICT -->

                <div>

                  <label for="district" class="block text-sm font-bold text-slate-700 mb-2">
                    District
                    <span class="text-red-500">*</span>
                  </label>

                  <input id="district" v-model="newLocation.district" type="text" placeholder="e.g. Sen Sok"
                    :disabled="savingLocation"
                    class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:cursor-not-allowed" />

                </div>

              </div>


              <!-- ADDRESS -->

              <div>

                <label for="address" class="block text-sm font-bold text-slate-700 mb-2">
                  Address
                  <span class="text-red-500">*</span>
                </label>

                <textarea id="address" v-model="newLocation.address" rows="3"
                  placeholder="House number, street, landmark..." :disabled="savingLocation"
                  class="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:cursor-not-allowed"></textarea>

                <p class="text-[11px] text-slate-400 mt-1.5">
                  Example: House 123, Street 2004, near AEON Mall Sen Sok
                </p>

              </div>

            </div>

          </div>


          <!-- MODAL FOOTER -->

          <div
            class="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">

            <button type="button" @click="closeLocationModal" :disabled="savingLocation"
              class="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 active:bg-slate-100 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>


            <button type="button" @click="addDeliveryLocation" :disabled="savingLocation"
              class="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">

              <div v-if="savingLocation"
                class="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>

              <span>
                {{
                  savingLocation
                    ? 'Saving...'
                    : 'Save Location'
                }}
              </span>

            </button>

          </div>

        </div>

      </div>
      </Transition>

    </Teleport>


    <!-- ====================================================== -->
    <!-- BAKONG KHQR MODAL -->
    <!-- ====================================================== -->

    <Teleport to="body">

      <Transition name="modal-overlay">
      <div v-if="showBakongModal" class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 p-4">

        <div class="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10 animate-scale-in">

          <!-- HEADER -->

          <div class="relative bg-[#E1251B] px-6 py-5 text-center text-white">

            <!-- CLOSE -->

            <button @click="cancelPayment" :disabled="paymentVerifying"
              class="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50">
              ✕
            </button>


            <div class="text-2xl font-black tracking-wider">
              BAKONG
            </div>

            <div class="text-[10px] font-bold uppercase tracking-widest opacity-90 mt-0.5">
              KHQR Payment
            </div>

          </div>


          <!-- BODY -->

          <div class="p-6 text-center">

            <!-- QR IMAGE -->

            <div v-if="qrImage && !paymentPaid" class="my-2 flex justify-center">

              <div class="rounded-2xl border-2 border-red-500 bg-white p-3 shadow-sm">

                <img :src="qrImage" alt="Bakong KHQR" class="h-[240px] w-[240px] object-contain" />

              </div>

            </div>


            <!-- NO QR -->

            <div v-else-if="!qrImage && !paymentPaid" class="flex flex-col items-center justify-center py-12">

              <div class="h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-red-600"></div>

              <p class="mt-4 text-xs font-semibold text-slate-500">
                Generating payment QR...
              </p>

            </div>


            <!-- WAITING -->

            <div v-if="qrImage && !paymentPaid" class="mt-4">

              <div class="font-bold text-sm text-slate-800">
                Waiting for payment...
              </div>

              <p class="mt-1 text-xs text-slate-400">
                Scan the QR code using Bakong or a supported banking app.
              </p>


              <!-- CHECKING -->

              <div v-if="paymentChecking"
                class="mt-4 flex items-center justify-center gap-2 bg-slate-50 py-2 rounded-xl">

                <div class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>

                <span class="text-xs font-medium text-slate-600">
                  Checking payment status...
                </span>

              </div>


              <!-- WAITING -->

              <div v-else class="mt-4 text-xs text-slate-400">
                Please complete the payment.
              </div>

            </div>


            <!-- VERIFYING -->

            <div v-if="paymentVerifying" class="mt-4 rounded-2xl bg-blue-50 p-4">

              <div class="flex items-center justify-center gap-2 text-blue-700">

                <div class="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"></div>

                <span class="text-xs font-bold">
                  Confirming payment...
                </span>

              </div>

              <p class="mt-1 text-xs text-blue-500">
                Please wait while we confirm your payment.
              </p>

            </div>


            <!-- SUCCESS -->

            <div v-if="paymentPaid" class="py-6">

              <div
                class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">

                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>

              </div>


              <div class="mt-4 text-lg font-bold text-slate-900">
                Payment Successful
              </div>

              <p class="mt-1 text-xs text-slate-500">
                Your payment has been confirmed successfully.
              </p>

              <p class="mt-4 text-xs font-semibold text-blue-600 animate-pulse">
                Redirecting to your order...
              </p>

            </div>


            <!-- ORDER INFORMATION -->

            <div v-if="
              !paymentPaid &&
              (currentOrderId || currentBillNumber)
            " class="mt-5 border-t border-slate-100 pt-4 space-y-1">

              <div class="flex justify-between text-xs text-slate-400">

                <span>
                  Order
                </span>

                <span class="font-bold text-slate-700">
                  #{{ currentOrderId }}
                </span>

              </div>


              <div v-if="currentBillNumber" class="flex justify-between text-xs text-slate-400">

                <span>
                  Bill
                </span>

                <span class="font-bold text-slate-700">
                  {{ currentBillNumber }}
                </span>

              </div>

            </div>


            <!-- CANCEL -->

            <button v-if="
              !paymentVerifying &&
              !paymentPaid
            " @click="cancelPayment"
              class="mt-5 w-full rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors">
              Cancel Payment
            </button>

          </div>

        </div>

      </div>
      </Transition>

    </Teleport>


    <AfterFooter />

  </div>

</template>