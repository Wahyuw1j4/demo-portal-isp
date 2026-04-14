<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import { post } from '@/service/api';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const toast = useToast();
const auth = useAuthStore();

const identifier = ref('');
const password = ref('');
const loading = ref(false);

async function handleLogin() {
    if (!identifier.value || !password.value) {
        toast.add({ severity: 'warn', summary: 'Peringatan', detail: 'Email/telepon dan password wajib diisi', life: 3000 });
        return;
    }
    loading.value = true;
    try {
        const { data } = await post('/auth/login', {
            identifier: identifier.value,
            password: password.value
        });
        auth.setAuth(data.data);
        if (data.data.mustChangePassword) {
            router.push('/profile/password');
        } else {
            router.push('/');
        }
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Login Gagal', detail: err.response?.data?.message || 'Terjadi kesalahan', life: 4000 });
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="login-page">
        <!-- Left decorative panel (desktop only) -->
        <div class="login-deco">
            <div class="login-deco-content">
                <div class="login-deco-dot"></div>
                <h1 class="login-deco-heading font-display">Selamat datang.</h1>
                <p class="login-deco-sub">Kelola langganan, tiket, dan invoice Anda dengan mudah.</p>
            </div>
            <div class="login-deco-pattern"></div>
        </div>

        <!-- Right form panel -->
        <div class="login-form-wrap">
            <div class="login-form-card animate-fade-in-up">
                <div class="mb-8">
                    <h2 class="font-display text-2xl font-semibold login-title m-0">Masuk</h2>
                    <p class="login-subtitle mt-2">Gunakan email atau nomor telepon Anda</p>
                </div>

                <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
                    <div class="flex flex-col gap-2">
                        <label for="identifier" class="login-label">Email atau No. Telepon</label>
                        <InputText id="identifier" v-model="identifier" placeholder="email@contoh.com atau 08xxx" class="w-full login-input" />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="password" class="login-label">Password</label>
                        <Password id="password" v-model="password" :feedback="false" toggleMask placeholder="Masukkan password" class="w-full" inputClass="w-full login-input" />
                    </div>

                    <Button type="submit" label="Masuk" icon="pi pi-arrow-right" iconPos="right" :loading="loading" class="w-full mt-2 login-btn" />
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-page {
    display: flex;
    min-height: 100vh;
}

/* === Decorative Left Panel === */
.login-deco {
    display: none;
    position: relative;
    width: 45%;
    background: linear-gradient(135deg, #4b735b 0%, #58886a 40%, #79b88c 100%);
    overflow: hidden;
}
@media (min-width: 992px) {
    .login-deco { display: flex; align-items: center; justify-content: center; }
}

.login-deco-content {
    position: relative;
    z-index: 2;
    padding: 3rem;
    max-width: 400px;
}

.login-deco-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #abd9b7;
    margin-bottom: 1.5rem;
    box-shadow: 0 0 20px rgba(171, 217, 183, 0.4);
}

.login-deco-heading {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 700;
    color: #eaf6ee;
    line-height: 1.1;
    margin: 0;
}

.login-deco-sub {
    font-size: 1rem;
    color: rgba(234, 246, 238, 0.7);
    margin-top: 1rem;
    line-height: 1.6;
}

.login-deco-pattern {
    position: absolute;
    inset: 0;
    background-image:
        radial-gradient(circle at 20% 80%, rgba(146, 202, 162, 0.2) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(234, 246, 238, 0.08) 0%, transparent 40%);
    z-index: 1;
}

/* === Right Form Panel === */
.login-form-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: #f6fbf7;
}
.login-form-card {
    width: 100%;
    max-width: 400px;
    padding: 2.5rem;
    background: #ffffff;
    border: 1px solid rgba(121, 184, 140, 0.08);
    border-radius: 0.75rem;
}
.login-title {
    color: #2a352e;
}
.login-subtitle {
    font-size: 0.9rem;
    color: #7e9886;
}
.login-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #4e6358;
}
.login-btn {
    height: 2.75rem;
    font-weight: 600;
    border-radius: 0.5rem;
}
</style>
