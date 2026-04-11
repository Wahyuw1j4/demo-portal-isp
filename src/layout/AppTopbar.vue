<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useCompanySettingsStore } from '@/stores/companySettings';
import { useRouter, useRoute } from 'vue-router';

const auth = useAuthStore();
const company = useCompanySettingsStore();
const router = useRouter();
const route = useRoute();
const mobileMenuOpen = ref(false);

const topbarLogo = computed(() => company.displayIcon);

function onLogoError(event) {
    event.target.src = '/logo.png';
}

onMounted(() => {
    company.load();
});

const navItems = [
    { label: 'Langganan', icon: 'pi pi-wifi', to: '/subscriptions' },
    { label: 'Tiket', icon: 'pi pi-ticket', to: '/tickets' },
    { label: 'Profil', icon: 'pi pi-user', to: '/profile' }
];

function isActive(item) {
    return route.path.startsWith(item.to);
}

function logout() {
    auth.clear();
    router.push('/login');
}

function navigateMobile(to) {
    mobileMenuOpen.value = false;
    router.push(to);
}
</script>

<template>
    <header class="topbar">
        <div class="topbar-inner">
            <!-- Left: Logo -->
            <router-link to="/" class="topbar-logo-link">
                <img :src="topbarLogo" :alt="company.displayName" class="topbar-logo" @error="onLogoError" />
            </router-link>

            <!-- Center: Desktop Nav -->
            <nav class="topbar-nav">
                <router-link
                    v-for="item in navItems"
                    :key="item.to"
                    :to="item.to"
                    class="topbar-nav-item"
                    :class="{ active: isActive(item) }"
                >
                    <i :class="item.icon" class="topbar-nav-icon"></i>
                    <span>{{ item.label }}</span>
                </router-link>
            </nav>

            <!-- Right: Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
                <span class="hidden lg:inline text-sm topbar-greeting">{{ auth.customerName }}</span>
                <button class="topbar-logout hidden sm:flex" @click="logout">
                    <i class="pi pi-sign-out"></i>
                    <span>Keluar</span>
                </button>
                <!-- Hamburger: always visible -->
                <button class="topbar-icon-btn md:hidden" @click="mobileMenuOpen = !mobileMenuOpen">
                    <i :class="mobileMenuOpen ? 'pi pi-times' : 'pi pi-bars'"></i>
                </button>
            </div>
        </div>

        <!-- Dropdown Menu (all screens, toggleable) -->
        <Transition name="dropdown">
            <div v-if="mobileMenuOpen" class="mobile-nav md:hidden">
                <!-- Nav items shown only on mobile (hidden on md+ since topbar-nav handles it) -->
                <div class="mobile-nav-links md:hidden">
                    <button
                        v-for="item in navItems"
                        :key="item.to"
                        class="mobile-nav-item"
                        :class="{ active: isActive(item) }"
                        @click="navigateMobile(item.to)"
                    >
                        <i :class="item.icon"></i>
                        <span>{{ item.label }}</span>
                    </button>
                    <div class="mobile-nav-divider"></div>
                </div>
                <!-- User info + logout: all screens -->
                <div class="mobile-nav-footer">
                    <span class="text-sm topbar-greeting">{{ auth.customerName }}</span>
                    <button class="mobile-logout" @click="logout">
                        <i class="pi pi-sign-out"></i> Keluar
                    </button>
                </div>
            </div>
        </Transition>
    </header>
</template>

<style scoped>
.topbar {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(246, 251, 247, 0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(121, 184, 140, 0.08);
}

.topbar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 3.5rem;
    padding: 0 1rem;
    max-width: 80rem;
    margin: 0 auto;
    gap: 1rem;
}
@media (min-width: 768px) {
    .topbar-inner { padding: 0 1.5rem; }
}

/* Logo */
.topbar-logo-link {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    text-decoration: none;
}
.topbar-logo {
    height: 2rem;
    width: auto;
    display: block;
}

/* Desktop Nav */
.topbar-nav {
    display: none;
    align-items: center;
    gap: 0.25rem;
}
@media (min-width: 768px) {
    .topbar-nav { display: flex; }
}

.topbar-nav-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.82rem;
    font-weight: 500;
    text-decoration: none;
    color: #667e70;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
}
.topbar-nav-item:hover {
    background: rgba(121, 184, 140, 0.06);
    color: #2a352e;
}
.topbar-nav-item.active {
    background: rgba(121, 184, 140, 0.08);
    color: #79b88c;
    font-weight: 600;
}
.topbar-nav-icon { font-size: 0.9rem; }

/* Actions */
.topbar-greeting {
    color: #7e9886;
    font-weight: 500;
}

.topbar-icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border: none;
    background: transparent;
    color: #667e70;
    font-size: 1rem;
    cursor: pointer;
    border-radius: 0.375rem;
    transition: background 0.15s, color 0.15s;
}
.topbar-icon-btn:hover {
    background: rgba(121, 184, 140, 0.06);
    color: #79b88c;
}

@media (min-width: 768px) {
    .topbar-icon-btn {
        display: none;
    }
}

.topbar-logout {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    border: none;
    background: transparent;
    color: #92caa2;
    font-size: 0.82rem;
    font-weight: 500;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    border-radius: 0.375rem;
    transition: background 0.15s;
}
.topbar-logout:hover { background: rgba(121, 184, 140, 0.06); }

/* === Dropdown Menu === */
.mobile-nav {
    display: flex;
    flex-direction: column;
    border-top: 1px solid rgba(121, 184, 140, 0.06);
    background: rgba(246, 251, 247, 0.98);
    backdrop-filter: blur(12px);
    max-width: 80rem;
    margin: 0 auto;
    padding: 0.5rem 1rem;
}
@media (min-width: 768px) {
    .mobile-nav { padding: 0.5rem 1.5rem; }
}

.mobile-nav-links {
    display: flex;
    flex-direction: column;
}

.mobile-nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.7rem 0.75rem;
    border: none;
    background: transparent;
    border-radius: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #667e70;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s, color 0.15s;
}
.mobile-nav-item:hover { background: rgba(121, 184, 140, 0.05); }
.mobile-nav-item.active {
    background: rgba(121, 184, 140, 0.08);
    color: #79b88c;
    font-weight: 600;
}

.mobile-nav-divider {
    height: 1px;
    background: rgba(121, 184, 140, 0.06);
    margin: 0.25rem 0;
}

.mobile-nav-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
}

.mobile-logout {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.6rem;
    border: none;
    background: transparent;
    color: #92caa2;
    font-size: 0.82rem;
    font-weight: 500;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    border-radius: 0.375rem;
    transition: background 0.15s;
}
.mobile-logout:hover { background: rgba(121, 184, 140, 0.06); }

/* Dropdown transition */
.dropdown-enter-active { transition: all 0.2s ease-out; }
.dropdown-leave-active { transition: all 0.15s ease-in; }
.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>
