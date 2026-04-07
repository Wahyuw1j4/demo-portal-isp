<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { get } from '@/service/api';
import Skeleton from 'primevue/skeleton';

const router = useRouter();
const loading = ref(true);

onMounted(async () => {
    try {
        const { data } = await get('/subscriptions', { params: { limit: 2 } });
        const subs = data.data.data || [];
        const total = data.data.meta?.total || subs.length;

        if (total === 1 && subs[0]?.id) {
            router.replace(`/subscriptions/${subs[0].id}`);
        } else {
            router.replace('/subscriptions');
        }
    } catch (e) {
        router.replace('/subscriptions');
    }
});
</script>

<template>
    <div class="flex items-center justify-center min-h-[50vh]">
        <div class="flex flex-col items-center gap-4">
            <Skeleton width="3rem" height="3rem" shape="circle" />
            <Skeleton width="12rem" height="1rem" borderRadius="6px" />
        </div>
    </div>
</template>
