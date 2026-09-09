<script setup lang="ts">
import { Button, DataTable, Column, Select, IconField, InputIcon, InputText, useConfirm, ConfirmDialog } from 'primevue';
import { useProductStore } from '@/stores/product.store';
import { getCategories } from '@/api/product-categories.api';
import { useDebounceFn } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

const productStore = useProductStore()
const { fetch, setLimit, setPage, nextPage, prevPage, deleteProduct, setCategoryId } = productStore
const { items, loading, limit, currentPage, totalPages, search, categoryId } = storeToRefs(productStore)

const confirm = useConfirm()

const categoryOptions = ref<{ label: string, value: number }[]>([])

const fetchCategories = async () => {
    try {
        const res = await getCategories({ limit: 100 })
        categoryOptions.value = res.data.data.items.map((c: { id: number, name: string }) => ({
            label: c.name,
            value: c.id
        }))
    } catch (error) {
        console.error('Failed to fetch categories:', error)
    }
}

const onSearch = useDebounceFn(() => {
    setPage(1)
}, 400)

const onCategoryChange = (value: number | null) => {
    setCategoryId(value)
}

const confirmDelete = (id: number) => {
    confirm.require({
        message: "Are you sure you want to delete this product?",
        header: "Confirm delete",
        icon: "pi pi-exclamation-triangle",
        rejectProps: {
            label: "Cancel",
            severity: "secondary",
            outline: true
        },
        acceptProps: {
            label: "Delete",
            severity: "danger"
        },
        accept: async () => {
            try {
                await deleteProduct(id)
                fetch()
            } catch (error) {
                console.log(error)
            }
        }
    })
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value)
}

onMounted(() => {
    fetchCategories()
    fetch()
})

</script>
<template>
    <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
        <div class="flex justify-between items-start mb-8">
            <div>
                <h1 class="text-2xl font-bold text-surface-900 mb-1">
                    Products
                </h1>
                <p class="text-surface-500 text-sm">
                    The list here shows all products.
                </p>
            </div>
           <Button asChild v-slot="slotProps">
                <RouterLink
                    to="/products/create"
                    :class="slotProps.class"
                >
                    Add Product
                </RouterLink>
            </Button>
        </div>

        <div class="bg-white rounded-2xl border border-surface-200 p-2">
            <div class="flex flex-col md:flex-row justify-between items-center px-4 py-4 gap-4">
                    <IconField iconPosition="left" class="w-full md:w-80">
                        <InputIcon class="pi pi-search text-surface-400" />
                        <InputText v-model="search" placeholder="Search" @input="onSearch" />
                    </IconField>

                    <Select
                        :model-value="categoryId"
                        :options="categoryOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="All Categories"
                        showClear
                        filter
                        filterPlaceholder="Search category..."
                        class="w-full md:w-56"
                        @update:model-value="onCategoryChange"
                    />
                </div>
            <DataTable
                :value="items" :loading="loading" dataKey="id" class="clean-table" :rowHover="true">
                <Column field="name" header="Name" class="min-w-[16rem]">
                    <template #body="{ data }">
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <img :src="data.image" class="w-10 h-10 rounded-full object-cover bg-surface-100">
                            </div>
                            <span class="font-semibold text-surface-900">
                                {{ data.name }}
                            </span>
                        </div>
                    </template>
                </Column>

                <Column header="Category">
                    <template #body="{ data }">
                        {{ data.category?.name ?? '-' }}
                    </template>
                </Column>

                <Column field="price" header="Price">
                    <template #body="{ data }">
                        {{ formatCurrency(data.price) }}
                    </template>
                </Column>

                <Column field="stock" header="Stock"></Column>

                <Column header="Actions" style="width: 5rem;">
                    <template #body="{ data }">
                        <div class="flex items-center gap-2">
                            <RouterLink :to="{ name: 'products-edit', params: { id: data.id } }">
                                <Button icon="pi pi-pencil" text rounded severity="primary" class="w-9! h-9! border-surface-200! text-surface-200! hover:text-primary-600! hover:border-primary-500 hover:bg-primary-50! bg-white" />
                            </RouterLink>
                            <Button icon="pi pi-trash" text rounded severity="danger" class="w-9! h-9! border-surface-200! text-surface-200! hover:text-primary-600! hover:border-primary-500 hover:bg-primary-50! bg-white" @click="confirmDelete(data.id)" />
                        </div>
                    </template>
                </Column>
            </DataTable>

            <div class="flex justify-between items-center px-4 py-4 border-t border-surface-100 gap-4">
                <div class="flex items-center gap-2">
                    <span class="text-sm text-surface-500">
                        Rows per page:
                    </span>
                    <Select :model-value="limit" :options="[5, 10, 20, 50]" @update:model-value="setLimit" />
                </div>

                <div class="flex items-center gap-4">
                    <span class="text-sm font-medium text-surface-600">
                        {{ currentPage }} of {{ totalPages }}
                    </span>

                    <div class="flex gap-1">
                        <Button icon="pi pi-chevron-left" text rounded severity="secondary"
                            :disabled="currentPage === 1"
                            class="w-9! h-9! border! border-surface-500! hover:bg-surface-50!" @click="prevPage()" />
                         <Button icon="pi pi-chevron-right" text rounded severity="secondary"
                            :disabled="currentPage === totalPages"
                            class="w-9! h-9! border! border-surface-500! hover:bg-surface-50!" @click="nextPage()" />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <ConfirmDialog />
</template>
