import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
    {
        path: '/',
        component: () => import('@/layout/AppLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            { path: '', name: 'home', component: () => import('@/views/Home.vue') },
            { path: 'subscriptions', name: 'subscriptions', component: () => import('@/views/subscriptions/List.vue') },
            { path: 'subscriptions/:id', name: 'subscription-detail', component: () => import('@/views/subscriptions/Detail.vue') },
            { path: 'tickets', name: 'tickets', component: () => import('@/views/tickets/List.vue') },
            { path: 'tickets/create', name: 'ticket-create', component: () => import('@/views/tickets/Create.vue') },
            { path: 'tickets/:id', name: 'ticket-detail', component: () => import('@/views/tickets/Detail.vue') },
            { path: 'invoices', name: 'invoices', component: () => import('@/views/invoices/List.vue') },
            { path: 'profile', name: 'profile', component: () => import('@/views/Profile.vue') }
        ]
    },
    { path: '/login', name: 'login', component: () => import('@/views/auth/Login.vue') },
    { path: '/profile/password', name: 'profile-password', component: () => import('@/views/auth/ChangePassword.vue') }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const auth = useAuthStore();

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return next({ name: 'login' });
    }

    if (to.name === 'login' && auth.isAuthenticated) {
        return next({ name: 'home' });
    }

    // Force change password redirect
    if (auth.mustChangePassword && to.name !== 'profile-password' && to.name !== 'login') {
        return next({ name: 'profile-password' });
    }

    next();
});

export default router;
