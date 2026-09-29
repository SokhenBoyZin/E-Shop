<template>
    <div v-if="currentUser" class="p-1 space-y-6 bg-slate-50 min-h-screen text-slate-800">

        <!-- HEADER -->
        <div
            class="flex flex-col sm:flex-row sm:items-center p-4 justify-between gap-4 bg-white rounded-lg border-slate-100 shadow-sm">
            <div>
                <h1 class="text-2xl font-bold tracking-tight text-slate-900">
                    Products Management
                </h1>
                <p class="text-sm text-slate-500 mt-1">
                    Manage catalog, hardware specs, variants, and availability.
                </p>
            </div>

            <button @click="openCreateModal"
                class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition-all duration-250 btn-cool cursor-pointer">
                <Plus class="w-4 h-4" />
                Add New Product
            </button>
        </div>

        <!-- FILTERS & SEARCH -->
        <div
            class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div class="flex flex-1 items-center gap-3 w-full sm:w-auto">
                <!-- Search -->
                <div class="relative flex-1 max-w-md">
                    <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input v-model="searchQuery" type="text" placeholder="Search products by name or chip..."
                        class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                </div>

                <!-- Category Dropdown Filter -->
                <select v-model="selectedCategory" :disabled="categoriesLoading"
                    class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50">
                    <option :value="null">All Categories</option>
                    <option v-for="cat in categories" :key="cat.categoryId" :value="cat.categoryId">
                        {{ cat.name }}
                    </option>
                </select>

                <!-- Product Dropdown Filter -->
                <select v-model="stockFilter"
                    class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50">
                    <option value="all">All Stock</option>
                    <option value="in">In Stock</option>
                    <option value="low">Low Stock</option>
                    <option value="out">Out of Stock</option>
                </select>
            </div>

            <!-- Active / Archived Toggle -->
            <div class="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button @click="showArchived = false" :class="[
                    'px-4 py-2 rounded-lg font-medium transition-colors',
                    !showArchived ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]">
                    Active Products
                </button>

                <button @click="showArchived = true" :class="[
                    'px-4 py-2 rounded-lg font-medium transition-colors',
                    showArchived ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]">
                    Archived Products
                </button>
            </div>
        </div>

        <!-- PRODUCTS TABLE -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm card-cool animate-fade-up overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead
                        class="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <tr>
                            <th class="px-6 py-4">Product</th>
                            <th class="px-6 py-4">Category</th>
                            <th class="px-6 py-4">Key Specs</th>
                            <th class="px-6 py-4">Variants</th>
                            <th class="px-6 py-4">Status</th>
                            <th class="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody class="divide-y divide-slate-100">
                        <!-- Loading State -->
                        <tr v-if="productsPending">
                            <td colspan="6" class="px-6 py-16 text-center">
                                <div class="flex flex-col items-center gap-3">
                                    <div
                                        class="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin">
                                    </div>
                                    <span class="text-sm text-slate-400">Loading products...</span>
                                </div>
                            </td>
                        </tr>

                        <!-- Error State -->
                        <tr v-else-if="productsError">
                            <td colspan="6" class="px-6 py-16 text-center">
                                <div class="text-sm text-red-500">{{ productsError }}</div>
                                <button @click="() => fetchProducts(true)"
                                    class="mt-3 text-xs font-semibold text-indigo-600 hover:underline cursor-pointer">
                                    Try Again
                                </button>
                            </td>
                        </tr>

                        <!-- Empty State -->
                        <tr v-else-if="!filteredProducts || filteredProducts.length === 0">
                            <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                                {{ showArchived ? 'No archived products found.' : 'No active products found.' }}
                            </td>
                        </tr>

                        <!-- Products Rows -->
                        <template v-else>
                            <tr v-for="product in paginatedProducts" :key="product.productId"
                                class="hover:bg-slate-50/50 transition-colors">
                                <!-- Product Image & Name -->
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center gap-3">
                                        <img :src="product.image && product.image.startsWith('http') ? product.image : 'https://via.placeholder.com/48'"
                                            :alt="product.name"
                                            class="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200/60 shrink-0" />
                                        <div>
                                            <div class="font-bold text-slate-800">{{ product.name }}</div>
                                            <div class="text-xs text-slate-400 font-mono">
                                                ID: #{{ product.productId }}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <!-- Category -->
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span
                                        class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        {{ product.category?.name || (product as any).categoryName || 'Unassigned' }}
                                    </span>
                                </td>

                                <!-- Key Hardware Specs -->
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-xs text-slate-600 space-y-0.5">
                                        <p>
                                            <span class="font-semibold text-slate-800">
                                                {{ product.chipName || 'No chip' }}
                                            </span>
                                            <span v-if="product.ramGb"> ({{ product.ramGb }}GB RAM)</span>
                                        </p>
                                        <p class="text-slate-400">
                                            {{ product.displayName || 'No display' }}
                                            <span v-if="product.osVersion">• {{ product.osVersion }}</span>
                                        </p>
                                    </div>
                                </td>

                                <!-- Variants Count -->
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span
                                        class="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                                        {{ product.variants?.length || 0 }} Options
                                    </span>
                                </td>

                                <!-- Status Badge -->
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span :class="product.isArchived
                                        ? 'bg-red-50 text-red-600 border-red-100'
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'"
                                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border">
                                        <span :class="product.isArchived ? 'bg-red-500' : 'bg-emerald-500'"
                                            class="w-1.5 h-1.5 rounded-full"></span>
                                        {{ product.isArchived ? 'Archived' : 'Active' }}
                                    </span>
                                </td>

                                <!-- Action Controls -->
                                <td class="px-6 py-4 whitespace-nowrap text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <button @click="openEditModal(product)" title="Edit Product"
                                            class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer">
                                            <Pencil class="w-4 h-4" />
                                        </button>

                                        <button @click="toggleArchive(product)"
                                            :title="product.isArchived ? 'Restore Product' : 'Archive Product'"
                                            class="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer">
                                            <ArchiveRestore v-if="product.isArchived" class="w-4 h-4" />
                                            <Archive v-else class="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>

            <!-- PAGINATION -->
            <div v-if="filteredProducts.length > 0"
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

        <!-- CREATE / EDIT MODAL -->
        <div v-if="isModalOpen"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div
                class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <!-- Modal Header -->
                <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h2 class="text-lg font-bold text-slate-900">
                        {{ isEditing ? 'Edit Product' : 'Add New Product' }}
                    </h2>
                    <button @click="closeModal"
                        class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                        <X class="w-5 h-5" />
                    </button>
                </div>

                <!-- Navigation Tabs -->
                <div class="flex border-b border-slate-100 px-6 gap-6 text-xs font-semibold">
                    <button v-for="tab in ['General', 'Hardware Specs', 'Variants']" :key="tab" @click="activeTab = tab"
                        :class="activeTab === tab
                            ? 'border-b-2 border-indigo-600 text-indigo-600'
                            : 'text-slate-400 hover:text-slate-600'
                            " class="py-3 transition-colors cursor-pointer">
                        {{ tab }}
                    </button>
                </div>

                <!-- Modal Form Content -->
                <div class="p-6 overflow-y-auto space-y-4 flex-1">
                    <!-- GENERAL TAB -->
                    <div v-if="activeTab === 'General'" class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">
                                Product Name
                            </label>
                            <input v-model="form.name" type="text" placeholder="e.g. iPad Pro 13-inch"
                                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">
                                Category
                            </label>
                            <select v-model="form.categoryId"
                                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
                                <option :value="0" disabled>Select Category</option>
                                <option v-for="cat in categories" :key="cat.categoryId" :value="cat.categoryId">
                                    {{ cat.name }}
                                </option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">
                                Image URL
                            </label>
                            <input v-model="form.image" type="text" placeholder="https://..."
                                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                        </div>
                    </div>

                    <!-- HARDWARE SPECS TAB -->
                    <div v-if="activeTab === 'Hardware Specs'" class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">
                                Chip Name
                            </label>
                            <input v-model="form.chipName" placeholder="Apple M4 chip"
                                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">
                                RAM (GB)
                            </label>
                            <input v-model.number="form.ramGb" type="number" placeholder="12"
                                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">
                                CPU Cores
                            </label>
                            <input v-model="form.cpuCores" placeholder="8-core CPU"
                                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">
                                GPU Cores
                            </label>
                            <input v-model="form.gpuCores" placeholder="9-core GPU"
                                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">
                                Display Name
                            </label>
                            <input v-model="form.displayName" placeholder="Liquid Retina display"
                                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">
                                Resolution
                            </label>
                            <input v-model="form.displayResolution" placeholder="2732-by-2048-pixel resolution"
                                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">
                                Main Camera (MP)
                            </label>
                            <input v-model.number="form.mainCameraMp" type="number"
                                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">
                                Front Camera (MP)
                            </label>
                            <input v-model.number="form.frontCameraMp" type="number"
                                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-slate-600 mb-1">
                                OS Version
                            </label>
                            <input v-model="form.osVersion" placeholder="iPadOS 26"
                                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                        </div>
                    </div>

                    <!-- VARIANTS TAB -->
                    <div v-if="activeTab === 'Variants'" class="space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-semibold text-slate-600">
                                Product Variants
                            </span>
                            <button @click="addVariant"
                                class="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer">
                                <Plus class="w-3.5 h-3.5" />
                                Add Variant
                            </button>
                        </div>

                        <div v-for="(v, idx) in form.variants" :key="v.productVariantId || idx"
                            class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-12 gap-2 items-end">

                            <!-- Color Select Dropdown -->
                            <div class="col-span-3">
                                <label class="text-[10px] text-slate-400 font-semibold uppercase">
                                    Color
                                </label>

                                <div class="flex gap-1">
                                    <select v-model="v.colorId" :disabled="colorsLoading"
                                        class="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs">
                                        <option v-for="c in colors" :key="c.colorId" :value="c.colorId">
                                            {{ c.colorName }}
                                        </option>
                                    </select>

                                    <button type="button" @click="showAddColor = true"
                                        class="px-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                                        title="Add Color">
                                        <Plus class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <!-- Capacity Select Dropdown (Updated with Plus Button) -->
                            <div class="col-span-3">
                                <label class="text-[10px] text-slate-400 font-semibold uppercase">Capacity</label>
                                <div class="flex gap-1">
                                    <select v-model="v.capacityId" :disabled="capacitiesLoading"
                                        class="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs">
                                        <option v-for="cap in capacities" :key="cap.capacityId" :value="cap.capacityId">
                                            {{ cap.sizeLabel || (cap as any).capacityName }}
                                        </option>
                                    </select>

                                    <button type="button" @click="showAddCapacity = true"
                                        class="px-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 cursor-pointer"
                                        title="Add Capacity">
                                        <Plus class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <!-- Connectivity Type Select -->
                            <div class="col-span-2">
                                <label class="text-[10px] text-slate-400 font-semibold uppercase">Conn.</label>
                                <select v-model="v.connectivityTypeId"
                                    class="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs">
                                    <option v-for="conn in connectivities" :key="conn.connectivityId"
                                        :value="conn.connectivityId">
                                        {{ conn.connectivityName || (conn as any).connectivityTypeName }}
                                    </option>
                                </select>
                            </div>

                            <!-- Price -->
                            <div class="col-span-2">
                                <label class="text-[10px] text-slate-400 font-semibold uppercase">Price ($)</label>
                                <input v-model.number="v.price" type="number" step="0.01"
                                    class="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs" />
                            </div>

                            <!-- Stock Quantity -->
                            <div class="col-span-1">
                                <label class="text-[10px] text-slate-400 font-semibold uppercase">Qty</label>
                                <input v-model.number="v.stockQuantity" type="number"
                                    class="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs" />
                            </div>

                            <!-- Delete Variant Action -->
                            <div class="col-span-1 flex justify-center pb-1">
                                <button @click="removeVariant(Number(idx))"
                                    class="text-red-500 hover:text-red-700 cursor-pointer">
                                    <Trash2 class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ADD COLOR MODAL -->
                <div v-if="showAddColor" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
                    <div class="w-full max-w-sm bg-white rounded-xl shadow-xl p-5" @click.stop>
                        <!-- Header -->
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-base font-semibold text-slate-800">
                                Add Color
                            </h3>

                            <button type="button" @click="showAddColor = false"
                                class="text-slate-400 hover:text-slate-600">
                                <X class="w-5 h-5" />
                            </button>
                        </div>

                        <!-- Color Name -->
                        <div>
                            <label class="text-[10px] text-slate-400 font-semibold uppercase">
                                Color Name
                            </label>

                            <input v-model="newColorName" type="text" placeholder="e.g. Midnight Black"
                                class="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                                @keyup.enter="handleCreateColor" />
                        </div>

                        <!-- Buttons -->
                        <div class="flex justify-end gap-2 mt-5">
                            <button type="button" @click="showAddColor = false"
                                class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
                                Cancel
                            </button>

                            <button type="button" @click="handleCreateColor" :disabled="creatingColor"
                                class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50">
                                {{ creatingColor ? 'Creating...' : 'Create Color' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- ADD CAPACITY MODAL (Place this right next to ADD COLOR MODAL) -->
                <div v-if="showAddCapacity" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
                    <div class="w-full max-w-sm bg-white rounded-xl shadow-xl p-5" @click.stop>
                        <!-- Header -->
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-base font-semibold text-slate-800">
                                Add Capacity
                            </h3>
                            <button type="button" @click="showAddCapacity = false"
                                class="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X class="w-5 h-5" />
                            </button>
                        </div>

                        <!-- Capacity Field -->
                        <div>
                            <label class="text-[10px] text-slate-400 font-semibold uppercase">
                                Capacity Label / Size
                            </label>
                            <input v-model="newCapacityLabel" type="text" placeholder="e.g. 256GB"
                                class="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                                @keyup.enter="handleCreateCapacity" />
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex justify-end gap-2 mt-5">
                            <button type="button" @click="showAddCapacity = false"
                                class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                                Cancel
                            </button>
                            <button type="button" @click="handleCreateCapacity" :disabled="capacitiesLoading"
                                class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 cursor-pointer">
                                {{ capacitiesLoading ? 'Creating...' : 'Create Capacity' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button @click="closeModal"
                        class="px-4 py-2 text-slate-600 hover:bg-slate-200/60 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
                        Cancel
                    </button>
                    <button @click="saveProduct"
                        class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer">
                        {{ isEditing ? 'Update Product' : 'Save Product' }}
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
    X,
    Trash2
} from 'lucide-vue-next'
import type { Product } from '~/types/products'

// Composables
import { useProduct } from '~/composables/useProduct'
import { useCategory } from '~/composables/useCategory'
import { useColor } from '~/composables/useColor'
import { useCapacity } from '~/composables/useCapacity'
import { useConnectivity } from '~/composables/useConnectivity'
import { useProductVariant } from '~/composables/useProductVariant'

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

const {
    createProductVariant,
    updateProductVariant,
    deleteProductVariant
} = useProductVariant()

const {
    products,
    pending: productsPending,
    error: productsError,
    fetchProducts,
    createProduct,
    updateProduct,
    archiveProduct,
    getArchievedProducts,
    restoreProduct
} = useProduct()

const {
    categories,
    isLoading: categoriesLoading,
    fetchCategories
} = useCategory()

const {
    colors,
    loading: colorsLoading,
    fetchColors,
    createColor
} = useColor()

const {
    capacities,
    loading: capacitiesLoading,
    fetchCapacities,
    createCapacity
} = useCapacity()

const {
    connectivities,
    loading: connectivitiesLoading,
    fetchConnectivities
} = useConnectivity()

// ============================================
// QUICK-CREATE MODALS (Color & Capacity)
// ============================================
const showAddCapacity = ref(false)
const newCapacityLabel = ref('')

const handleCreateCapacity = async () => {
    const label = newCapacityLabel.value.trim()
    if (!label) return

    const newCapacity = await createCapacity({ sizeLabel: label })

    if (newCapacity) {
        // Automatically select newly created capacity for the last variant in the list
        if (form.value.variants.length > 0) {
            const lastVariant = form.value.variants[form.value.variants.length - 1]
            lastVariant.capacityId = newCapacity.capacityId
        }

        newCapacityLabel.value = ''
        showAddCapacity.value = false
    }
}

const showAddColor = ref(false)
const newColorName = ref('')
const creatingColor = ref(false)

const handleCreateColor = async () => {
    const name = newColorName.value.trim()

    if (!name) {
        alert('Please enter a color name')
        return
    }

    creatingColor.value = true

    try {
        const newColor = await createColor({ name })

        if (!newColor) {
            alert('Failed to create color')
            return
        }

        // Automatically select the new color for the last variant
        if (form.value.variants.length > 0) {
            const lastVariant = form.value.variants[form.value.variants.length - 1]
            lastVariant.colorId = newColor.colorId
        }

        newColorName.value = ''
        showAddColor.value = false
    } finally {
        creatingColor.value = false
    }
}

// ============================================
// FILTERING & ARCHIVE
// ============================================
const searchQuery = ref('')
const selectedCategory = ref<number | null>(null)
const showArchived = ref(false)

watch(showArchived, async (newValue) => {
    if (newValue) {
        await getArchievedProducts()
    } else {
        await fetchProducts()
    }
})

const stockFilter = ref('all')
const LOW_STOCK_THRESHOLD = 5

const filteredProducts = computed(() => {
    if (!products.value) return []

    const search = searchQuery.value.trim().toLowerCase()

    return products.value.filter((product) => {

        // ============================================
        // ACTIVE / ARCHIVED
        // ============================================
        const matchesArchive =
            Boolean(product.isArchived) === showArchived.value

        // ============================================
        // SEARCH BY NAME / CHIP
        // ============================================
        const matchesSearch =
            !search ||
            product.name?.toLowerCase().includes(search) ||
            product.chipName?.toLowerCase().includes(search)

        // ============================================
        // CATEGORY
        // ============================================
        const productCategoryId =
            product.category?.categoryId ??
            (product as any).categoryId

        const matchesCategory =
            selectedCategory.value === null ||
            Number(productCategoryId) === Number(selectedCategory.value)

        // ============================================
        // STOCK
        // ============================================
        const totalStock =
            product.variants?.reduce(
                (total, variant) => total + variant.stockQuantity,
                0
            ) ?? 0

        let matchesStock = true

        if (stockFilter.value === 'low') {
            matchesStock =
                totalStock > 0 &&
                totalStock <= LOW_STOCK_THRESHOLD
        }

        if (stockFilter.value === 'out') {
            matchesStock = totalStock === 0
        }

        if (stockFilter.value === 'in') {
            matchesStock = totalStock > LOW_STOCK_THRESHOLD
        }

        // ============================================
        // FINAL FILTER
        // ============================================
        return (
            matchesArchive &&
            matchesSearch &&
            matchesCategory &&
            matchesStock
        )
    })
})

const toggleArchive = async (product: Product) => {
    if (showArchived.value) {
        const res = await restoreProduct(product.productId)
        if (!res.success) alert(res.error)
    } else {
        const res = await archiveProduct(product.productId)
        if (!res.success) alert(res.error)
    }
}

// ============================================
// PAGINATION
// ============================================
const itemsPerPage = 6

const currentPage = ref(1)

const totalPages = computed(() => {
    return Math.ceil(filteredProducts.value.length / itemsPerPage)
})

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)

const paginatedProducts = computed(() => {
    return filteredProducts.value.slice(startIndex.value, endIndex.value)
})

const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
}

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
    [searchQuery, selectedCategory, showArchived, stockFilter],
    () => {
        currentPage.value = 1
    }
)

// ============================================
// MODAL & FORM STATE
// ============================================
const isModalOpen = ref(false)
const isEditing = ref(false)
const activeTab = ref('General')

const form = ref<any>({
    productId: null,
    name: '',
    image: '',
    chipName: '',
    cpuCores: '',
    gpuCores: '',
    ramGb: 8,
    displayName: '',
    displayResolution: '',
    mainCameraMp: 12,
    frontCameraMp: 12,
    osVersion: '',
    isArchived: false,
    categoryId: null,
    variants: []
})

// Helper to get fallback/default IDs from state
const getDefaultVariantField = (
    list: any[],
    idKey: string
): number | null => {
    return list.length > 0 ? Number(list[0][idKey]) : null
}

const openCreateModal = () => {
    isEditing.value = false
    activeTab.value = 'General'

    originalVariants.value = []

    const defaultColorId = getDefaultVariantField(colors.value, 'colorId')
    const defaultCapacityId = getDefaultVariantField(
        capacities.value,
        'capacityId'
    )
    const defaultConnectivityTypeId =
        getDefaultVariantField(
            connectivities.value,
            'connectivityTypeId'
        ) ??
        getDefaultVariantField(
            connectivities.value,
            'connectivityId'
        )

    form.value = {
        productId: null,
        name: '',
        image: '',
        chipName: '',
        cpuCores: '',
        gpuCores: '',
        ramGb: 8,
        displayName: '',
        displayResolution: '',
        mainCameraMp: 12,
        frontCameraMp: 12,
        osVersion: '',
        isArchived: false,
        categoryId: categories.value[0]?.categoryId ?? null,

        variants:
            defaultColorId &&
                defaultCapacityId &&
                defaultConnectivityTypeId
                ? [
                    {
                        productVariantId: 0,
                        price: 999,
                        stockQuantity: 10,
                        colorId: defaultColorId,
                        capacityId: defaultCapacityId,
                        connectivityTypeId: defaultConnectivityTypeId
                    }
                ]
                : []
    }

    isModalOpen.value = true
}

const originalVariants = ref<any[]>([])

const openEditModal = (product: Product) => {
    isEditing.value = true
    activeTab.value = 'General'

    const clonedProduct = JSON.parse(JSON.stringify(product))

    if (clonedProduct.variants) {
        clonedProduct.variants = clonedProduct.variants.map((v: any) => ({
            productVariantId: v.productVariantId ?? 0,
            price: Number(v.price),
            stockQuantity: Number(v.stockQuantity),
            colorId: Number(v.colorId),
            capacityId: Number(v.capacityId),
            connectivityTypeId: Number(
                v.connectivityTypeId ?? v.connectivityId
            )
        }))
    }

    // Remember variants before editing
    originalVariants.value = JSON.parse(
        JSON.stringify(clonedProduct.variants || [])
    )

    form.value = clonedProduct
    isModalOpen.value = true
}

const closeModal = () => {
    isModalOpen.value = false
}

// ============================================
// VARIANTS MANAGEMENT
// ============================================
const addVariant = () => {
    if (colors.value.length === 0) {
        alert('Please create a color first.')
        return
    }
    if (capacities.value.length === 0) {
        alert('Please create a capacity first.')
        return
    }
    if (connectivities.value.length === 0) {
        alert('Please create a connectivity type first.')
        return
    }

    const defaultColorId = getDefaultVariantField(colors.value, 'colorId')
    const defaultCapacityId = getDefaultVariantField(capacities.value, 'capacityId')
    const defaultConnectivityTypeId = getDefaultVariantField(
        connectivities.value,
        'connectivityTypeId'
    ) ?? getDefaultVariantField(connectivities.value, 'connectivityId')

    form.value.variants.push({
        productVariantId: 0,
        price: 999,
        stockQuantity: 10,
        colorId: defaultColorId,
        capacityId: defaultCapacityId,
        connectivityTypeId: defaultConnectivityTypeId
    })
}

const removeVariant = (index: number) => {
    form.value.variants.splice(index, 1)
}

// ============================================
// SAVE PRODUCT WITH VARIANTS
// ============================================
const saveProduct = async () => {
    // Basic validation
    if (!form.value.name?.trim()) {
        alert('Product name is required.')
        activeTab.value = 'General'
        return
    }

    if (!form.value.categoryId) {
        alert('Please select a category.')
        activeTab.value = 'General'
        return
    }

    if (!form.value.variants || form.value.variants.length === 0) {
        alert('Product must have at least one variant.')
        activeTab.value = 'Variants'
        return
    }

    // ============================================
    // PRODUCT PAYLOAD
    // ============================================

    const productPayload = {
        name: form.value.name,
        image: form.value.image,
        chipName: form.value.chipName,
        cpuCores: form.value.cpuCores,
        gpuCores: form.value.gpuCores,
        ramGb: Number(form.value.ramGb),
        displayName: form.value.displayName,
        displayResolution: form.value.displayResolution,
        mainCameraMp: Number(form.value.mainCameraMp),
        frontCameraMp: Number(form.value.frontCameraMp),
        osVersion: form.value.osVersion,
        isArchived: Boolean(form.value.isArchived),
        categoryId: Number(form.value.categoryId)
    }

    // ============================================
    // CREATE PRODUCT
    // ============================================

    if (!isEditing.value) {
        const result = await createProduct(productPayload)

        if (!result.success) {
            alert(result.error)
            return
        }

        // IMPORTANT:
        // Your createProduct must return the created product
        // or at least its productId.
        const productId = result.data?.productId

        if (!productId) {
            alert('Product was created, but product ID was not returned.')
            return
        }

        // ============================================
        // CREATE VARIANTS
        // ============================================

        for (const variant of form.value.variants) {
            const variantPayload = {
                productId: Number(productId),
                price: Number(variant.price),
                stockQuantity: Number(variant.stockQuantity),
                colorId: Number(variant.colorId),
                capacityId: Number(variant.capacityId),
                connectivityTypeId: Number(
                    variant.connectivityTypeId ?? variant.connectivityId
                )
            }

            const variantResult = await createProductVariant(variantPayload)

            if (!variantResult) {
                alert(
                    `Product created, but failed to create one of its variants.`
                )
                return
            }
        }

        alert('Product and variants created successfully.')
        await fetchProducts()
        closeModal()
        return
    }

    // ============================================
    // UPDATE PRODUCT
    // ============================================

    const productId = Number(form.value.productId)

    const productResult = await updateProduct(
        productId,
        productPayload
    )

    if (!productResult.success) {
        alert(productResult.error)
        return
    }

    // ============================================
    // UPDATE / CREATE VARIANTS
    // ============================================

    for (const variant of form.value.variants) {
        const variantPayload = {
            productId,
            price: Number(variant.price),
            stockQuantity: Number(variant.stockQuantity),
            colorId: Number(variant.colorId),
            capacityId: Number(variant.capacityId),
            connectivityTypeId: Number(
                variant.connectivityTypeId ?? variant.connectivityId
            )
        }

        // Existing variant
        if (variant.productVariantId) {
            const result = await updateProductVariant(
                Number(variant.productVariantId),
                variantPayload
            )

            if (!result) {
                alert(
                    `Failed to update variant #${variant.productVariantId}`
                )
                return
            }
        }

        // New variant
        else {
            const result = await createProductVariant(
                variantPayload
            )

            if (!result) {
                alert('Failed to create a new product variant.')
                return
            }
        }
    }

    // ============================================
    // DELETE REMOVED VARIANTS
    // ============================================

    const currentVariantIds = form.value.variants
        .filter((v: any) => v.productVariantId)
        .map((v: any) => Number(v.productVariantId))

    const removedVariants = originalVariants.value.filter(
        (original: any) =>
            original.productVariantId &&
            !currentVariantIds.includes(
                Number(original.productVariantId)
            )
    )

    for (const removedVariant of removedVariants) {
        const deleted = await deleteProductVariant(
            Number(removedVariant.productVariantId)
        )

        if (!deleted) {
            alert(
                `Failed to delete variant #${removedVariant.productVariantId}`
            )
            return
        }
    }

    alert('Product and variants updated successfully.')

    await fetchProducts()
    closeModal()
}

onMounted(async () => {
    await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchColors(),
        fetchCapacities(),
        fetchConnectivities()
    ])
})
</script>
