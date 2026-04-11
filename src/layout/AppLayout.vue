<script setup>
import AppTopbar from './AppTopbar.vue';
</script>

<template>
    <div class="min-h-screen flex flex-col">
        <AppTopbar />
        <main class="portal-main flex-1 p-4 md:p-8">
            <div class="max-w-6xl mx-auto">
                <Transition name="page-fade" mode="out-in">
                    <router-view />
                </Transition>
            </div>
        </main>
    </div>
</template>

<style scoped>
.portal-main {
    background: #f7fee7;
    min-height: calc(100vh - 3.5rem);
}
</style>
