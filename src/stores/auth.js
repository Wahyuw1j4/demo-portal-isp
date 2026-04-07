import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('portal-auth', () => {
    const token = ref(localStorage.getItem('portal_token') || null);
    const customer = ref(JSON.parse(localStorage.getItem('portal_customer') || 'null'));
    const mustChangePassword = ref(false);

    const isAuthenticated = computed(() => !!token.value);
    const customerName = computed(() => customer.value?.name || '');

    function setAuth(data) {
        token.value = data.accessToken;
        customer.value = data.customer;
        mustChangePassword.value = data.mustChangePassword || false;
        localStorage.setItem('portal_token', data.accessToken);
        localStorage.setItem('portal_customer', JSON.stringify(data.customer));
    }

    function clear() {
        token.value = null;
        customer.value = null;
        mustChangePassword.value = false;
        localStorage.removeItem('portal_token');
        localStorage.removeItem('portal_customer');
    }

    return { token, customer, mustChangePassword, isAuthenticated, customerName, setAuth, clear };
}, {
    persist: true
});
