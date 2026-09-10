<script setup lang="ts">
import { getTransaction } from '@/api/transactions.api'
import type { Transaction } from '@/types/transaction'
import router from '@/router'
import { Button, DataTable, Column, useToast } from 'primevue'
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const toast = useToast()

const loading = ref(false)
const transaction = ref<Transaction | null>(null)

const transactionId = computed<number>(() => Number(route.params.id))

const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return '-'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value)
}

const formatDate = (value: string | undefined) => {
    if (!value) return '-'
    return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

onMounted(async () => {
    loading.value = true

    try {
        const res = await getTransaction(transactionId.value)
        transaction.value = res.data.data
    } catch (error) {
        toast.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to load transaction details",
            life: 3000
        })
    } finally {
        loading.value = false
    }
})
</script>

        <template>
            <div class="min-h-screen bg-surface-50 font-sans text-surface-900">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-2xl font-bold text-surface-900 mb-1">
                            Transaction Details
                        </h1>
                        <p class="text-surface-500 text-sm">
                            View complete details for this transaction
                        </p>
                    </div>

                    <Button asChild v-slot="slotProps">
                        <RouterLink :to="{ name: 'transactions' }" :class="slotProps.class">
                            <i class="pi pi-arrow-left"></i>
                            Back
                        </RouterLink>
                    </Button>
                </div>

                <div v-if="loading" class="flex justify-center py-12">
                    <i class="pi pi-spin pi-spinner text-4xl text-primary-500"></i>
                </div>

                <div v-else-if="transaction" class="flex flex-col gap-8">

            <!-- Transaction Information -->
            <div class="bg-white rounded-2xl border border-surface-200 p-6">
                <h2 class="font-bold text-lg mb-6">Transaction Information</h2>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <span class="text-sm text-surface-500 block mb-2">
                            Transaction Code
                        </span>
                        <span class="font-bold text-primary-600">
                            {{ transaction.code }}
                        </span>
                    </div>

                    <div>
                        <span class="text-sm text-surface-500 block mb-2">
                            Customer
                        </span>
                        <span class="font-medium text-surface-900">
                            {{ transaction.customer?.name ?? 'Guest' }}
                        </span>
                    </div>

                    <div>
                        <span class="text-sm text-surface-500 block mb-2">
                            Date
                        </span>
                        <span class="font-medium text-surface-900">
                            {{ formatDate(transaction.created_at) }}
                        </span>
                    </div>

                    <div>
                        <span class="text-sm text-surface-500 block mb-2">
                            Total
                        </span>
                        <span class="font-bold text-primary-600">
                            {{ formatCurrency(transaction.total) }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Purchased Items -->
            <div class="bg-white rounded-2xl border border-surface-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-surface-100 flex justify-between items-center bg-surface-50">
                    <h2 class="font-bold text-lg">Items</h2>
                    <span class="text-sm text-surface-500">
                        {{ transaction.items?.length || 0 }} items
                    </span>
                </div>

                <div class="p-2">
                    <DataTable
                        :value="transaction.items"
                        dataKey="id"
                        class="clean-table"
                        :rowHover="true"
                    >
                        <Column header="Product">
                            <template #body="{ data }">
                                <span class="font-medium text-surface-900">
                                    {{ data.product?.name ?? 'Unknown Product' }}
                                </span>
                            </template>
                        </Column>

                        <Column field="price" header="Price">
                            <template #body="{ data }">
                                {{ formatCurrency(data.price) }}
                            </template>
                        </Column>

                        <Column field="quantity" header="Qty"></Column>

                        <Column field="subtotal" header="Subtotal">
                            <template #body="{ data }">
                                <span class="font-bold">
                                    {{ formatCurrency(data.subtotal) }}
                                </span>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>

            <!-- Payment Summary -->
            <div class="bg-white rounded-2xl border border-surface-200 p-6">
                <h2 class="font-bold text-lg mb-6">Summary</h2>

                <div class="flex flex-col gap-4 text-sm max-w-md ml-auto">

                    <div class="flex justify-between items-center">
                        <span class="text-surface-500">
                            Subtotal
                        </span>
                        <span class="font-medium text-surface-900">
                            {{ formatCurrency(transaction.subtotal) }}
                        </span>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-surface-500">
                            Tax
                        </span>
                        <span class="font-medium text-surface-900">
                            {{ formatCurrency(transaction.tax) }}
                        </span>
                    </div>

                    <hr class="border-surface-100" />

                    <div class="flex justify-between items-center text-lg">
                        <span class="font-bold text-surface-900">
                            Total
                        </span>
                        <span class="font-bold text-primary-600">
                            {{ formatCurrency(transaction.total) }}
                        </span>
                    </div>

                </div>
            </div>

        </div>
    </div>
</template>
