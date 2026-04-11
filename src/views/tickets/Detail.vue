<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { get } from '@/service/api';
import { formatTime } from '@/utils/formatTime';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import Timeline from 'primevue/timeline';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const ticket = ref(null);
const loading = ref(true);

function ticketSeverity(status) {
    const map = { Open: 'danger', 'In Progress': 'warn', Closed: 'success', Canceled: 'secondary' };
    return map[status] || 'info';
}

onMounted(async () => {
    try {
        const { data } = await get(`/tickets/${route.params.id}`);
        ticket.value = data.data;
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Tiket tidak ditemukan', life: 3000 });
        router.push('/tickets');
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div>
        <div class="flex items-center gap-3 mb-5">
            <button class="back-btn" @click="router.push('/tickets')">
                <i class="pi pi-arrow-left"></i>
            </button>
            <h1 class="font-display text-2xl font-semibold page-title m-0">Detail Tiket</h1>
        </div>

        <div v-if="loading" class="flex flex-col gap-4">
            <Skeleton height="10rem" borderRadius="8px" />
            <Skeleton height="8rem" borderRadius="8px" />
        </div>

        <div v-else-if="ticket" class="flex flex-col gap-5 animate-fade-in-up">
            <!-- Ticket Info -->
            <div class="portal-card">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                    <div>
                        <div class="text-xs font-semibold page-meta uppercase tracking-wider mb-1">Tiket</div>
                        <div class="font-display text-xl font-semibold page-title">{{ ticket.ticket_id }}</div>
                    </div>
                    <Tag :value="ticket.status" :severity="ticketSeverity(ticket.status)" class="text-sm" />
                </div>

                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Subject</div>
                        <div class="info-value">{{ ticket.subject_problem }}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Langganan</div>
                        <div class="info-value">
                            <router-link v-if="ticket.subscription" :to="`/subscriptions/${ticket.subscription.id}`" class="portal-link">
                                {{ ticket.subscription.id }} — {{ ticket.subscription.service?.name || '' }}
                            </router-link>
                            <span v-else>-</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Tanggal Dibuat</div>
                        <div class="info-value">{{ formatTime(ticket.created_at) }}</div>
                    </div>
                    <div v-if="ticket.closed_at" class="info-item">
                        <div class="info-label">Tanggal Ditutup</div>
                        <div class="info-value">{{ formatTime(ticket.closed_at) }}</div>
                    </div>
                </div>
            </div>

            <!-- Customer Report -->
            <div class="portal-card">
                <h3 class="font-display text-lg font-semibold page-title mb-3">Laporan Pelanggan</h3>
                <div class="customer-report">
                    <p class="whitespace-pre-wrap m-0">{{ ticket.customer_report || '-' }}</p>
                </div>
                <div v-if="ticket.picture_from_customer" class="mt-4">
                    <img :src="ticket.picture_from_customer" alt="Foto dari pelanggan" class="ticket-photo" />
                </div>
            </div>

            <!-- Technician Update -->
            <div v-if="ticket.technician_update_desc" class="portal-card technician-card">
                <h3 class="font-display text-lg font-semibold page-title mb-3">Update dari Teknisi</h3>
                <p class="whitespace-pre-wrap m-0 tech-text">{{ ticket.technician_update_desc }}</p>
            </div>

            <!-- Activity Timeline -->
            <div v-if="ticket.ticket_subscription_activities?.length" class="portal-card">
                <h3 class="font-display text-lg font-semibold page-title mb-3">Timeline Aktivitas</h3>
                <Timeline :value="ticket.ticket_subscription_activities" class="mt-2 timeline-indigo">
                    <template #content="{ item }">
                        <div class="text-sm">
                            <div class="font-semibold timeline-msg">{{ item.message || 'Update' }}</div>
                            <div class="text-xs page-meta mt-1">{{ formatTime(item.created_at) }}</div>
                        </div>
                    </template>
                </Timeline>
            </div>

            <!-- Photos -->
            <div v-if="ticket.ticket_subscription_photos?.length" class="portal-card">
                <h3 class="font-display text-lg font-semibold page-title mb-3">Foto</h3>
                <div class="flex flex-wrap gap-3">
                    <img
                        v-for="photo in ticket.ticket_subscription_photos"
                        :key="photo.id"
                        :src="photo.url || photo.photo"
                        alt="Foto tiket"
                        class="ticket-photo-thumb"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-title { color: #2a352e; }
.page-meta { color: #7e9886; }

.portal-card {
    background: #ffffff;
    border: 1px solid rgba(121, 184, 140, 0.08);
    border-radius: 0.75rem;
    padding: 1.5rem;
}

.back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border: 1px solid rgba(121, 184, 140, 0.1);
    background: #ffffff;
    color: #667e70;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
}
.back-btn:hover { background: rgba(121, 184, 140, 0.05); color: #79b88c; }

.portal-link {
    color: #79b88c;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.15s;
}
.portal-link:hover { color: #679f79; }

/* Info Grid */
.info-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
}
@media (min-width: 768px) { .info-grid { grid-template-columns: repeat(2, 1fr); } }

.info-item {
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(121, 184, 140, 0.05);
}

.info-label {
    font-size: 0.78rem;
    font-weight: 500;
    color: #7e9886;
    margin-bottom: 0.2rem;
}

.info-value {
    font-size: 0.95rem;
    font-weight: 600;
    color: #2a352e;
}

/* Customer Report Blockquote */
.customer-report {
    border-left: 3px solid #79b88c;
    padding-left: 1rem;
    color: #4e6358;
}

/* Technician Card */
.technician-card {
    border-left: 3px solid #92caa2;
}
.tech-text { color: #4e6358; }

/* Timeline */
.timeline-indigo :deep(.p-timeline-event-connector) {
    background: #79b88c !important;
    opacity: 0.3;
}
.timeline-indigo :deep(.p-timeline-event-marker) {
    border-color: #79b88c !important;
    background: #79b88c !important;
}
.timeline-msg { color: #2a352e; }

/* Photos */
.ticket-photo {
    max-width: 320px;
    border-radius: 0.75rem;
    border: 1px solid rgba(121, 184, 140, 0.08);
}

.ticket-photo-thumb {
    width: 8rem;
    height: 8rem;
    object-fit: cover;
    border-radius: 0.75rem;
    border: 1px solid rgba(121, 184, 140, 0.08);
    transition: transform 0.15s ease;
    cursor: pointer;
}
.ticket-photo-thumb:hover { transform: scale(1.05); }
</style>
