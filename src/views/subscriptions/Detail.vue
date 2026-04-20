<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { get, post, put } from '@/service/api';
import { formatIDR } from '@/utils/currency';
import { formatDate } from '@/utils/formatTime';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import Skeleton from 'primevue/skeleton';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const subscription = ref(null);
const cpeInfo = ref(null);
const loading = ref(true);
const restarting = ref(false);
const wifiSubmitting = ref(false);
const wifiSsid = ref('');
const wifiPassword = ref('');
const wifiSsid5g = ref('');
const wifiPassword5g = ref('');
const applyToBoth = ref(true);
const showWifiForm = ref(false);

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
    loadCpeInfo();
}

async function loadCpeInfo() {
    try {
        const { data } = await get(`/subscriptions/${route.params.id}/cpe`);
        cpeInfo.value = data.data;
        if (cpeInfo.value?.wifi_ssid) {
            wifiSsid.value = cpeInfo.value.wifi_ssid;
        }
        if (cpeInfo.value?.wifi_ssid_5g) {
            wifiSsid5g.value = cpeInfo.value.wifi_ssid_5g;
        }
        if (cpeInfo.value?.wifi_ssid_5g === undefined || cpeInfo.value?.wifi_ssid_5g === null) {
            applyToBoth.value = true;
        } else {
            applyToBoth.value = false;
        }
    } catch {
        cpeInfo.value = null;
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

async function handleWifiSave() {
    if (!wifiSsid.value && !wifiPassword.value && !wifiSsid5g.value && !wifiPassword5g.value) {
        toast.add({ severity: 'warn', summary: 'Perhatian', detail: 'Isi SSID atau password', life: 3000 });
        return;
    }
    if (wifiPassword.value && wifiPassword.value.length < 8) {
        toast.add({ severity: 'warn', summary: 'Perhatian', detail: 'Password WiFi 2.4GHz minimal 8 karakter', life: 3000 });
        return;
    }
    if (wifiPassword5g.value && wifiPassword5g.value.length < 8) {
        toast.add({ severity: 'warn', summary: 'Perhatian', detail: 'Password WiFi 5GHz minimal 8 karakter', life: 3000 });
        return;
    }
    wifiSubmitting.value = true;
    try {
        const payload = {};
        if (wifiSsid.value) payload.ssid_2g = wifiSsid.value;
        if (wifiPassword.value) payload.password_2g = wifiPassword.value;
        if (!applyToBoth.value) {
            if (wifiSsid5g.value) payload.ssid_5g = wifiSsid5g.value;
            if (wifiPassword5g.value) payload.password_5g = wifiPassword5g.value;
        } else {
            payload.apply_to_both = true;
        }
        const { data } = await put(`/subscriptions/${route.params.id}/wifi`, payload);
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Pengaturan WiFi diperbarui', life: 5000 });
        showWifiForm.value = false;
        wifiPassword.value = '';
        wifiPassword5g.value = '';
        if (payload.ssid_2g) {
            cpeInfo.value = { ...cpeInfo.value, wifi_ssid: payload.ssid_2g };
        }
        if (payload.ssid_5g) {
            cpeInfo.value = { ...cpeInfo.value, wifi_ssid_5g: payload.ssid_5g };
        } else if (payload.apply_to_both && payload.ssid_2g) {
            cpeInfo.value = { ...cpeInfo.value, wifi_ssid_5g: payload.ssid_2g };
        }
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Gagal menyimpan pengaturan WiFi', life: 5000 });
    } finally {
        wifiSubmitting.value = false;
    }
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
                <Button
                    v-if="!showWifiForm"
                    label="Ubah WiFi"
                    icon="pi pi-pencil"
                    severity="secondary"
                    outlined
                    :disabled="subscription.status !== 'ACTIVE'"
                    @click="showWifiForm = true"
                />
            </div>

            <!-- WiFi Settings Form -->
            <div v-if="showWifiForm" class="portal-card wifi-form animate-fade-in-up">
                <div class="flex items-center gap-2 mb-3">
                    <i class="pi pi-wifi" style="font-size: 1rem; color: #79b88c;"></i>
                    <h2 class="font-display text-base font-semibold page-title m-0">Pengaturan WiFi</h2>
                </div>

                <!-- Apply to both toggle -->
                <div v-if="cpeInfo?.wifi_ssid_5g !== null" class="flex items-center gap-2 mb-3 p-2 rounded-lg" style="background: rgba(121,184,140,0.06);">
                    <input type="checkbox" id="applyBoth" v-model="applyToBoth" class="accent-[#79b88c]" />
                    <label for="applyBoth" class="text-sm text-gray-600 cursor-pointer">Terapkan ke semua band (2.4GHz & 5GHz)</label>
                </div>

                <!-- 2.4GHz Band -->
                <div class="mb-4">
                    <div class="flex items-center gap-2 mb-2">
                        <Tag value="2.4 GHz" severity="success" style="font-size: 0.7rem;" />
                        <span class="wifi-label mb-0">Band 2.4 GHz</span>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div>
                            <label class="wifi-label">Nama WiFi (SSID)</label>
                            <InputText v-model="wifiSsid" placeholder="Nama WiFi 2.4GHz" class="w-full" />
                        </div>
                        <div>
                            <label class="wifi-label">Password WiFi</label>
                            <Password v-model="wifiPassword" placeholder="Minimal 8 karakter" :feedback="false" toggleMask class="w-full" />
                        </div>
                    </div>
                </div>

                <!-- 5GHz Band -->
                <div v-if="!applyToBoth" class="mb-4">
                    <div class="flex items-center gap-2 mb-2">
                        <Tag value="5 GHz" severity="warn" style="font-size: 0.7rem;" />
                        <span class="wifi-label mb-0">Band 5 GHz</span>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div>
                            <label class="wifi-label">Nama WiFi (SSID)</label>
                            <InputText v-model="wifiSsid5g" placeholder="Nama WiFi 5GHz" class="w-full" />
                        </div>
                        <div>
                            <label class="wifi-label">Password WiFi</label>
                            <Password v-model="wifiPassword5g" placeholder="Minimal 8 karakter" :feedback="false" toggleMask class="w-full" />
                        </div>
                    </div>
                </div>

                <div class="flex gap-2">
                    <Button label="Simpan" icon="pi pi-check" :loading="wifiSubmitting" class="flex-1" @click="handleWifiSave" />
                    <Button label="Batal" icon="pi pi-times" severity="secondary" outlined class="flex-1" @click="showWifiForm = false; wifiPassword = ''; wifiPassword5g = ''; wifiSsid = cpeInfo?.wifi_ssid || ''; wifiSsid5g = cpeInfo?.wifi_ssid_5g || ''" />
                </div>
            </div>

            <!-- CPE Device Info (TR-069) -->
            <div v-if="cpeInfo" class="portal-card">
                <div class="flex items-center gap-2 mb-2">
                    <i class="pi pi-box" style="font-size: 1rem; color: #79b88c;"></i>
                    <h2 class="font-display text-base font-semibold page-title m-0">Perangkat (CPE)</h2>
                    <Tag :value="cpeInfo.status" :severity="cpeInfo.status === 'online' ? 'success' : 'danger'" class="ml-2" style="font-size: 0.7rem;" />
                </div>
                <div class="info-row" style="--i:0">
                    <span class="info-label"><i class="pi pi-box"></i> Model</span>
                    <span class="info-value">{{ cpeInfo.manufacturer || '' }} {{ cpeInfo.model_name || '—' }}</span>
                </div>
                <div class="info-row" style="--i:1">
                    <span class="info-label"><i class="pi pi-wifi"></i> WiFi 2.4 GHz</span>
                    <span class="info-value">{{ cpeInfo.wifi_ssid || '—' }}</span>
                </div>
                <div v-if="cpeInfo.wifi_ssid_5g !== null && cpeInfo.wifi_ssid_5g !== undefined" class="info-row" style="--i:2">
                    <span class="info-label"><i class="pi pi-wifi"></i> WiFi 5 GHz</span>
                    <span class="info-value">{{ cpeInfo.wifi_ssid_5g || '—' }}</span>
                </div>
                <div v-if="cpeInfo.rx_power != null" class="info-row" style="--i:3">
                    <span class="info-label"><i class="pi pi-bolt"></i> RX Power</span>
                    <span class="info-value font-semibold" :class="cpeInfo.rx_power > -25 ? 'text-green-600' : cpeInfo.rx_power > -28 ? 'text-yellow-600' : 'text-red-600'">
                        {{ cpeInfo.rx_power.toFixed(2) }} dBm
                    </span>
                </div>
                <div v-if="cpeInfo.wan_ip" class="info-row" style="--i:4">
                    <span class="info-label"><i class="pi pi-globe"></i> WAN IP</span>
                    <span class="info-value">{{ cpeInfo.wan_ip }}</span>
                </div>
                <div v-if="cpeInfo.firmware_version" class="info-row last" style="--i:5">
                    <span class="info-label"><i class="pi pi-info-circle"></i> Firmware</span>
                    <span class="info-value text-xs">{{ cpeInfo.firmware_version }}</span>
                </div>
            </div>

            <!-- Connected Devices -->
            <div v-if="cpeInfo?.connected_hosts?.length" class="portal-card">
                <div class="flex items-center gap-2 mb-2">
                    <i class="pi pi-users" style="font-size: 1rem; color: #79b88c;"></i>
                    <h2 class="font-display text-base font-semibold page-title m-0">Perangkat Terhubung</h2>
                    <Tag :value="cpeInfo.connected_hosts.length" severity="info" class="ml-2" style="font-size: 0.7rem;" />
                </div>
                <div v-for="(host, idx) in cpeInfo.connected_hosts" :key="idx" class="host-row" :class="{ last: idx === cpeInfo.connected_hosts.length - 1 }">
                    <div class="host-info">
                        <span class="host-name">{{ host.hostname || 'Unknown' }}</span>
                        <span class="host-meta">{{ host.ip || '—' }}</span>
                    </div>
                    <div class="host-meta-end">
                        <span class="host-mac">{{ host.mac || '—' }}</span>
                        <Tag v-if="host.active" value="Online" severity="success" style="font-size: 0.65rem;" />
                        <Tag v-else value="Offline" severity="danger" style="font-size: 0.65rem;" />
                    </div>
                </div>
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
.page-title { color: #2a352e; }

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
    border: 1px solid rgba(121, 184, 140, 0.1);
    background: #ffffff;
    color: #667e70;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
}
.back-btn:hover { background: rgba(121, 184, 140, 0.05); color: #79b88c; }

.portal-card {
    background: #ffffff;
    border: 1px solid rgba(121, 184, 140, 0.08);
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
    background: rgba(121, 184, 140, 0.08);
    flex-shrink: 0;
}

.profile-icon {
    font-size: 1.4rem;
    color: #79b88c;
}

.profile-body { flex: 1; min-width: 0; }

.profile-id {
    font-size: 0.8rem;
    color: #7e9886;
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
    border-bottom: 1px solid rgba(121, 184, 140, 0.05);
    gap: 1rem;
}
.info-row.last { border-bottom: none; }

.info-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: #7e9886;
    font-weight: 500;
}
.info-label i { font-size: 0.8rem; color: #abd9b7; }

.info-value {
    font-size: 0.9rem;
    color: #2a352e;
    text-align: right;
}

/* Invoice Cards */
.invoice-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.9rem 1.25rem;
    background: #ffffff;
    border: 1px solid rgba(121, 184, 140, 0.08);
    border-radius: 0.75rem;
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: border-color 0.15s, background 0.15s;
}
.invoice-card:hover {
    border-color: rgba(121, 184, 140, 0.2);
    background: rgba(121, 184, 140, 0.02);
}

.invoice-left { flex: 1; min-width: 0; }

.invoice-no {
    font-size: 0.88rem;
    font-weight: 600;
    color: #79b88c;
}

.invoice-date {
    font-size: 0.78rem;
    color: #7e9886;
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
    color: #2a352e;
}

.invoice-tag { font-size: 0.68rem !important; }

.invoice-arrow {
    font-size: 0.78rem;
    color: #c4e4cc;
    flex-shrink: 0;
    transition: color 0.15s;
}
.invoice-card:hover .invoice-arrow { color: #79b88c; }

.empty-invoices {
    padding: 1.5rem;
    text-align: center;
    color: #7e9886;
    font-size: 0.88rem;
    background: #ffffff;
    border: 1px solid rgba(121, 184, 140, 0.06);
    border-radius: 0.75rem;
}

/* WiFi Settings */
.wifi-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 500;
    color: #7e9886;
    margin-bottom: 0.35rem;
}

.wifi-form :deep(.p-password-input) {
    width: 100%;
}

.wifi-form :deep(.p-password) {
    width: 100%;
}

/* Host list */
.host-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.65rem 0;
    border-bottom: 1px solid rgba(121, 184, 140, 0.05);
    gap: 0.5rem;
}
.host-row.last { border-bottom: none; }

.host-info { display: flex; flex-direction: column; min-width: 0; }
.host-name { font-size: 0.85rem; font-weight: 500; color: #2a352e; }
.host-meta { font-size: 0.75rem; color: #7e9886; }

.host-meta-end { display: flex; align-items: center; gap: 0.5rem; }
.host-mac { font-size: 0.72rem; color: #7e9886; font-family: monospace; }
</style>
