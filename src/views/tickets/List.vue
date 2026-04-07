<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { get } from '@/service/api';
import { formatTime } from '@/utils/formatTime';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Select from 'primevue/select';
import Skeleton from 'primevue/skeleton';

const router = useRouter();
const tickets = ref([]);
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
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Closed', value: 'Closed' },
    { label: 'Canceled', value: 'Canceled' }
];

const statusConfig = {
    Open: { severity: 'danger', icon: 'pi pi-circle-fill', color: '#ef4444' },
    'In Progress': { severity: 'warn', icon: 'pi pi-spin pi-spinner', color: '#f59e0b' },
    Closed: { severity: 'success', icon: 'pi pi-check-circle', color: '#22c55e' },
    Canceled: { severity: 'secondary', icon: 'pi pi-times-circle', color: '#94a3b8' }
};

function ticketConfig(status) {
    return statusConfig[status] || { severity: 'info', icon: 'pi pi-ticket', color: '#6366f1' };
}

async function fetchPage(p) {
    const params = { page: p, limit, sortBy: 'created_at', sortOrder: 'desc' };
    if (statusFilter.value) params.status = statusFilter.value;
    const { data } = await get('/tickets', { params });
    return data.data;
}

async function loadFirst() {
    loading.value = true;
    tickets.value = [];
    page.value = 1;
    hasMore.value = true;
    try {
        const result = await fetchPage(1);
        tickets.value = result.data || [];
        totalRecords.value = result.meta?.total || 0;
        hasMore.value = tickets.value.length < totalRecords.value;
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
        tickets.value.push(...newItems);
        page.value = nextPage;
        hasMore.value = tickets.value.length < (result.meta?.total || 0);
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
        <div class="flex items-center justify-between mb-5 animate-fade-in-up">
            <h1 class="font-display text-2xl font-semibold page-title m-0">Tiket Saya</h1>
            <Button label="Buat Tiket" icon="pi pi-plus" @click="router.push('/tickets/create')" class="create-btn" />
        </div>

        <!-- Filter -->
        <div class="mb-4 animate-fade-in-up" style="animation-delay:0.05s">
            <Select v-model="statusFilter" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Filter Status" class="w-full sm:w-48" @change="onFilter" />
        </div>

        <!-- Skeletons -->
        <div v-if="loading" class="flex flex-col gap-2">
            <div v-for="i in 5" :key="i" class="tkt-skeleton">
                <Skeleton shape="circle" size="2rem" />
                <div class="flex-1">
                    <Skeleton height="0.9rem" width="50%" borderRadius="4px" class="mb-2" />
                    <Skeleton height="0.75rem" width="35%" borderRadius="4px" />
                </div>
                <Skeleton height="1.4rem" width="4rem" borderRadius="4px" />
            </div>
        </div>

        <!-- Ticket list -->
        <div v-else-if="tickets.length" class="flex flex-col gap-2">
            <button
                v-for="(tkt, idx) in tickets"
                :key="tkt.ticket_id"
                class="tkt-card animate-stagger-item"
                :style="{ '--i': Math.min(idx, 6) }"
                @click="router.push(`/tickets/${tkt.ticket_id}`)"
            >
                <!-- Status dot -->
                <div class="tkt-dot" :style="{ background: ticketConfig(tkt.status).color }"></div>

                <!-- Content -->
                <div class="tkt-body">
                    <div class="tkt-id">{{ tkt.ticket_id }}</div>
                    <div class="tkt-subject">{{ tkt.subject_problem || '-' }}</div>
                    <div class="tkt-meta">
                        <span v-if="tkt.subscription?.id">{{ tkt.subscription.id }}</span>
                        <span class="tkt-sep" v-if="tkt.subscription?.id">·</span>
                        <span>{{ formatTime(tkt.created_at) }}</span>
                    </div>
                </div>

                <!-- Right: status + arrow -->
                <div class="tkt-right">
                    <Tag :value="tkt.status" :severity="ticketConfig(tkt.status).severity" class="tkt-tag" />
                    <i class="pi pi-chevron-right tkt-arrow"></i>
                </div>
            </button>
        </div>

        <!-- Empty -->
        <div v-else class="empty-state animate-fade-in-up">
            <i class="pi pi-ticket empty-icon"></i>
            <p>Belum ada tiket</p>
        </div>

        <!-- Infinite scroll sentinel -->
        <div ref="sentinel" class="sentinel"></div>

        <div v-if="loadingMore" class="load-more-indicator">
            <i class="pi pi-spin pi-spinner"></i>
        </div>

        <div v-if="!hasMore && tickets.length > 0" class="end-label">
            {{ totalRecords }} tiket ditampilkan
        </div>
    </div>
</template>

<style scoped>
.page-title { color: #1e1b4b; }

.create-btn { border-radius: 0.5rem; font-weight: 600; }

.tkt-skeleton {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.9rem 1.25rem;
    background: #ffffff;
    border: 1px solid rgba(51, 0, 204, 0.06);
    border-radius: 0.75rem;
}

.tkt-card {
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
.tkt-card:hover {
    border-color: rgba(51, 0, 204, 0.2);
    background: rgba(51, 0, 204, 0.015);
}

.tkt-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.tkt-body { flex: 1; min-width: 0; }

.tkt-id {
    font-size: 0.78rem;
    font-weight: 700;
    color: #3300cc;
    letter-spacing: 0.02em;
    margin-bottom: 0.1rem;
}

.tkt-subject {
    font-size: 0.9rem;
    font-weight: 500;
    color: #1e1b4b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.2rem;
}

.tkt-meta {
    font-size: 0.76rem;
    color: #7a7298;
    display: flex;
    align-items: center;
    gap: 0.35rem;
}
.tkt-sep { opacity: 0.5; }

.tkt-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.35rem;
    flex-shrink: 0;
}

.tkt-tag { font-size: 0.68rem !important; }

.tkt-arrow {
    font-size: 0.75rem;
    color: #c4b5fd;
    transition: color 0.15s;
}
.tkt-card:hover .tkt-arrow { color: #3300cc; }

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
