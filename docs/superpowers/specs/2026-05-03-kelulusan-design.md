# Fitur Info Kelulusan

**Tanggal:** 2026-05-03  
**Status:** Disetujui

## Ringkasan

Admin dapat upload Excel berisi data kelulusan siswa dan mengatur jam rilis pengumuman. Siswa login dan melihat status kelulusan mereka. Sebelum waktu rilis, siswa melihat countdown timer. Setelah waktu rilis, siswa melihat kartu kelulusan personal.

## Kolom Excel

| Kolom | Keterangan |
|-------|------------|
| No | Nomor urut (diabaikan) |
| Nama | Nama siswa |
| Tanggal Lahir | Tanggal lahir siswa |
| No. Peserta | **NISN siswa** (dipakai untuk matching ke database) |
| Kota | Kota asal |
| No. Ujian | Nomor ujian (5 digit) |
| Agama | Agama siswa |
| Kelas | Rombel siswa (e.g., XII F-1) |
| Status | `LULUS` atau `TIDAK LULUS` |

## Database

### Tabel `graduation_records`
```sql
id          uuid primary key default uuid_generate_v4()
nisn        text not null
nama        text
tanggal_lahir text
no_ujian    text
kota        text
agama       text
kelas       text
status      text check (status in ('LULUS', 'TIDAK LULUS'))
created_at  timestamptz default now()
```
Upload baru = DELETE semua row lama, lalu INSERT batch baru (satu angkatan saja).

### Tabel `app_settings`
```sql
key         text primary key
value       text
updated_at  timestamptz default now()
```
Row untuk fitur ini: `key = 'graduation_release_time'`, `value = ISO 8601 timestamp`.

## API Routes

| Method | Route | Auth | Fungsi |
|--------|-------|------|--------|
| `GET` | `/api/admin/grades/kelulusan` | admin | Ambil daftar data kelulusan dengan filter & pagination |
| `POST` | `/api/admin/grades/kelulusan/import` | admin | Upload Excel, replace semua data lama |
| `GET` | `/api/admin/settings/graduation-time` | admin | Ambil waktu rilis |
| `POST` | `/api/admin/settings/graduation-time` | admin | Simpan waktu rilis |
| `GET` | `/api/students/grades/kelulusan` | student | Ambil data kelulusan milik siswa + waktu rilis |

Semua route: `export const runtime = 'edge'`, auth via `auth_token` cookie JWT.

## Halaman Admin `/admin/grades/kelulusan`

Tiga panel:

**1. Panel Waktu Rilis**
- Input datetime (tanggal + jam WIB)
- Tombol Simpan
- Status: "Belum diset" / "Akan rilis pada [datetime]" / "Sudah aktif sejak [datetime]"

**2. Panel Import Excel**
- Tombol Import Excel (modal dengan file upload)
- Warning jika data lama akan diganti
- Hasil: jumlah berhasil / gagal
- Download template tersedia

**3. Tabel Data Kelulusan**
- Kolom: No, Nama, NISN, No. Ujian, Kelas, Status (badge)
- Filter by kelas, search by nama/NISN
- Statistik: total, lulus, tidak lulus

**Menu `/admin/grades`:** Card baru "Info Kelulusan" dengan gradient emas/kuning di samping TKA dan PDSS.

## Halaman Siswa `/student/grades/kelulusan`

Tiga kondisi berdasarkan response API:

**Kondisi A — Waktu belum diset**
- Pesan: "Pengumuman kelulusan belum dijadwalkan"

**Kondisi B — Sebelum waktu rilis**
- Countdown real-time (hari, jam, menit, detik) update tiap detik
- Teks: "Pengumuman Kelulusan akan dibuka pada [tanggal jam]"

**Kondisi C — Setelah waktu rilis**
- Kartu personal: Nama, Kelas, No. Peserta, No. Ujian, Kota, Agama, Tanggal Lahir
- Badge besar: LULUS (hijau) atau TIDAK LULUS (merah)
- Jika NISN tidak ditemukan di data: "Data kelulusan Anda belum tersedia"

**Menu `/student/grades`:** Card baru "Info Kelulusan" di samping TKA dan PDSS.

## File yang Dibuat/Diubah

| File | Aksi |
|------|------|
| `supabase_kelulusan_schema.sql` | Baru — SQL untuk buat kedua tabel |
| `src/app/admin/grades/page.tsx` | Edit — tambah card Kelulusan |
| `src/app/admin/grades/kelulusan/page.tsx` | Baru — halaman admin |
| `src/app/api/admin/grades/kelulusan/route.ts` | Baru — GET list data |
| `src/app/api/admin/grades/kelulusan/import/route.ts` | Baru — POST import Excel |
| `src/app/api/admin/settings/graduation-time/route.ts` | Baru — GET & POST waktu rilis |
| `src/app/student/grades/page.tsx` | Edit — tambah card Kelulusan |
| `src/app/student/grades/kelulusan/page.tsx` | Baru — halaman siswa |
| `src/app/api/students/grades/kelulusan/route.ts` | Baru — GET data kelulusan siswa |
