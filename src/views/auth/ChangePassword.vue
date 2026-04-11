<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { post } from '@/service/api';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const toast = useToast();
const auth = useAuthStore();

const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);

async function handleChange() {
    if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
        toast.add({ severity: 'warn', summary: 'Peringatan', detail: 'Semua field wajib diisi', life: 3000 });
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

    loading.value = true;
    try {
        await post('/auth/change-password', {
            oldPassword: oldPassword.value,
            newPassword: newPassword.value
        });
        auth.mustChangePassword = false;
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Password berhasil diubah', life: 3000 });
        router.push('/');
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Terjadi kesalahan', life: 4000 });
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="chpw-page">
        <!-- Left decorative panel (desktop only) -->
        <div class="chpw-deco">
            <div class="chpw-deco-content">
                <i class="pi pi-lock chpw-deco-icon"></i>
                <h1 class="chpw-deco-heading font-display">Amankan akun Anda.</h1>
                <p class="chpw-deco-sub">Buat password baru yang kuat untuk melindungi akun Anda.</p>
            </div>
            <div class="chpw-deco-pattern"></div>
        </div>

        <!-- Right form panel -->
        <div class="chpw-form-wrap">
            <div class="chpw-form-card animate-fade-in-up">
                <div class="mb-8">
                    <h2 class="font-display text-2xl font-semibold chpw-title m-0">Ganti Password</h2>
                    <p class="chpw-subtitle mt-2">Anda harus mengganti password default</p>
                </div>

                <form @submit.prevent="handleChange" class="flex flex-col gap-5">
                    <div class="flex flex-col gap-2">
                        <label class="chpw-label">Password Lama</label>
                        <Password v-model="oldPassword" :feedback="false" toggleMask class="w-full" inputClass="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="chpw-label">Password Baru</label>
                        <Password v-model="newPassword" toggleMask class="w-full" inputClass="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="chpw-label">Konfirmasi Password Baru</label>
                        <Password v-model="confirmPassword" :feedback="false" toggleMask class="w-full" inputClass="w-full" />
                    </div>
                    <Button type="submit" label="Simpan Password" icon="pi pi-check" :loading="loading" class="w-full mt-2 chpw-btn" />
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chpw-page {
    display: flex;
    min-height: 100vh;
}

.chpw-deco {
    display: none;
    position: relative;
    width: 45%;
    background: linear-gradient(135deg, #365314 0%, #3f6212 40%, #65a30d 100%);
    overflow: hidden;
}
@media (min-width: 992px) {
    .chpw-deco { display: flex; align-items: center; justify-content: center; }
}

.chpw-deco-content {
    position: relative;
    z-index: 2;
    padding: 3rem;
    max-width: 400px;
}

.chpw-deco-icon {
    font-size: 2.5rem;
    color: #a3e635;
    margin-bottom: 1.5rem;
    display: block;
}

.chpw-deco-heading {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 700;
    color: #ecfccb;
    line-height: 1.1;
    margin: 0;
}

.chpw-deco-sub {
    font-size: 1rem;
    color: rgba(236, 252, 203, 0.7);
    margin-top: 1rem;
    line-height: 1.6;
}

.chpw-deco-pattern {
    position: absolute;
    inset: 0;
    background-image:
        radial-gradient(circle at 30% 70%, rgba(132, 204, 22, 0.2) 0%, transparent 50%),
        radial-gradient(circle at 70% 30%, rgba(236, 252, 203, 0.08) 0%, transparent 40%);
    z-index: 1;
}

.chpw-form-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: #f7fee7;
}
.chpw-form-card {
    width: 100%;
    max-width: 400px;
    padding: 2.5rem;
    background: #ffffff;
    border: 1px solid rgba(101, 163, 13, 0.08);
    border-radius: 0.75rem;
}
.chpw-title { color: #1f2a14; }
.chpw-subtitle { font-size: 0.9rem; color: #728951; }
.chpw-label { font-size: 0.85rem; font-weight: 600; color: #3f4f2a; }
.chpw-btn {
    height: 2.75rem;
    font-weight: 600;
    border-radius: 0.5rem;
}
</style>
