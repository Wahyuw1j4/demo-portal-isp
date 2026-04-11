import { defineStore } from 'pinia';
import axios from 'axios';

const resolveApiBase = () => {
    const envBase = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim();
    if (envBase) return envBase.replace(/\/+$/, '');
    if (typeof window !== 'undefined') return window.location.origin.replace(/\/+$/, '');
    return '';
};

export const useCompanySettingsStore = defineStore('portal-company-settings', {
    state: () => ({
        companyName: '',
        logoUrl: '',
        iconUrl: '',
        loaded: false,
    }),
    getters: {
        displayName: (state) => state.companyName || 'Customer Portal',
        displayLogo: (state) => state.logoUrl || '/logo.png',
        displayIcon: (state) => state.iconUrl || state.logoUrl || '/logo.png',
    },
    actions: {
        async load() {
            if (this.loaded) return;

            try {
                const apiBase = resolveApiBase();
                if (!apiBase) return;

                const { data } = await axios.get(`${apiBase}/api/settings/public/company`, {
                    timeout: 10000,
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });

                const cfg = data?.data ?? data ?? {};
                this.companyName = cfg.company_name || '';
                this.logoUrl = cfg.company_logo_url || '';
                this.iconUrl = cfg.company_icon_url || '';
            } catch (error) {
                console.error('Failed to load company settings for portal:', error);
            } finally {
                this.loaded = true;
            }
        },
    },
});
