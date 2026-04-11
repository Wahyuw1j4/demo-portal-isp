<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { get, post } from '@/service/api';
import { formatIDR } from '@/utils/currency';
import { formatDate } from '@/utils/formatTime';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import Skeleton from 'primevue/skeleton';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const subscription = ref(null);
const loading = ref(true);
const restarting = ref(false);

function statusSeverity(status) {
    const map = { ACTIVE: 'success', 'NEW REQUEST': 'info', SUSPENDED: 'danger', SETUP: 'warn' };
    return map[status] || 'secondary';
}

function invoiceSeverity(status) {
    const s = (status || '').toUpperCase();
    return s === 'PAID' ? 'success' : s === 'UNPAID' ? 'danger' : 'warn';
}

function formatSpeed(speed) {
    if (speed === null || speed === undefined || speed === '') return '-';
    const value = String(speed).trim();
    if (!value) return '-';
    return /mbps/i.test(value) ? value : `${value} Mbps`;
}

async function loadData() {
    loading.value = true;
    try {
        const { data } = await get(`/subscriptions/${route.params.id}`);
        subscription.value = data.data;
    } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Langganan tidak ditemukan', life: 3000 });
        router.push('/subscriptions');
    } finally {
        loading.value = false;
    }
}

function confirmRestart() {
    confirm.require({
        message: 'Koneksi internet akan terputus sementara selama 1-2 menit.',
        header: 'Restart Perangkat?',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Ya, Restart',
        rejectLabel: 'Batal',
        acceptClass: 'p-button-danger',
        accept: handleRestart
    });
}

async function handleRestart() {
    restarting.value = true;
    try {
        const { data } = await post(`/subscriptions/${route.params.id}/restart`);
        toast.add({ severity: 'success', summary: 'Berhasil', detail: data.message, life: 5000 });
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Gagal restart perangkat', life: 5000 });
    } finally {
        restarting.value = false;
    }
}

function openInvoice(id) {
    const invoiceBaseUrl = (import.meta.env.VITE_PUBLIC_INVOICE_BASE_URL || import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, '');
    const invoiceUrl = `${invoiceBaseUrl}/inv/${encodeURIComponent(id)}`;
    window.open(invoiceUrl, '_blank');
}

onMounted(loadData);
</script>

<template>
    <ConfirmDialog />
    <div class="detail-wrap">

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col gap-4">
            <Skeleton height="9rem" borderRadius="12px" />
            <Skeleton height="6rem" borderRadius="12px" />
            <Skeleton height="6rem" borderRadius="12px" />
        </div>

        <div v-else-if="subscription" class="flex flex-col gap-4 animate-fade-in-up">
            <!-- Profile Hero Card -->
            <div class="portal-card profile-card">
                <div class="profile-icon-wrap">
                    <i class="pi pi-wifi profile-icon"></i>
                </div>
                <div class="profile-body">
                    <div class="flex items-center gap-3 flex-wrap">
                        <div class="font-display text-xl font-bold page-title">{{ subscription.service?.name || 'Langganan' }}</div>
                        <Tag :value="subscription.status" :severity="statusSeverity(subscription.status)" />
                    </div>
                    <div class="profile-id">{{ subscription.id }}</div>
                </div>
            </div>

            <!-- Info Rows -->
            <div class="portal-card">
                <div class="info-row animate-stagger-item" style="--i:0">
                    <span class="info-label"><i class="pi pi-bolt"></i> Kecepatan</span>
                    <span class="info-value">{{ formatSpeed(subscription.service?.speed) }}</span>
                </div>
                <div class="info-row animate-stagger-item" style="--i:1">
                    <span class="info-label"><i class="pi pi-tag"></i> Tagihan Bulanan</span>
                    <span class="info-value font-semibold">{{ subscription.service?.price ? formatIDR(subscription.service.price) : '-' }}</span>
                </div>
                <div class="info-row animate-stagger-item" style="--i:2">
                    <span class="info-label"><i class="pi pi-calendar"></i> Aktif Sejak</span>
                    <span class="info-value">{{ subscription.installation_date ? formatDate(subscription.installation_date) : '-' }}</span>
                </div>
                <div class="info-row animate-stagger-item last" style="--i:3">
                    <span class="info-label"><i class="pi pi-map-marker"></i> Lokasi</span>
                    <span class="info-value">{{ subscription.kelurahan || subscription.kecamatan || subscription.kabupaten_kota || '-' }}</span>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap gap-3">
                <Button
                    label="Restart Perangkat"
                    icon="pi pi-refresh"
                    :loading="restarting"
                    :disabled="subscription.status !== 'ACTIVE'"
                    @click="confirmRestart"
                />
            </div>

            <!-- Invoice History -->
            <div v-if="subscription.invoices?.length || subscription.invoices?.length === 0">
                <h2 class="font-display text-base font-semibold page-title mb-3">Riwayat Invoice</h2>

                <div v-if="!subscription.invoices?.length" class="empty-invoices">
                    <i class="pi pi-file"></i> Belum ada invoice
                </div>

                <div v-else class="flex flex-col gap-2">
                    <button
                        v-for="(inv, idx) in subscription.invoices"
                        :key="inv.id"
                        class="invoice-card animate-stagger-item"
                        :style="{ '--i': idx }"
                        @click="openInvoice(inv.id)"
                    >
                        <div class="invoice-left">
                            <div class="invoice-no">{{ inv.invoice_no }}</div>
                            <div class="invoice-date">{{ formatDate(inv.created_at) }}</div>
                            <div class="invoice-due">Jatuh tempo: {{ inv.due_date ? formatDate(inv.due_date) : '-' }}</div>
                        </div>
                        <div class="invoice-right">
                            <div class="invoice-amount">{{ formatIDR(inv.grand_total) }}</div>
                            <Tag :value="inv.status?.toUpperCase()" :severity="invoiceSeverity(inv.status)" class="invoice-tag" />
                        </div>
                        <i class="pi pi-external-link invoice-arrow"></i>   
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
.page-title { color: #1f2a14; }

.detail-wrap {
    max-width: 680px;
    margin: 0 auto;
}

.back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border: 1px solid rgba(101, 163, 13, 0.1);
    background: #ffffff;
    color: #55693a;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
}
.back-btn:hover { background: rgba(101, 163, 13, 0.05); color: #65a30d; }

.portal-card {
    background: #ffffff;
    border: 1px solid rgba(101, 163, 13, 0.08);
    border-radius: 0.75rem;
    padding: 1.25rem 1.5rem;
}

/* Profile Hero */
.profile-card {
    display: flex;
    align-items: center;
    gap: 1.25rem;
}

.profile-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 0.75rem;
    background: rgba(101, 163, 13, 0.08);
    flex-shrink: 0;
}

.profile-icon {
    font-size: 1.4rem;
    color: #65a30d;
}

.profile-body { flex: 1; min-width: 0; }

.profile-id {
    font-size: 0.8rem;
    color: #728951;
    margin-top: 0.25rem;
    font-weight: 500;
    letter-spacing: 0.02em;
}

/* Info Rows */
.info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 0;
    border-bottom: 1px solid rgba(101, 163, 13, 0.05);
    gap: 1rem;
}
.info-row.last { border-bottom: none; }

.info-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: #728951;
    font-weight: 500;
}
.info-label i { font-size: 0.8rem; color: #a3e635; }

.info-value {
    font-size: 0.9rem;
    color: #1f2a14;
    text-align: right;
}

/* Invoice Cards */
.invoice-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.9rem 1.25rem;
    background: #ffffff;
    border: 1px solid rgba(101, 163, 13, 0.08);
    border-radius: 0.75rem;
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: border-color 0.15s, background 0.15s;
}
.invoice-card:hover {
    border-color: rgba(101, 163, 13, 0.2);
    background: rgba(101, 163, 13, 0.02);
}

.invoice-left { flex: 1; min-width: 0; }

.invoice-no {
    font-size: 0.88rem;
    font-weight: 600;
    color: #65a30d;
}

.invoice-date {
    font-size: 0.78rem;
    color: #728951;
    margin-top: 0.15rem;
}

.invoice-due {
    font-size: 0.74rem;
    color: #a16207;
    margin-top: 0.15rem;
}

.invoice-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.3rem;
}

.invoice-amount {
    font-size: 0.9rem;
    font-weight: 700;
    color: #1f2a14;
}

.invoice-tag { font-size: 0.68rem !important; }

.invoice-arrow {
    font-size: 0.78rem;
    color: #bef264;
    flex-shrink: 0;
    transition: color 0.15s;
}
.invoice-card:hover .invoice-arrow { color: #65a30d; }

.empty-invoices {
    padding: 1.5rem;
    text-align: center;
    color: #728951;
    font-size: 0.88rem;
    background: #ffffff;
    border: 1px solid rgba(101, 163, 13, 0.06);
    border-radius: 0.75rem;
}
</style>
