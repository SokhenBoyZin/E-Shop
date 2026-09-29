<template>
  <div
    v-if="currentUser"
    class="p-1 space-y-6 bg-slate-50 min-h-screen text-slate-800"
  >
    <!-- HEADER -->
    <div
      class="flex flex-col sm:flex-row sm:items-center p-4 justify-between gap-4 bg-white rounded-lg border-slate-100 shadow-sm"
    >
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900">
          Categories Management
        </h1>

        <p class="text-sm text-slate-500 mt-1">
          Manage product categories, view associated items, and archive obsolete types.
        </p>
      </div>

      <button
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition-all duration-250 btn-cool cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        Add New Category
      </button>
    </div>

    <!-- FILTERS & SEARCH -->
    <div
      class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up flex flex-col sm:flex-row items-center gap-4 justify-between"
    >
      <div class="flex flex-1 items-center gap-3 w-full sm:w-auto">
        <!-- Search -->
        <div class="relative flex-1 max-w-md">
          <Search
            class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search categories by name..."
            class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <!-- Active / Archived Toggle -->
      <div
        class="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold"
      >
        <button
          @click="showArchived = false; loadCategories()"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer',
            !showArchived
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Active Categories
        </button>

        <button
          @click="showArchived = true; loadCategories()"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer',
            showArchived
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Archived Categories
        </button>
      </div>
    </div>

    <!-- CATEGORIES TABLE -->
    <div
      class="bg-white rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead
            class="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider"
          >
            <tr>
              <th class="px-6 py-4">Category</th>
              <th class="px-6 py-4">Products</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100">
            <!-- Loading State -->
            <tr v-if="isLoading">
              <td colspan="4" class="px-6 py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div
                    class="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"
                  ></div>

                  <span class="text-sm text-slate-400">
                    Loading categories...
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
                  @click="loadCategories"
                  class="mt-3 text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  Try Again
                </button>
              </td>
            </tr>

            <!-- Empty State -->
            <tr
              v-else-if="
                !filteredCategories ||
                filteredCategories.length === 0
              "
            >
              <td
                colspan="4"
                class="px-6 py-12 text-center text-slate-400"
              >
                {{
                  showArchived
                    ? 'No archived categories found.'
                    : 'No active categories found.'
                }}
              </td>
            </tr>

            <!-- Category Rows -->
            <template v-else>
              <tr
                v-for="category in paginatedCategories"
                :key="category.categoryId"
                class="hover:bg-slate-50/50 transition-colors"
              >
                <!-- Category Name & Icon/ID -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0"
                    >
                      {{
                        category.name
                          ? category.name.charAt(0).toUpperCase()
                          : 'C'
                      }}
                    </div>

                    <div>
                      <div class="font-bold text-slate-800">
                        {{ category.name }}
                      </div>

                      <div class="text-xs text-slate-400 font-mono">
                        ID: #{{ category.categoryId }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Products Count -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md"
                  >
                    {{ category.productsCount }} Products
                  </span>
                </td>

                <!-- Status Badge -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="
                      showArchived
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    "
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                  >
                    <span
                      :class="
                        showArchived
                          ? 'bg-red-500'
                          : 'bg-emerald-500'
                      "
                      class="w-1.5 h-1.5 rounded-full"
                    ></span>

                    {{ showArchived ? 'Archived' : 'Active' }}
                  </span>
                </td>

                <!-- Action Controls -->
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">
                    <!-- Edit -->
                    <button
                      @click="openEditModal(category)"
                      title="Edit Category"
                      class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>

                    <!-- Archive / Restore -->
                    <button
                      @click="handleDelete(category.categoryId)"
                      :title="
                        showArchived
                          ? 'Restore Category'
                          : 'Archive Category'
                      "
                      class="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <!-- Archived = Restore -->
                      <ArchiveRestore
                        v-if="showArchived"
                        class="w-4 h-4"
                      />

                      <!-- Active = Archive -->
                      <Archive
                        v-else
                        class="w-4 h-4"
                      />
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
        v-if="filteredCategories.length > 0"
        class="flex items-center justify-center gap-3 px-6 py-4 border-t border-slate-100 bg-white"
      >
        <!-- Previous -->
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="px-8 w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-blue-700 text-sm hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Previous page"
        >
          Back
        </button>

        <!-- Page Info -->
        <span
          class="text-sm font-medium text-slate-600 min-w-[90px] text-center"
        >
          {{ currentPage }} / {{ totalPages }}
        </span>

        <!-- Next -->
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

    <!-- CREATE / EDIT MODAL -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <!-- Modal Header -->
        <div
          class="px-6 py-5 border-b border-slate-100 flex items-center justify-between"
        >
          <h2 class="text-lg font-bold text-slate-900">
            {{ isEditing ? 'Edit Category' : 'Add New Category' }}
          </h2>

          <button
            @click="closeModal"
            class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Form Content -->
        <div class="p-6">
          <div>
            <label
              class="block text-xs font-semibold text-slate-600 mb-1"
            >
              Category Name
            </label>

            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. Laptops, Smartwatches"
              @keyup.enter="saveCategory"
              class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3"
        >
          <button
            @click="closeModal"
            class="px-4 py-2 text-slate-600 hover:bg-slate-200/60 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            @click="saveCategory"
            :disabled="isSubmitting"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <span
              v-if="isSubmitting"
              class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>

            {{ isEditing ? 'Update Category' : 'Save Category' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  Plus,
  Search,
  Pencil,
  Archive,
  ArchiveRestore,
  X
} from 'lucide-vue-next'

import type { Category } from '~/types/products'

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
// CATEGORY COMPOSABLE
// ============================================

const {
  categories,
  isLoading,
  error,
  fetchCategories,
  fetchArchivedCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  restoreCategory
} = useCategory()

// ============================================
// UI STATE
// ============================================

const searchQuery = ref('')
const showArchived = ref(false)
const isModalOpen = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const currentEditId = ref<number | null>(null)

const form = ref({
  name: ''
})

// ============================================
// LOAD CATEGORIES
// ============================================

const loadCategories = async () => {
  if (showArchived.value) {
    await fetchArchivedCategories()
  } else {
    await fetchCategories()
  }
}

onMounted(() => {
  loadCategories()
})

// ============================================
// SEARCH / FILTER
// ============================================

const filteredCategories = computed(() => {
  return categories.value.filter(cat =>
    cat.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase())
  )
})

// ============================================
// PAGINATION
// ============================================

const itemsPerPage = 6
const currentPage = ref(1)

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(filteredCategories.value.length / itemsPerPage)
  )
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage
})

const endIndex = computed(() => {
  return startIndex.value + itemsPerPage
})

const paginatedCategories = computed(() => {
  return filteredCategories.value.slice(
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

// Reset page when search or active/archived tab changes
watch(
  [searchQuery, showArchived],
  () => {
    currentPage.value = 1
  }
)

// ============================================
// CREATE MODAL
// ============================================

const openCreateModal = () => {
  isEditing.value = false
  currentEditId.value = null

  form.value = {
    name: ''
  }

  isModalOpen.value = true
}

// ============================================
// EDIT MODAL
// ============================================

const openEditModal = (cat: Category) => {
  isEditing.value = true
  currentEditId.value = cat.categoryId

  form.value = {
    name: cat.name
  }

  isModalOpen.value = true
}

// ============================================
// CLOSE MODAL
// ============================================

const closeModal = () => {
  isModalOpen.value = false
}

// ============================================
// SAVE CATEGORY
// ============================================

const saveCategory = async () => {
  if (!form.value.name.trim()) return

  isSubmitting.value = true

  try {
    if (
      isEditing.value &&
      currentEditId.value !== null
    ) {
      const res = await updateCategory(
        currentEditId.value,
        {
          name: form.value.name.trim()
        }
      )

      if (res.success) {
        closeModal()

        // Refresh current list
        await loadCategories()
      }
    } else {
      const res = await createCategory({
        name: form.value.name.trim()
      })

      if (res.success) {
        closeModal()

        // Refresh current list
        await loadCategories()
      }
    }
  } finally {
    isSubmitting.value = false
  }
}

// ============================================
// ARCHIVE / RESTORE CATEGORY
// ============================================

const handleDelete = async (id: number) => {
  const category = categories.value.find(
    c => c.categoryId === id
  )

  if (!category) return

  // ==========================================
  // ARCHIVED TAB -> RESTORE CATEGORY
  // ==========================================

  if (showArchived.value) {
    if (
      confirm(
        'Are you sure you want to restore this category?'
      )
    ) {
      await restoreCategory(id)

      // Reload archived categories
      await fetchArchivedCategories()
    }

    return
  }

  // ==========================================
  // ACTIVE TAB -> ARCHIVE CATEGORY
  // ==========================================

  if (
    confirm(
      'Are you sure you want to archive this category?'
    )
  ) {
    await deleteCategory(id)

    // Reload active categories
    await fetchCategories()
  }
}
</script>