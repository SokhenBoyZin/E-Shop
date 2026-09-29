<template>
  <div v-if="currentUser" class="p-1 space-y-6 bg-slate-50 min-h-screen text-slate-800 relative overflow-x-hidden">

    <!-- HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-center p-4 justify-between gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">
          Users Management
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Manage system users, update roles, edit profiles, or view detailed user info.
        </p>
      </div>

      <!-- ADD NEW USER BUTTON -->
      <button
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm cursor-pointer shrink-0"
      >
        <Plus class="w-4 h-4 stroke-[2.5]" />
        <span>Add New User</span>
      </button>
    </div>

    <!-- SEARCH & CONTROLS -->
    <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up flex flex-col sm:flex-row items-center gap-4 justify-between">
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xl">

        <!-- Search Input -->
        <div class="relative flex-1 w-full">
          <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users by name, email..."
            class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <!-- Role Filter Dropdown -->
        <select
          v-model="selectedRole"
          class="w-full sm:w-44 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
        </select>
      </div>
    </div>

    <!-- USERS TABLE -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up overflow-hidden">

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">

          <thead class="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th class="px-6 py-4">User</th>
              <th class="px-6 py-4">Role</th>
              <th class="px-6 py-4">Created At</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100">

            <!-- Loading State -->
            <tr v-if="pending">
              <td colspan="4" class="px-6 py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <span class="text-sm text-slate-400">
                    Loading users...
                  </span>
                </div>
              </td>
            </tr>

            <!-- Error State -->
            <tr v-else-if="error">
              <td colspan="4" class="px-6 py-16 text-center">
                <div class="text-sm text-red-500">
                  {{ error }}
                </div>

                <button
                  @click="fetchUsers"
                  class="mt-3 text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  Try Again
                </button>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="!filteredUsers || filteredUsers.length === 0">
              <td colspan="4" class="px-6 py-12 text-center text-slate-400">
                No users found.
              </td>
            </tr>

            <!-- User Rows -->
            <template v-else>

              <tr
                v-for="user in paginatedUsers"
                :key="user.id"
                class="hover:bg-slate-50/50 transition-colors"
              >

                <!-- User Info -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">

                    <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                      {{ user.username ? user.username.charAt(0).toUpperCase() : 'U' }}
                    </div>

                    <div>
                      <div class="font-bold text-slate-800">
                        {{ user.username }}
                      </div>

                      <div class="text-xs text-slate-400 font-mono">
                        {{ user.email }}
                      </div>
                    </div>

                  </div>
                </td>

                <!-- Role Badge -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="
                      user.role === 'ADMIN'
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    "
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                  >
                    {{ user.role }}
                  </span>
                </td>

                <!-- Created Date -->
                <td class="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                  {{ formatDate(user.createdAt) }}
                </td>

                <!-- Action Controls -->
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">

                    <!-- View Details Button -->
                    <button
                      @click="openViewDrawer(user)"
                      title="View Details"
                      class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye class="w-4 h-4" />
                    </button>

                    <!-- Edit Button -->
                    <button
                      @click="openEditModal(user)"
                      title="Edit User"
                      class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>

                    <!-- Delete Button -->
                    <button
                      @click="handleDeleteUser(user.id)"
                      title="Delete User"
                      class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>

                  </div>
                </td>

              </tr>

            </template>

          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div
        v-if="filteredUsers.length > 0"
        class="flex items-center justify-center gap-3 px-6 py-4 border-t border-slate-100 bg-white"
      >

        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="px-8 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-blue-700 text-sm hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Previous page"
        >
          Back
        </button>

        <span class="text-sm font-medium text-slate-600 min-w-[90px] text-center">
          {{ currentPage }} / {{ totalPages }}
        </span>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-8 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-blue-700 text-sm hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Next page"
        >
          Next
        </button>

      </div>

    </div>

    <!-- RIGHT-TO-LEFT USER DETAILS DRAWER -->
    <Teleport to="body">

      <div v-if="isDrawerOpen" class="fixed inset-0 z-50 overflow-hidden">

        <!-- Backdrop -->
        <Transition
          enter-active-class="ease-in-out duration-300"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="ease-in-out duration-300"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            @click="closeDrawer"
            class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />
        </Transition>

        <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">

          <Transition
            enter-active-class="transform transition ease-in-out duration-300"
            enter-from-class="translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transform transition ease-in-out duration-300"
            leave-from-class="translate-x-0"
            leave-to-class="translate-x-full"
          >

            <div
              v-if="selectedUser"
              class="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
            >

              <!-- Drawer Header -->
              <div class="p-6 bg-slate-900 text-white flex items-center justify-between">

                <div class="flex items-center gap-3">

                  <div class="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {{ selectedUser.username ? selectedUser.username.charAt(0).toUpperCase() : 'U' }}
                  </div>

                  <div>
                    <h2 class="text-lg font-bold">
                      {{ selectedUser.username }}
                    </h2>

                    <p class="text-xs text-slate-400">
                      User ID: #{{ selectedUser.id }}
                    </p>
                  </div>

                </div>

                <button
                  @click="closeDrawer"
                  class="p-2 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X class="w-5 h-5" />
                </button>

              </div>

              <!-- Drawer Body -->
              <div class="p-6 space-y-6 flex-1 overflow-y-auto">

                <div class="space-y-4">

                  <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Account Details
                  </h3>

                  <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">

                    <div>
                      <span class="text-xs text-slate-400 block">
                        Email Address
                      </span>

                      <span class="text-sm font-semibold text-slate-800">
                        {{ selectedUser.email }}
                      </span>
                    </div>

                    <div>
                      <span class="text-xs text-slate-400 block">
                        System Role
                      </span>

                      <span class="text-xs font-bold px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-md inline-block mt-1">
                        {{ selectedUser.role }}
                      </span>
                    </div>

                    <div>
                      <span class="text-xs text-slate-400 block">
                        Registered On
                      </span>

                      <span class="text-sm text-slate-700">
                        {{ formatDate(selectedUser.createdAt) }}
                      </span>
                    </div>

                    <div>
                      <span class="text-xs text-slate-400 block">
                        Last Updated
                      </span>

                      <span class="text-sm text-slate-700">
                        {{ formatDate(selectedUser.updatedAt) }}
                      </span>
                    </div>

                  </div>
                </div>

              </div>

              <!-- Drawer Footer -->
              <div class="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">

                <button
                  @click="closeDrawer"
                  class="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close Profile
                </button>

              </div>

            </div>

          </Transition>

        </div>

      </div>

    </Teleport>

    <!-- CREATE USER MODAL -->
    <div
      v-if="isCreateModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
    >

      <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">

          <h2 class="text-lg font-bold text-slate-900">
            Create New User
          </h2>

          <button
            @click="closeCreateModal"
            class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>

        </div>

        <div class="p-6 space-y-4">

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">
              Username
            </label>

            <input
              v-model="createForm.username"
              type="text"
              placeholder="Enter username"
              class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">
              Email
            </label>

            <input
              v-model="createForm.email"
              type="email"
              placeholder="user@example.com"
              class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">
              Password
            </label>

            <input
              v-model="createForm.password"
              type="password"
              placeholder="••••••••"
              class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">
              Confirm Password
            </label>

            <input
              v-model="createForm.confirm_password"
              type="password"
              placeholder="••••••••"
              class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

        </div>

        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">

          <button
            @click="closeCreateModal"
            class="px-4 py-2 text-slate-600 hover:bg-slate-200/60 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            @click="handleCreateUser"
            :disabled="isSubmitting"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >

            <span
              v-if="isSubmitting"
              class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>

            Create User

          </button>

        </div>

      </div>

    </div>

    <!-- EDIT USER MODAL -->
    <div
      v-if="isEditModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
    >

      <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">

          <h2 class="text-lg font-bold text-slate-900">
            Edit User Profile
          </h2>

          <button
            @click="closeEditModal"
            class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>

        </div>

        <div class="p-6 space-y-4">

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">
              Username
            </label>

            <input
              v-model="editForm.username"
              type="text"
              class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">
              Email
            </label>

            <input
              v-model="editForm.email"
              type="email"
              class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">
              Role
            </label>

            <select
              v-model="editForm.role"
              class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

        </div>

        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">

          <button
            @click="closeEditModal"
            class="px-4 py-2 text-slate-600 hover:bg-slate-200/60 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            @click="saveUserChanges"
            :disabled="isSubmitting"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >

            <span
              v-if="isSubmitting"
              class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>

            Save Changes

          </button>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Search, Eye, Pencil, Trash2, X, Plus } from 'lucide-vue-next'
import { useUsers } from '~/composables/useUsers'
import type { UserResponse } from '~/types/user'

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

// ============================================
// USERS COMPOSABLE
// ============================================

const {
  users,
  pending,
  error,
  fetchUsers,
  updateUser,
  updateUserRole,
  deleteUser,
  createUser
} = useUsers()

// ============================================
// FILTERS
// ============================================

const searchQuery = ref('')
const selectedRole = ref('ALL')

// ============================================
// DRAWER
// ============================================

const isDrawerOpen = ref(false)
const selectedUser = ref<UserResponse | null>(null)

// ============================================
// MODALS
// ============================================

const isEditModalOpen = ref(false)
const isCreateModalOpen = ref(false)
const isSubmitting = ref(false)

// ============================================
// FORMS
// ============================================

const createForm = ref({
  username: '',
  email: '',
  password: '',
  confirm_password: ''
})

const editForm = ref({
  id: 0,
  username: '',
  email: '',
  role: 'USER'
})

// ============================================
// FILTER USERS
// ============================================

const filteredUsers = computed(() => {
  if (!users.value) return []

  return users.value.filter((user) => {

    // SEARCH
    const query = searchQuery.value.toLowerCase().trim()

    const matchesSearch =
      !query ||
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)

    // ROLE FILTER
    const matchesRole =
      selectedRole.value === 'ALL' ||
      String(user.role).toUpperCase() === selectedRole.value

    return matchesSearch && matchesRole
  })
})

// ============================================
// PAGINATION
// ============================================

const itemsPerPage = 9

const currentPage = ref(1)

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage
})

const endIndex = computed(() => {
  return startIndex.value + itemsPerPage
})

const paginatedUsers = computed(() => {
  return filteredUsers.value.slice(
    startIndex.value,
    endIndex.value
  )
})

// ============================================
// NEXT PAGE
// ============================================

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// ============================================
// PREVIOUS PAGE
// ============================================

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// ============================================
// RESET PAGE WHEN FILTER CHANGES
// ============================================

watch(
  [searchQuery, selectedRole],
  () => {
    currentPage.value = 1
  }
)

// ============================================
// KEEP PAGE VALID
// ============================================

watch(totalPages, (pages) => {
  if (pages === 0) {
    currentPage.value = 1
  } else if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

// ============================================
// CREATE MODAL
// ============================================

const openCreateModal = () => {
  createForm.value = {
    username: '',
    email: '',
    password: '',
    confirm_password: ''
  }

  isCreateModalOpen.value = true
}

const closeCreateModal = () => {
  isCreateModalOpen.value = false
}

const handleCreateUser = async () => {

  if (
    !createForm.value.username ||
    !createForm.value.email ||
    !createForm.value.password
  ) {
    alert('Please fill out all required fields.')
    return
  }

  if (
    createForm.value.password !==
    createForm.value.confirm_password
  ) {
    alert('Passwords do not match.')
    return
  }

  isSubmitting.value = true

  const res = await createUser({
    username: createForm.value.username,
    email: createForm.value.email,
    password: createForm.value.password,
    confirm_password: createForm.value.confirm_password
  })

  isSubmitting.value = false

  if (res.success) {
    closeCreateModal()
  } else {
    alert(res.error)
  }
}

// ============================================
// VIEW DRAWER
// ============================================

const openViewDrawer = (user: UserResponse) => {
  selectedUser.value = user
  isDrawerOpen.value = true
}

const closeDrawer = () => {
  isDrawerOpen.value = false

  setTimeout(() => {
    selectedUser.value = null
  }, 300)
}

// ============================================
// EDIT MODAL
// ============================================

const openEditModal = (user: UserResponse) => {

  editForm.value = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: String(user.role)
  }

  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
}

// ============================================
// SAVE USER CHANGES
// ============================================

const saveUserChanges = async () => {

  isSubmitting.value = true

  const userRes = await updateUser(
    editForm.value.id,
    {
      username: editForm.value.username,
      email: editForm.value.email
    }
  )

  const roleRes = await updateUserRole(
    editForm.value.id,
    {
      role: editForm.value.role
    }
  )

  isSubmitting.value = false

  if (userRes.success && roleRes.success) {
    closeEditModal()
  } else {
    alert(
      userRes.error ||
      roleRes.error ||
      'Failed to update user profile.'
    )
  }
}

// ============================================
// DELETE USER
// ============================================

const handleDeleteUser = async (id: number) => {

  if (!confirm('Are you sure you want to delete this user?')) {
    return
  }

  const res = await deleteUser(id)

  if (!res.success) {
    alert(res.error)
  }
}

// ============================================
// FORMAT DATE
// ============================================

const formatDate = (dateStr: string) => {

  if (!dateStr) return '-'

  return new Date(dateStr).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  )
}

// ============================================
// INITIAL LOAD
// ============================================

onMounted(() => {
  fetchUsers()
})
</script>