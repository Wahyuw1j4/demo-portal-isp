<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { get, post } from '@/service/api';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const subscriptions = ref([]);
const selectedSubscription = ref(route.query.subscription_id || null);
const subject = ref('');
const description = ref('');
const photo = ref(null);
const loading = ref(false);
const loadingSubs = ref(true);

onMounted(async () => {
    try {
        const { data } = await get('/subscriptions', { params: { limit: 100 } });
        subscriptions.value = (data.data.data || []).map(s => ({
            label: `${s.id} — ${s.service?.name || 'N/A'}`,
            value: s.id
        }));
    } catch (e) {
        console.error(e);
    } finally {
        loadingSubs.value = false;
    }
});

function onFileSelect(event) {
    photo.value = event.files?.[0] || null;
}

async function handleSubmit() {
    if (!selectedSubscription.value || !subject.value || !description.value) {
        toast.add({ severity: 'warn', summary: 'Peringatan', detail: 'Langganan, subject, dan deskripsi wajib diisi', life: 3000 });
        return;
    }

    loading.value = true;
    try {
        const formData = new FormData();
        formData.append('subscription_id', selectedSubscription.value);
        formData.append('subject_problem', subject.value);
        formData.append('customer_report', description.value);
        if (photo.value) {
            formData.append('photo', photo.value);
        }

        const { data } = await post('/tickets', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Tiket berhasil dibuat', life: 3000 });
        router.push(`/tickets/${data.data.ticket_id}`);
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Gagal membuat tiket', life: 4000 });
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div>
        <div class="flex items-center gap-3 mb-5">
            <button class="back-btn" @click="router.push('/tickets')">
                <i class="pi pi-arrow-left"></i>
            </button>
            <h1 class="font-display text-2xl font-semibold page-title m-0">Buat Tiket Baru</h1>
        </div>

        <div class="portal-card max-w-3xl animate-fade-in-up">
            <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">
                <div class="flex flex-col gap-2">
                    <label class="form-label">Langganan <span class="text-indigo-400">*</span></label>
                    <Select
                        v-model="selectedSubscription"
                        :options="subscriptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Pilih langganan"
                        :loading="loadingSubs"
                        class="w-full"
                        filter
                    />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="form-label">Subject <span class="text-indigo-400">*</span></label>
                    <InputText v-model="subject" placeholder="Contoh: Internet mati total" maxlength="100" class="w-full" />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="form-label">Deskripsi Masalah <span class="text-indigo-400">*</span></label>
                    <Textarea v-model="description" placeholder="Jelaskan masalah yang Anda alami..." rows="6" class="w-full" />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="form-label">Foto (opsional)</label>
                    <FileUpload
                        mode="basic"
                        accept="image/jpeg,image/png"
                        :maxFileSize="5242880"
                        chooseLabel="Pilih Foto"
                        @select="onFileSelect"
                        :auto="false"
                    />
                    <span class="text-xs page-meta">JPG/PNG, maks 5MB</span>
                </div>

                <div class="flex flex-col sm:flex-row gap-3 mt-2">
                    <Button type="submit" label="Kirim Tiket" icon="pi pi-send" :loading="loading" class="submit-btn sm:w-auto w-full" />
                    <Button type="button" label="Batal" severity="secondary" outlined @click="router.push('/tickets')" class="cancel-btn sm:w-auto w-full" />
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.page-title { color: #1f2a14; }
.page-meta { color: #728951; }

.portal-card {
    background: #ffffff;
    border: 1px solid rgba(101, 163, 13, 0.08);
    border-radius: 0.75rem;
    padding: 1.5rem;
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

.form-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #3f4f2a;
}

.submit-btn { border-radius: 0.5rem; font-weight: 600; }
.cancel-btn { border-radius: 0.5rem; }
</style>
