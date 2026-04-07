<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { get } from '@/service/api';
import { formatIDR } from '@/utils/currency';
import { formatDate } from '@/utils/formatTime';
import Tag from 'primevue/tag';
import Select from 'primevue/select';
import Skeleton from 'primevue/skeleton';

const invoices = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const loadingMore = ref(false);
const page = ref(1);
const limit = 15;
const hasMore = ref(true);
const statusFilter = ref(null);
const sentinel = ref(null);
let observer = null;

const statusOptions = [
    { label: 'Semua', value: null },
    { label: 'Paid', value: 'PAID' },
    { label: 'Unpaid', value: 'UNPAID' }
];

function invoiceSeverity(status) {
    const s = (status || '').toUpperCase();
    return s === 'PAID' ? 'success' : s === 'UNPAID' ? 'danger' : 'warn';
}

function openInvoice(id) {
    const invoiceBaseUrl = (import.meta.env.VITE_PUBLIC_INVOICE_BASE_URL || import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, '');
    const invoiceUrl = `${invoiceBaseUrl}/inv/${encodeURIComponent(id)}`;
    window.open(invoiceUrl, '_blank');
}

async function fetchPage(p) {
    const params = { page: p, limit, sortBy: 'created_at', sortOrder: 'desc' };
    if (statusFilter.value) params.status = statusFilter.value;
    const { data } = await get('/invoices', { params });
    return data.data;
}

async function loadFirst() {
    loading.value = true;
    invoices.value = [];
    page.value = 1;
    hasMore.value = true;
    try {
        const result = await fetchPage(1);
        invoices.value = result.data || [];
        totalRecords.value = result.meta?.total || 0;
        hasMore.value = invoices.value.length < totalRecords.value;
    } catch (e) { console.error(e); }
    finally { loading.value = false; }
}

async function loadMore() {
    if (loadingMore.value || !hasMore.value) return;
    loadingMore.value = true;
    try {
        const nextPage = page.value + 1;
        const result = await fetchPage(nextPage);
        const newItems = result.data || [];
        invoices.value.push(...newItems);
        page.value = nextPage;
        hasMore.value = invoices.value.length < (result.meta?.total || 0);
    } catch (e) { console.error(e); }
    finally { loadingMore.value = false; }
}

function setupObserver() {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) loadMore();
    }, { threshold: 0.1 });
    if (sentinel.value) observer.observe(sentinel.value);
}

function onFilter() {
    loadFirst().then(setupObserver);
}

onMounted(() => { loadFirst().then(setupObserver); });
onUnmounted(() => { if (observer) observer.disconnect(); });
</script>

<template>
    <div>
        <h1 class="font-display text-2xl font-semibold page-title mb-5 animate-fade-in-up">Invoice Saya</h1>

        <!-- Filter -->
        <div class="mb-4 animate-fade-in-up" style="animation-delay:0.05s">
            <Select v-model="statusFilter" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Filter Status" class="w-full sm:w-48" @change="onFilter" />
        </div>

        <!-- Skeletons -->
        <div v-if="loading" class="flex flex-col gap-2">
            <div v-for="i in 5" :key="i" class="inv-skeleton">
                <Skeleton height="1rem" width="40%" borderRadius="4px" />
                <Skeleton height="1rem" width="25%" borderRadius="4px" />
            </div>
        </div>

        <!-- Invoice list -->
        <div v-else-if="invoices.length" class="flex flex-col gap-2">
            <button
                v-for="(inv, idx) in invoices"
                :key="inv.id"
                class="inv-card animate-stagger-item"
                :style="{ '--i': Math.min(idx, 6) }"
                @click="openInvoice(inv.id)"
            >
                <div class="inv-left">
                    <div class="inv-no">{{ inv.invoice_no }}</div>
                    <div class="inv-date">{{ formatDate(inv.created_at) }}
                        <span v-if="inv.due_date" class="inv-due"> · Jatuh tempo {{ formatDate(inv.due_date) }}</span>
                    </div>
                </div>
                <div class="inv-right">
                    <div class="inv-amount">{{ formatIDR(inv.grand_total) }}</div>
                    <Tag :value="(inv.status || '').toUpperCase()" :severity="invoiceSeverity(inv.status)" class="inv-tag" />
                </div>
                <i class="pi pi-external-link inv-arrow"></i>
            </button>
        </div>

        <!-- Empty -->
        <div v-else class="empty-state animate-fade-in-up">
            <i class="pi pi-file empty-icon"></i>
            <p>Belum ada invoice</p>
        </div>

        <!-- Infinite scroll sentinel -->
        <div ref="sentinel" class="sentinel"></div>

        <div v-if="loadingMore" class="load-more-indicator">
            <i class="pi pi-spin pi-spinner"></i>
        </div>

        <div v-if="!hasMore && invoices.length > 0" class="end-label">
            {{ totalRecords }} invoice ditampilkan
        </div>
    </div>
</template>

<style scoped>
.page-title { color: #1e1b4b; }

.inv-skeleton {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    background: #ffffff;
    border: 1px solid rgba(51, 0, 204, 0.06);
    border-radius: 0.75rem;
    gap: 1rem;
}

.inv-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.9rem 1.25rem;
    background: #ffffff;
    border: 1px solid rgba(51, 0, 204, 0.08);
    border-radius: 0.75rem;
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: border-color 0.15s, background 0.15s;
}
.inv-card:hover {
    border-color: rgba(51, 0, 204, 0.2);
    background: rgba(51, 0, 204, 0.015);
}

.inv-left { flex: 1; min-width: 0; }

.inv-no {
    font-size: 0.88rem;
    font-weight: 600;
    color: #3300cc;
}

.inv-date {
    font-size: 0.78rem;
    color: #7a7298;
    margin-top: 0.15rem;
}
.inv-due { color: #a78bfa; }

.inv-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.3rem;
    flex-shrink: 0;
}

.inv-amount {
    font-size: 0.92rem;
    font-weight: 700;
    color: #1e1b4b;
}

.inv-tag { font-size: 0.68rem !important; }

.inv-arrow {
    font-size: 0.78rem;
    color: #c4b5fd;
    flex-shrink: 0;
    transition: color 0.15s;
}
.inv-card:hover .inv-arrow { color: #3300cc; }

.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #7a7298;
}
.empty-icon {
    font-size: 2.5rem;
    color: #c4b5fd;
    margin-bottom: 1rem;
    display: block;
}

.sentinel { height: 1px; }
.load-more-indicator {
    display: flex;
    justify-content: center;
    padding: 1.5rem;
    color: #7a7298;
    font-size: 1.2rem;
}
.end-label {
    text-align: center;
    padding: 1rem;
    font-size: 0.8rem;
    color: #c4b5fd;
}
</style>
