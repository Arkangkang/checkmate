# CheckMate - Priority Notification System

CheckMate adalah website notifikasi list kegiatan dan tugas interaktif berdasarkan value prioritas. Tema desain memakai unsur chess/catur, aksen glassy dan noisy, animasi smooth, dark/light mode, responsive layout, dashboard analitik, dan autentikasi Supabase dengan link verifikasi email default.

## Tech Stack

- React JS + Vite
- JavaScript
- Supabase Auth + PostgreSQL + Row Level Security
- Framer Motion untuk animasi
- Recharts untuk grafik
- Lucide React untuk ikon
- Vercel untuk hosting

## Struktur Folder

```txt
checkmate-priority-system/
├── supabase/
│   └── schema.sql
├── src/
│   ├── assets/
│   │   └── horse-mascot.svg
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── pages/
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── .env.example
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Fitur Utama

1. Onboarding page panjang dan interaktif tentang CheckMate.
2. Auth page:
   - Login dengan email atau username.
   - Signup dengan username, email, password, dan konfirmasi password.
   - Verifikasi email memakai link default Supabase.
   - Feedback khusus untuk email/username belum terdaftar, password salah, dan email belum diverifikasi.
3. Dashboard:
   - Total tugas remaining.
   - Total kegiatan remaining.
   - Total tugas selesai.
   - Total kegiatan selesai.
   - Rata-rata value.
   - Value tertinggi dan terendah.
   - Total deadline terlewat.
   - Completion rate.
   - Pie chart distribusi prioritas.
   - Bar chart tugas/kegiatan remaining dan selesai.
   - Line chart tren bulanan.
   - Top 5 tugas/kegiatan dengan value tertinggi.
4. Add Data:
   - Form tugas dengan nama, jenis tugas, deadline, dampak nilai, konsekuensi telat, tingkat kesulitan, dan note.
   - Form kegiatan dengan nama, deadline, dan note.
   - Live preview badge prioritas.
5. List Tugas:
   - Tab belum selesai dan sudah selesai.
   - Detail, edit, hapus, selesai, dan buka kembali.
6. List Kegiatan:
   - Tab belum selesai dan sudah selesai.
   - Detail, edit, hapus, selesai, dan buka kembali.
7. Notifikasi:
   - Data berhasil ditambahkan.
   - Data berhasil diedit.
   - Data berhasil dihapus.
   - Data berhasil diselesaikan.
   - Peringatan prioritas tinggi.
   - Peringatan prioritas sangat tinggi.
   - Peringatan deadline terlewat.
8. Profile:
   - Lihat username dan email.
   - Ganti username.
   - Ganti/hapus foto profil.
   - Dark mode/light mode.
   - Ukuran GUI 1-3.
9. Logout kembali ke onboarding.

## Rumus Prioritas

### Tugas

```txt
Value = (Jenis Tugas x 5%) + (Deadline x 50%) + (Dampak Nilai x 15%) + (Konsekuensi Telat x 15%) + (Tingkat Kesulitan x 15%)
```

### Kegiatan

```txt
Value = Deadline x 100%
```

### Skala Deadline

```txt
1 hari      = 100
2-3 hari    = 87.5
4-7 hari    = 75
8-14 hari   = 62.5
15-21 hari  = 50
22-30 hari  = 37.5
30-60 hari  = 25
60+ hari    = 12.5
Terlewat    = 100
```

### Kategori Prioritas

```txt
> 85 = Sangat Tinggi / Merah
> 75 = Tinggi / Kuning
> 55 = Sedang / Hijau
≤ 55 = Rendah / Biru
```

---

# Tutorial Lengkap Setup Project

## 1. Extract ZIP

Extract file ZIP ini, lalu buka folder project di Visual Studio Code.

```bash
cd checkmate-priority-system
```

## 2. Install Node.js

Pastikan Node.js sudah terpasang. Cek dengan:

```bash
node -v
npm -v
```

Jika belum ada, install Node.js LTS dari website resmi Node.js.

## 3. Install Dependency

```bash
npm install
```

## 4. Buat Project Supabase

1. Buka Supabase Dashboard.
2. Klik New Project.
3. Isi nama project, password database, dan region.
4. Tunggu project selesai dibuat.

## 5. Jalankan SQL Database

1. Masuk ke Supabase Dashboard.
2. Buka SQL Editor.
3. Klik New Query.
4. Copy isi file:

```txt
supabase/schema.sql
```

5. Paste ke SQL Editor.
6. Klik Run.

SQL tersebut akan membuat:

- Tabel `profiles`
- Tabel `items`
- Tabel `notifications`
- Trigger profile otomatis saat signup
- Function login username/email
- Row Level Security policies

## 6. Aktifkan Email Confirmation Supabase

1. Buka Supabase Dashboard.
2. Masuk ke Authentication.
3. Buka Providers.
4. Pilih Email.
5. Pastikan `Confirm email` aktif.

Dengan ini, saat user signup, Supabase akan mengirim email verifikasi otomatis.

## 7. Atur Redirect URL Supabase untuk Localhost

1. Masuk ke Authentication.
2. Buka URL Configuration.
3. Isi Site URL:

```txt
http://localhost:5173
```

4. Tambahkan Redirect URL:

```txt
http://localhost:5173/auth?verified=true
```

Nanti saat sudah deploy ke Vercel, tambahkan juga URL produksi seperti:

```txt
https://nama-project.vercel.app
https://nama-project.vercel.app/auth?verified=true
```

## 8. Ambil Supabase URL dan Anon Key

1. Buka Project Settings.
2. Buka API.
3. Copy:
   - Project URL
   - anon public key

## 9. Buat File .env

Di root project, buat file `.env` berdasarkan `.env.example`.

```bash
copy .env.example .env
```

Untuk Mac/Linux:

```bash
cp .env.example .env
```

Isi seperti ini:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Ganti value dengan data dari Supabase kamu.

## 10. Jalankan Project

```bash
npm run dev
```

Buka browser:

```txt
http://localhost:5173
```

## 11. Test Signup

1. Klik Get Started.
2. Klik Daftar.
3. Isi username, email, password, dan konfirmasi password.
4. Klik Daftar.
5. Cek inbox email.
6. Klik link verifikasi dari Supabase.
7. Setelah kembali ke halaman login, login memakai email/username dan password.

## 12. Test Fitur Utama

Setelah login:

1. Masuk ke Add Data.
2. Tambah tugas.
3. Tambah kegiatan.
4. Cek List Tugas dan List Kegiatan.
5. Klik data untuk detail/edit/hapus.
6. Klik selesai untuk memindahkan ke tab sudah selesai.
7. Cek Dashboard.
8. Cek Notifikasi.
9. Masuk Profile untuk ubah foto, username, dark mode, dan ukuran GUI.

## 13. Build Project

Sebelum deploy, cek build:

```bash
npm run build
```

Jika berhasil, folder `dist` akan dibuat.

## 14. Push ke GitHub

```bash
git init
git add .
git commit -m "initial checkmate project"
git branch -M main
git remote add origin https://github.com/username/checkmate-priority-system.git
git push -u origin main
```

## 15. Deploy ke Vercel

1. Buka Vercel.
2. Klik Add New Project.
3. Import repository GitHub kamu.
4. Framework biasanya otomatis terbaca sebagai Vite.
5. Tambahkan Environment Variables:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

6. Klik Deploy.

## 16. Update Redirect URL Supabase Setelah Deploy

Setelah deploy, salin domain Vercel kamu, contoh:

```txt
https://checkmate-priority-system.vercel.app
```

Masuk ke Supabase:

1. Authentication.
2. URL Configuration.
3. Ubah Site URL menjadi domain Vercel.
4. Tambahkan Redirect URL:

```txt
https://checkmate-priority-system.vercel.app/auth?verified=true
```

## 17. Redeploy Setelah Environment Variable Berubah

Jika kamu mengubah env di Vercel, lakukan redeploy agar variable terbaca.

## Troubleshooting

### 1. Halaman blank

Cek `.env`. Pastikan nama variable diawali `VITE_`.

### 2. Tidak bisa login username

Pastikan `supabase/schema.sql` sudah dijalankan sampai selesai dan function `resolve_login_email` berhasil dibuat.

### 3. Email verifikasi tidak masuk

Cek folder spam/promotions. Pastikan Supabase Email Provider aktif dan Confirm email aktif.

### 4. Setelah klik email verifikasi tidak kembali ke login

Cek Redirect URL Supabase. Pastikan URL lokal atau URL Vercel sudah ditambahkan.

### 5. Data user lain terlihat

Seharusnya tidak terlihat karena Row Level Security aktif. Jika terlihat, cek SQL policy di `supabase/schema.sql`.

### 6. Foto profil terlalu besar

Project ini menyimpan foto sebagai data URL kecil di tabel profiles agar tidak perlu setup Supabase Storage. Maksimal 800KB.

## Catatan Pengembangan Lanjutan

Fitur yang bisa kamu tambah nanti:

- Search dan filter berdasarkan kategori prioritas.
- Reminder browser notification memakai Notification API.
- Export data ke Excel/PDF.
- Kalender deadline bulanan.
- Supabase Storage untuk foto profil jika ingin upload file lebih profesional.
- Forgot password.
- Multi-language Indonesia/English.
