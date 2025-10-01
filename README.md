# 🏟️ Brigata Curva Sud CMS

Platform CMS produksi untuk mengelola konten, jadwal pertandingan, dan merchandise Brigata Curva Sud. Dibangun dengan Next.js 14 (App Router), Prisma, NextAuth, Tailwind CSS, dan React Query dengan database **Supabase PostgreSQL**.

## ✨ Fitur Utama

- **Konten & Media**: Manajemen artikel multi-status (draft/review/publish), halaman statis, serta media manager
- **Jadwal Pertandingan**: CRUD jadwal dengan status pertandingan, skor akhir, dan highlight
- **E-Commerce**: Produk multi-varian, kupon diskon, keranjang, checkout, dan pengelolaan pesanan
- **Interaksi Supporter**: Komentar dengan moderasi, polling matchday, newsletter, serta registrasi relawan
- **Panel Admin RBAC**: Navigasi berbasis peran, dashboard metrik, audit log, dan modul-modul khusus per role

## 🚀 Quick Start

### Cara Cepat (dengan Setup Script)

```bash
# 1. Install dependencies
npm install

# 2. Jalankan setup helper
node setup.js
```

Setup script akan memandu Anda melalui konfigurasi Supabase dan environment variables.

### Cara Manual

1. **Setup Supabase Database**
   - Buat project di [Supabase](https://supabase.com)
   - Copy connection string dari Settings → Database

2. **Install dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasikan environment**
   ```bash
   # Copy template
   cp .env.example .env
   
   # Edit .env dan isi:
   # - DATABASE_URL (dari Supabase)
   # - NEXTAUTH_SECRET (generate dengan crypto)
   ```

4. **Generate Prisma Client & Push Schema**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed data awal (opsional tapi dianjurkan)**
   ```bash
   npm run db:seed
   ```
   
   **Kredensial admin default:**
   - Email: `admin@bcs.com`
   - Password: `admin123`
   
   ⚠️ **Ganti password setelah login pertama!**

## 🎯 Menjalankan Project

```bash
# Development server
npm run dev

# Production build
npm run build
npm start

# Linting & Testing
npm run lint
npm run test
npm run test:watch

# Database tools
npx prisma studio    # GUI untuk database
npx prisma db push   # Push schema changes
```

Buka browser: **http://localhost:3000**

## 📁 Struktur Project

```
bcs-cms/
├── src/
│   ├── app/
│   │   ├── (admin)/      # Admin dashboard (protected)
│   │   ├── (public)/     # Public pages
│   │   ├── api/          # API routes
│   │   └── layout.tsx    # Root layout
│   ├── components/       # Reusable UI components
│   ├── lib/             # Utilities (auth, prisma, RBAC)
│   ├── server/          # Server-side logic
│   │   └── services/    # Business logic layer
│   └── types/           # TypeScript definitions
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
└── public/              # Static assets
```

## 📚 Dokumentasi

- **[QUICK-START.md](./QUICK-START.md)** - Setup cepat dalam 5 menit
- **[PANDUAN-INSTALASI.md](./PANDUAN-INSTALASI.md)** - Dokumentasi lengkap & troubleshooting

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, React Query
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js v5 (JWT sessions + RBAC)
- **Forms**: React Hook Form + Zod validation
- **UI**: Lucide Icons, date-fns, DOMPurify
- **Testing**: Vitest

## 🚀 Deploy ke Production

### Vercel (Recommended)

1. Push project ke GitHub
2. Import di [Vercel](https://vercel.com)
3. Tambahkan Environment Variables:
   ```
   DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:6543/postgres?pgbouncer=true
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_URL=https://your-domain.com
   ```
4. Deploy!

**Tips Production:**
- Gunakan Supabase connection pooling (port **6543**)
- Enable Row Level Security jika diperlukan
- Setup automatic database backups
- Monitor dengan Supabase Dashboard

## 🔒 Keamanan

Sebelum production:
- ✅ Ganti password admin default (`admin@bcs.com` / `admin123`)
- ✅ Update `NEXTAUTH_SECRET` dengan secret yang kuat
- ✅ Review CORS settings di API routes
- ✅ Setup rate limiting untuk API endpoints
- ✅ Enable HTTPS (otomatis di Vercel)
- ✅ Review database permissions di Supabase

## ⚙️ Fitur Utama

- 🔐 **Authentication**: JWT-based dengan RBAC (4 roles: user, moderator, content-admin, super-admin)
- 📝 **Content Management**: Articles, Pages, Matches, Polls
- 🛒 **E-commerce**: Products, Orders, Coupons, Cart management
- 💬 **Interactions**: Comments, Newsletter, Volunteer registrations
- 📊 **Admin Dashboard**: Stats, Audit logs, Media library
- 🔄 **Real-time**: React Query untuk data synchronization
- 📤 **Export**: Newsletter subscribers CSV export

## 🆘 Troubleshooting

**Database connection error?**
- Verifikasi `DATABASE_URL` di `.env`
- Cek koneksi internet
- Pastikan project Supabase aktif

**Module not found?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Prisma Client error?**
```bash
npx prisma generate
```

**Port 3000 sudah terpakai?**
```bash
# Gunakan port lain
PORT=3001 npm run dev
```

Lihat [PANDUAN-INSTALASI.md](./PANDUAN-INSTALASI.md) untuk troubleshooting lengkap.

---

**Selamat berkarya bersama Curva Sud!** 💛🖤
