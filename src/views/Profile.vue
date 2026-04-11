<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { get, patch, post } from '@/service/api';
import { useAuthStore } from '@/stores/auth';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';

const toast = useToast();
const auth = useAuthStore();

const profile = ref({});
const loading = ref(true);
const saving = ref(false);

// Password change
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const changingPassword = ref(false);

const initials = computed(() => {
    const name = profile.value.name || auth.customerName || '?';
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
});

onMounted(async () => {
    try {
        const { data } = await get('/profile');
        profile.value = data.data;
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
});

async function saveProfile() {
    saving.value = true;
    try {
        const { data } = await patch('/profile', {
            email: profile.value.email,
            phone: profile.value.phone,
            address: profile.value.address
        });
        profile.value = data.data;
        auth.customer = { ...auth.customer, email: data.data.email, phone: data.data.phone };
        localStorage.setItem('portal_customer', JSON.stringify(auth.customer));
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Profil berhasil diperbarui', life: 3000 });
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Gagal memperbarui profil', life: 4000 });
    } finally {
        saving.value = false;
    }
}

async function handleChangePassword() {
    if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
        toast.add({ severity: 'warn', summary: 'Peringatan', detail: 'Semua field password wajib diisi', life: 3000 });
        return;
    }
    if (newPassword.value.length < 8) {
        toast.add({ severity: 'warn', summary: 'Peringatan', detail: 'Password baru minimal 8 karakter', life: 3000 });
        return;
    }
    if (newPassword.value !== confirmPassword.value) {
        toast.add({ severity: 'warn', summary: 'Peringatan', detail: 'Konfirmasi password tidak cocok', life: 3000 });
        return;
    }

    changingPassword.value = true;
    try {
        await post('/auth/change-password', {
            oldPassword: oldPassword.value,
            newPassword: newPassword.value
        });
        oldPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Password berhasil diubah', life: 3000 });
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Gagal mengubah password', life: 4000 });
    } finally {
        changingPassword.value = false;
    }
}
</script>

<template>
    <div class="profile-wrap">
        <h1 class="font-display text-2xl font-semibold page-title mb-5 animate-fade-in-up">Profil Saya</h1>

        <div v-if="loading" class="flex flex-col gap-4">
            <Skeleton height="8rem" borderRadius="12px" />
            <Skeleton height="17rem" borderRadius="12px" />
            <Skeleton height="15rem" borderRadius="12px" />
        </div>

        <div v-else class="content-stack">
            <!-- Profile Info -->
            <div class="portal-card animate-fade-in-up" style="animation-delay: 0.1s">
                <!-- Avatar -->
                <div class="flex items-center gap-4 mb-6">
                    <div class="profile-avatar">{{ initials }}</div>
                    <div>
                        <div class="font-semibold text-lg page-title">{{ profile.name || '-' }}</div>
                        <div class="text-sm page-meta">ID: {{ profile.id || '-' }}</div>
                    </div>
                </div>

                <h3 class="font-display text-base font-semibold page-title mb-4">Informasi Akun</h3>

                <div class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="form-label">Nama</label>
                        <InputText :modelValue="profile.name" disabled class="w-full disabled-input" />
                        <span class="text-xs page-meta">Nama tidak dapat diubah</span>
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="form-label">ID Pelanggan</label>
                        <InputText :modelValue="profile.id" disabled class="w-full disabled-input" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="form-label">Email</label>
                        <InputText v-model="profile.email" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="form-label">No. Telepon</label>
                        <InputText v-model="profile.phone" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="form-label">Alamat</label>
                        <InputText v-model="profile.address" class="w-full" />
                    </div>
                    <Button label="Simpan" icon="pi pi-check" :loading="saving" @click="saveProfile" class="w-fit save-btn" />
                </div>
            </div>

            <!-- Change Password -->
            <div class="portal-card portal-card--password animate-fade-in-up" style="animation-delay: 0.2s">
                <h3 class="font-display text-base font-semibold page-title mb-4">
                    <i class="pi pi-lock mr-2 text-sm"></i>Ganti Password
                </h3>

                <form @submit.prevent="handleChangePassword" class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="form-label">Password Lama</label>
                        <Password v-model="oldPassword" :feedback="false" toggleMask class="w-full" inputClass="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="form-label">Password Baru</label>
                        <Password v-model="newPassword" toggleMask class="w-full" inputClass="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="form-label">Konfirmasi Password Baru</label>
                        <Password v-model="confirmPassword" :feedback="false" toggleMask class="w-full" inputClass="w-full" />
                    </div>
                    <Button type="submit" label="Ganti Password" icon="pi pi-lock" :loading="changingPassword" class="w-fit save-btn" />
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-title { color: #1f2a14; }
.page-meta { color: #728951; }

.profile-wrap {
    max-width: 680px;
    margin: 0 auto;
}

.content-stack {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.portal-card {
    background: #ffffff;
    border: 1px solid rgba(101, 163, 13, 0.08);
    border-radius: 0.75rem;
    padding: 1.5rem;
}

.portal-card--password {
    border-left: 3px solid #84cc16;
}

.profile-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    background: #65a30d;
    color: #ffffff;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    flex-shrink: 0;
}

.form-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #3f4f2a;
}

.disabled-input {
    opacity: 0.7;
}

.save-btn {
    border-radius: 0.5rem;
    font-weight: 600;
}
</style>
