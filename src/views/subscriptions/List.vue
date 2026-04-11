<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { get } from '@/service/api';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Skeleton from 'primevue/skeleton';

const subscriptions = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const loadingMore = ref(false);
const page = ref(1);
const limit = 12;
const hasMore = ref(true);
const search = ref('');
const statusFilter = ref(null);
const sentinel = ref(null);
let observer = null;

const statusOptions = [
    { label: 'Semua', value: null },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Suspended', value: 'SUSPENDED' },
    { label: 'New Request', value: 'NEW REQUEST' },
    { label: 'Setup', value: 'SETUP' }
];

function statusSeverity(status) {
    const map = { ACTIVE: 'success', 'NEW REQUEST': 'info', SUSPENDED: 'danger', SETUP: 'warn' };
    return map[status] || 'secondary';
}

function formatSpeed(speed) {
    if (speed === null || speed === undefined || speed === '') return '-';
    const value = String(speed).trim();
    if (!value) return '-';
    return /mbps/i.test(value) ? value : `${value} Mbps`;
}

async function fetchPage(p) {
    const params = { page: p, limit, sortBy: 'created_at', sortOrder: 'desc' };
    if (search.value) params.search = search.value;
    if (statusFilter.value) params.status = statusFilter.value;
    const { data } = await get('/subscriptions', { params });
    return data.data;
}

async function loadFirst() {
    loading.value = true;
    subscriptions.value = [];
    page.value = 1;
    hasMore.value = true;
    try {
        const result = await fetchPage(1);
        subscriptions.value = result.data || [];
        totalRecords.value = result.meta?.total || 0;
        hasMore.value = subscriptions.value.length < totalRecords.value;
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
        subscriptions.value.push(...newItems);
        page.value = nextPage;
        hasMore.value = subscriptions.value.length < (result.meta?.total || 0);
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

watch([search], () => {
    if (!search.value) onFilter();
});

onMounted(() => { loadFirst().then(setupObserver); });
onUnmounted(() => { if (observer) observer.disconnect(); });
</script>

<template>
    <div>
        <h1 class="font-display text-2xl font-semibold page-title mb-5 animate-fade-in-up">Langganan Saya</h1>

        <!-- Loading skeletons -->
        <div v-if="loading" class="sub-grid">
            <div v-for="i in 4" :key="i" class="sub-card">
                <Skeleton height="1.5rem" width="60%" borderRadius="6px" class="mb-3" />
                <Skeleton height="1rem" width="80%" borderRadius="4px" class="mb-2" />
                <Skeleton height="1rem" width="40%" borderRadius="4px" />
            </div>
        </div>

        <!-- Cards -->
        <div v-else-if="subscriptions.length" class="sub-grid">
            <router-link
                v-for="(sub, idx) in subscriptions"
                :key="sub.id"
                :to="`/subscriptions/${sub.id}`"
                class="sub-card card-hover-lift animate-stagger-item"
                :style="{ '--i': Math.min(idx, 5) }"
            >
                <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="sub-card-id">{{ sub.id }}</div>
                    <Tag :value="sub.status" :severity="statusSeverity(sub.status)" />
                </div>
                <div class="sub-card-service">{{ sub.service?.name || '-' }}</div>
                <div v-if="sub.service?.speed" class="sub-card-speed">{{ formatSpeed(sub.service.speed) }}</div>
                <div class="sub-card-footer">
                    <div v-if="sub.kelurahan || sub.kecamatan" class="sub-card-location">
                        <i class="pi pi-map-marker"></i>
                        <span>{{ sub.kelurahan || sub.kecamatan }}</span>
                    </div>
                    <div v-else></div>
                    <i class="pi pi-arrow-right sub-card-arrow"></i>
                </div>
            </router-link>
        </div>

        <!-- Empty -->
        <div v-else class="empty-state animate-fade-in-up">
            <i class="pi pi-inbox empty-icon"></i>
            <p>Belum ada langganan</p>
        </div>

        <!-- Infinite scroll sentinel -->
        <div ref="sentinel" class="sentinel"></div>

        <div v-if="loadingMore" class="load-more-indicator">
            <i class="pi pi-spin pi-spinner"></i>
        </div>

    </div>
</template>

<style scoped>
.page-title { color: #2a352e; }

.sub-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}
@media (min-width: 576px) { .sub-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 992px) { .sub-grid { grid-template-columns: repeat(3, 1fr); } }

.sub-card {
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border: 1px solid rgba(121, 184, 140, 0.08);
    border-radius: 0.75rem;
    padding: 1.25rem;
    text-decoration: none;
    color: inherit;
    transition: border-color 0.15s;
}
.sub-card:hover { border-color: rgba(121, 184, 140, 0.2); }

.sub-card-id { font-size: 0.8rem; font-weight: 700; color: #79b88c; letter-spacing: 0.02em; }
.sub-card-service { font-size: 1rem; font-weight: 600; color: #2a352e; margin-bottom: 0.15rem; }
.sub-card-speed { font-size: 0.82rem; color: #7e9886; margin-bottom: 0.75rem; }

.sub-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(121, 184, 140, 0.05);
}

.sub-card-location {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.78rem;
    color: #7e9886;
}
.sub-card-location i { font-size: 0.75rem; }

.sub-card-arrow { font-size: 0.8rem; color: #c4e4cc; transition: color 0.15s, transform 0.15s; }
.sub-card:hover .sub-card-arrow { color: #79b88c; transform: translateX(2px); }

.empty-state { text-align: center; padding: 4rem 2rem; color: #7e9886; }
.empty-icon { font-size: 2.5rem; color: #c4e4cc; margin-bottom: 1rem; display: block; }

.sentinel { height: 1px; }
.load-more-indicator { display: flex; justify-content: center; padding: 1.5rem; color: #7e9886; font-size: 1.2rem; }
.end-label { text-align: center; padding: 1rem; font-size: 0.8rem; color: #c4e4cc; }
</style>
