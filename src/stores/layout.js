import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLayoutStore = defineStore('portal-layout', () => {
    const sidebarVisible = ref(false);

    function toggleSidebar() {
        sidebarVisible.value = !sidebarVisible.value;
    }

    return { sidebarVisible, toggleSidebar };
}, {
    persist: true
});
