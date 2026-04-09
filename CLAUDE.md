# Portal - Customer Self-Service

Vue 3 SPA untuk pelanggan ISP: lihat subscription, buat tiket, cek invoice, kelola profil.

## Quick Start

```bash
npm install
npm run dev        # Vite dev server (port 5174)
npm run build      # Output ke dist/
```

## Struktur Folder

```
src/
├── main.js                 # App bootstrap: PrimeVue (portal-preset theme), Pinia, Router
├── router/index.js         # Route definitions + requiresAuth guard
├── views/
│   ├── Home.vue            # Dashboard pelanggan
│   ├── Profile.vue         # Edit profil
│   ├── auth/
│   │   ├── Login.vue
│   │   └── ChangePassword.vue
│   ├── subscriptions/
│   │   ├── List.vue        # Daftar subscription
│   │   └── Detail.vue      # Detail subscription
│   ├── tickets/
│   │   ├── List.vue        # Daftar tiket
│   │   ├── Create.vue      # Buat tiket baru
│   │   └── Detail.vue      # Detail tiket
│   └── invoices/
│       └── List.vue        # Daftar invoice
├── stores/
│   ├── auth.js             # Token, customer data (persisted)
│   └── layout.js           # Layout state
├── layout/
│   ├── AppLayout.vue       # Main layout wrapper
│   └── AppTopbar.vue       # Navigation bar
├── service/                # API client (Axios)
├── theme/
│   └── portal-preset/      # Custom PrimeVue theme (bukan Aura default)
├── utils/
└── assets/
```

## Konvensi Kode

- **Vue 3 Composition API** dengan `<script setup>`.
- **PrimeVue 4** dengan custom theme `portal-preset` (beda dari frontend admin yang pakai Aura).
- **Pinia** + `pinia-plugin-persistedstate` untuk state management.
- **Tailwind CSS** + **Sass** untuk styling.
- **Axios** untuk HTTP requests.

## Routing

```
/                    # Home (dashboard pelanggan)
/subscriptions       # Daftar subscription
/subscriptions/:id   # Detail subscription
/tickets             # Daftar tiket
/tickets/create      # Buat tiket
/tickets/:id         # Detail tiket
/invoices            # Daftar invoice
/profile             # Profil pelanggan
/login               # Login
/change-password     # Ganti password (wajib saat pertama login)
```

Guard `requiresAuth` auto redirect ke `/login` jika belum autentikasi.

## Perbedaan dengan Frontend Admin

- Scope lebih kecil: hanya fitur customer-facing.
- Custom theme `portal-preset` (bukan Aura).
- Tidak ada Socket.IO, maps, chart, atau Excel export.
- Auth via `requireCustomer` middleware di backend (bukan requireSession + requireScope).
- Dev server di port 5174 (frontend admin di 5173).

## Environment Variables

File `.env`:
```
VITE_API_URL=http://demoisp.wahyuwijaya.biz.id
```

## Production

Build output di `dist/`. Di-serve oleh Apache di domain `customer.wahyuwijaya.biz.id` dengan `FallbackResource /index.html`.
