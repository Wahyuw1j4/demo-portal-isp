import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import PrimeVue from 'primevue/config';
import PortalPreset from './theme/portal-preset';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

import App from './App.vue';
import router from './router';
import 'primeicons/primeicons.css';
import './assets/tailwind.css';
import './assets/styles.scss';

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

app.use(router);

app.use(PrimeVue, {
    theme: {
        preset: PortalPreset
    }
});

app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app');
