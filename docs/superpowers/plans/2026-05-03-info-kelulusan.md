# Info Kelulusan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin upload Excel data kelulusan + atur jam rilis; siswa lihat countdown sebelum jam rilis, lalu kartu kelulusan personal setelahnya.

**Architecture:** Tabel `graduation_records` menyimpan data Excel (matching by NISN dari kolom "No. Peserta"). Tabel `app_settings` menyimpan waktu rilis. Lima API route baru mengikuti pola edge-runtime + JWT cookie yang sudah ada. Dua halaman baru (admin + student) mengikuti pola glass-panel Tailwind.

**Tech Stack:** Next.js 16 (edge runtime), Supabase (supabaseAdmin), Tailwind CSS, xlsx (sudah di package.json), jose JWT (sudah di package.json)

---

### Task 1: Database Schema

**Files:**
- Create: `supabase_kelulusan_schema.sql`

- [ ] **Step 1: Buat file SQL**

```sql
-- supabase_kelulusan_schema.sql
-- Jalankan di Supabase SQL Editor

-- 1. Tabel graduation_records
create table if not exists public.graduation_records (
  id            uuid default uuid_generate_v4() primary key,
  nisn          text not null,
  nama          text,
  tanggal_lahir text,
  no_ujian      text,
  kota          text,
  agama         text,
  kelas         text,
  status        text check (status in ('LULUS', 'TIDAK LULUS')),
  created_at    timestamptz default now()
);

-- 2. Tabel app_settings (key-value untuk konfigurasi sistem)
create table if not exists public.app_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz default now()
);

-- 3. Enable RLS
alter table public.graduation_records enable row level security;
alter table public.app_settings enable row level security;

-- 4. Policies graduation_records
create policy "Admins full access graduation_records" on public.graduation_records
  for all using (is_admin());

create policy "Anyone can read graduation_records" on public.graduation_records
  for select using (true);

-- 5. Policies app_settings
create policy "Admins full access app_settings" on public.app_settings
  for all using (is_admin());

create policy "Anyone can read app_settings" on public.app_settings
  for select using (true);
```

- [ ] **Step 2: Jalankan di Supabase SQL Editor**

Buka Supabase project → SQL Editor → paste isi `supabase_kelulusan_schema.sql` → Run.

Expected: kedua tabel terbuat tanpa error.

- [ ] **Step 3: Verifikasi tabel**

Di Supabase → Table Editor, konfirmasi `graduation_records` dan `app_settings` muncul.

- [ ] **Step 4: Commit**

```bash
git add supabase_kelulusan_schema.sql
git commit -m "feat: add graduation_records and app_settings schema"
```

---

### Task 2: Graduation Time API

**Files:**
- Create: `src/app/api/admin/settings/graduation-time/route.ts`

- [ ] **Step 1: Buat file route**

```typescript
// src/app/api/admin/settings/graduation-time/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'

export const runtime = 'edge'

const SETTING_KEY = 'graduation_release_time'

export async function GET(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie') || ''
        const token = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const { data } = await supabaseAdmin
            .from('app_settings')
            .select('value')
            .eq('key', SETTING_KEY)
            .maybeSingle()

        return NextResponse.json({ releaseTime: data?.value || null })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie') || ''
        const token = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const { releaseTime } = await request.json()
        if (!releaseTime) return NextResponse.json({ error: 'releaseTime is required' }, { status: 400 })

        const { error } = await supabaseAdmin
            .from('app_settings')
            .upsert({ key: SETTING_KEY, value: releaseTime, updated_at: new Date().toISOString() })

        if (error) throw error

        return NextResponse.json({ success: true, releaseTime })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
```

- [ ] **Step 2: Verifikasi manual**

Jalankan dev server: `npm run dev`

Di browser DevTools console (login sebagai admin):
```js
// GET — harus return null
fetch('/api/admin/settings/graduation-time').then(r=>r.json()).then(console.log)

// POST — simpan waktu
fetch('/api/admin/settings/graduation-time', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ releaseTime: '2026-05-17T10:00:00.000Z' })
}).then(r=>r.json()).then(console.log)

// GET lagi — harus return waktu yang disimpan
fetch('/api/admin/settings/graduation-time').then(r=>r.json()).then(console.log)
```

Expected: GET pertama `{ releaseTime: null }`, POST `{ success: true }`, GET kedua `{ releaseTime: "2026-05-17T10:00:00.000Z" }`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/settings/graduation-time/route.ts
git commit -m "feat: add graduation release time API"
```

---

### Task 3: Admin Kelulusan List API

**Files:**
- Create: `src/app/api/admin/grades/kelulusan/route.ts`

- [ ] **Step 1: Buat file route**

```typescript
// src/app/api/admin/grades/kelulusan/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'

export const runtime = 'edge'

export async function GET(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie') || ''
        const token = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const url = new URL(request.url)
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const search = url.searchParams.get('search') || ''
        const kelas = url.searchParams.get('kelas') || ''

        let query = supabaseAdmin
            .from('graduation_records')
            .select('*', { count: 'exact' })

        if (search) {
            query = query.or(`nama.ilike.%${search}%,nisn.ilike.%${search}%`)
        }
        if (kelas) {
            query = query.eq('kelas', kelas)
        }

        query = query.order('nama', { ascending: true })

        if (limit !== -1) {
            const from = (page - 1) * limit
            query = query.range(from, from + limit - 1)
        }

        const { data, error, count } = await query
        if (error) throw error

        // Stats global (tanpa filter)
        const { data: allRecords } = await supabaseAdmin
            .from('graduation_records')
            .select('status')

        const totalLulus = allRecords?.filter(r => r.status === 'LULUS').length || 0
        const totalTidakLulus = allRecords?.filter(r => r.status === 'TIDAK LULUS').length || 0

        return NextResponse.json({
            data: data || [],
            total: count || 0,
            stats: { lulus: totalLulus, tidak_lulus: totalTidakLulus }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
```

- [ ] **Step 2: Verifikasi manual**

Di browser DevTools (login sebagai admin):
```js
fetch('/api/admin/grades/kelulusan').then(r=>r.json()).then(console.log)
```
Expected: `{ data: [], total: 0, stats: { lulus: 0, tidak_lulus: 0 } }`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/grades/kelulusan/route.ts
git commit -m "feat: add admin kelulusan list API"
```

---

### Task 4: Admin Kelulusan Import API

**Files:**
- Create: `src/app/api/admin/grades/kelulusan/import/route.ts`

- [ ] **Step 1: Buat file route**

```typescript
// src/app/api/admin/grades/kelulusan/import/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'
import * as XLSX from 'xlsx'

export const runtime = 'edge'

export async function POST(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie') || ''
        const token = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const formData = await request.formData()
        const file = formData.get('file') as File
        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const workbook = XLSX.read(buffer, { type: 'buffer' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet)

        if (!jsonData || jsonData.length === 0) {
            return NextResponse.json({ error: 'File Excel kosong atau format tidak sesuai' }, { status: 400 })
        }

        // Hapus semua data lama
        await supabaseAdmin
            .from('graduation_records')
            .delete()
            .gte('created_at', '1970-01-01T00:00:00Z')

        const results = { success: [] as any[], failed: [] as any[] }

        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i]
            try {
                const nisn = row['No. Peserta']?.toString().trim()
                if (!nisn) {
                    results.failed.push({ row: i + 2, reason: 'Kolom "No. Peserta" tidak ditemukan atau kosong' })
                    continue
                }

                const rawStatus = row['Status']?.toString().trim().toUpperCase()
                if (rawStatus !== 'LULUS' && rawStatus !== 'TIDAK LULUS') {
                    results.failed.push({ row: i + 2, nisn, reason: `Status tidak valid: "${row['Status']}" — harus LULUS atau TIDAK LULUS` })
                    continue
                }

                const record = {
                    nisn,
                    nama: row['Nama']?.toString().trim() || null,
                    tanggal_lahir: row['Tanggal Lahir']?.toString().trim() || null,
                    no_ujian: row['No. Ujian']?.toString().trim() || null,
                    kota: row['Kota']?.toString().trim() || null,
                    agama: row['Agama']?.toString().trim() || null,
                    kelas: row['Kelas']?.toString().trim() || null,
                    status: rawStatus as 'LULUS' | 'TIDAK LULUS',
                }

                const { error } = await supabaseAdmin
                    .from('graduation_records')
                    .insert(record)

                if (error) throw error
                results.success.push({ row: i + 2, nisn })
            } catch (err: any) {
                results.failed.push({ row: i + 2, nisn: row['No. Peserta'], reason: err.message })
            }
        }

        return NextResponse.json({
            message: 'Import completed',
            total: jsonData.length,
            success: results.success.length,
            failed: results.failed.length,
            details: results
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Gagal import file' }, { status: 500 })
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/admin/grades/kelulusan/import/route.ts
git commit -m "feat: add kelulusan Excel import API"
```

---

### Task 5: Student Kelulusan API

**Files:**
- Create: `src/app/api/students/grades/kelulusan/route.ts`

- [ ] **Step 1: Buat file route**

```typescript
// src/app/api/students/grades/kelulusan/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/utils/supabase-admin'
import { verifyToken } from '@/lib/auth'

export const runtime = 'edge'

export async function GET(request: Request) {
    try {
        const cookieHeader = request.headers.get('cookie') || ''
        const token = cookieHeader.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1]
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const payload = await verifyToken(token)
        if (!payload || payload.role !== 'student') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const nisn = payload.nisn as string

        // Ambil waktu rilis
        const { data: setting } = await supabaseAdmin
            .from('app_settings')
            .select('value')
            .eq('key', 'graduation_release_time')
            .maybeSingle()

        const releaseTime = setting?.value || null
        const isReleased = releaseTime ? new Date() >= new Date(releaseTime) : false

        if (!isReleased) {
            return NextResponse.json({ releaseTime, isReleased: false, record: null })
        }

        // Ambil data kelulusan siswa
        const { data: record } = await supabaseAdmin
            .from('graduation_records')
            .select('*')
            .eq('nisn', nisn)
            .maybeSingle()

        return NextResponse.json({ releaseTime, isReleased: true, record: record || null })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
```

- [ ] **Step 2: Verifikasi manual**

Di browser DevTools (login sebagai student):
```js
fetch('/api/students/grades/kelulusan').then(r=>r.json()).then(console.log)
```
Expected sebelum rilis: `{ releaseTime: "...", isReleased: false, record: null }`
Expected setelah rilis: `{ releaseTime: "...", isReleased: true, record: { nisn: "...", nama: "...", status: "LULUS" } }`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/students/grades/kelulusan/route.ts
git commit -m "feat: add student kelulusan API"
```

---

### Task 6: Admin Kelulusan Page

**Files:**
- Create: `src/app/admin/grades/kelulusan/page.tsx`

- [ ] **Step 1: Buat file halaman**

```tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { useDebounce } from '@/hooks/useDebounce'

interface GraduationRecord {
    id: string
    nisn: string
    nama: string | null
    tanggal_lahir: string | null
    no_ujian: string | null
    kota: string | null
    agama: string | null
    kelas: string | null
    status: 'LULUS' | 'TIDAK LULUS'
}

export default function AdminKelulusanPage() {
    const [releaseTimeInput, setReleaseTimeInput] = useState('')
    const [savedReleaseTime, setSavedReleaseTime] = useState<string | null>(null)
    const [savingTime, setSavingTime] = useState(false)

    const [records, setRecords] = useState<GraduationRecord[]>([])
    const [total, setTotal] = useState(0)
    const [stats, setStats] = useState({ lulus: 0, tidak_lulus: 0 })
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const [kelasFilter, setKelasFilter] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 500)
    const itemsPerPage = 20

    const [showImportModal, setShowImportModal] = useState(false)
    const [importFile, setImportFile] = useState<File | null>(null)
    const [importing, setImporting] = useState(false)
    const [importResult, setImportResult] = useState<any>(null)

    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: ''
    })

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ show: true, type, message })
        setTimeout(() => setNotification({ show: false, type: 'success', message: '' }), 3000)
    }

    const fetchReleaseTime = useCallback(async () => {
        const res = await fetch('/api/admin/settings/graduation-time')
        const result = await res.json()
        if (result.releaseTime) {
            setSavedReleaseTime(result.releaseTime)
            const dt = new Date(result.releaseTime)
            const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 16)
            setReleaseTimeInput(local)
        }
    }, [])

    const fetchRecords = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.append('page', currentPage.toString())
            params.append('limit', itemsPerPage.toString())
            if (debouncedSearch) params.append('search', debouncedSearch)
            if (kelasFilter) params.append('kelas', kelasFilter)

            const res = await fetch(`/api/admin/grades/kelulusan?${params}`)
            const result = await res.json()
            if (!res.ok) throw new Error(result.error)
            setRecords(result.data || [])
            setTotal(result.total || 0)
            setStats(result.stats || { lulus: 0, tidak_lulus: 0 })
        } catch (error: any) {
            showNotification('error', error.message)
        } finally {
            setLoading(false)
        }
    }, [currentPage, debouncedSearch, kelasFilter])

    useEffect(() => { fetchReleaseTime() }, [fetchReleaseTime])
    useEffect(() => { fetchRecords() }, [fetchRecords])
    useEffect(() => { setCurrentPage(1) }, [debouncedSearch, kelasFilter])

    const handleSaveTime = async () => {
        if (!releaseTimeInput) return
        setSavingTime(true)
        try {
            const isoTime = new Date(releaseTimeInput).toISOString()
            const res = await fetch('/api/admin/settings/graduation-time', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ releaseTime: isoTime })
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error)
            setSavedReleaseTime(isoTime)
            showNotification('success', 'Waktu rilis berhasil disimpan!')
        } catch (error: any) {
            showNotification('error', error.message)
        } finally {
            setSavingTime(false)
        }
    }

    const getReleaseStatus = () => {
        if (!savedReleaseTime) return { label: 'Belum diset', color: 'text-slate-400' }
        const now = new Date()
        const release = new Date(savedReleaseTime)
        if (now >= release) {
            return { label: `Sudah aktif sejak ${release.toLocaleString('id-ID')}`, color: 'text-green-400' }
        }
        return { label: `Akan rilis pada ${release.toLocaleString('id-ID')}`, color: 'text-yellow-400' }
    }

    const downloadTemplate = () => {
        const template = [{
            'No': 1,
            'Nama': 'Contoh Nama Siswa',
            'Tanggal Lahir': '01 Januari 2007',
            'No. Peserta': '0012345678',
            'Kota': 'Pati',
            'No. Ujian': '12345',
            'Agama': 'Islam',
            'Kelas': 'XII F-1',
            'Status': 'LULUS'
        }]
        const ws = XLSX.utils.json_to_sheet(template)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Template Kelulusan')
        XLSX.writeFile(wb, 'Template_Import_Kelulusan.xlsx')
        showNotification('success', 'Template berhasil didownload!')
    }

    const handleImport = async () => {
        if (!importFile) return
        setImporting(true)
        try {
            const fd = new FormData()
            fd.append('file', importFile)
            const res = await fetch('/api/admin/grades/kelulusan/import', {
                method: 'POST',
                body: fd
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.error)
            setImportResult(result)
            showNotification('success', `Import selesai: ${result.success} berhasil, ${result.failed} gagal`)
            if (result.success > 0) fetchRecords()
        } catch (error: any) {
            showNotification('error', error.message)
        } finally {
            setImporting(false)
        }
    }

    const totalPages = Math.ceil(total / itemsPerPage)
    const releaseStatus = getReleaseStatus()
    const kelasOptions = Array.from(new Set(records.map(r => r.kelas).filter(Boolean))).sort() as string[]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
                        Info Kelulusan
                    </h2>
                    <p className="text-slate-400 text-sm">Kelola data pengumuman kelulusan siswa.</p>
                </div>
                <button
                    onClick={() => { setShowImportModal(true); setImportResult(null); setImportFile(null) }}
                    className="inline-flex items-center px-6 py-3 text-sm font-bold text-white bg-amber-600/20 border border-amber-500/50 rounded-xl hover:bg-amber-600/40 hover:-translate-y-0.5 transition-all"
                >
                    <svg className="w-5 h-5 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                    </svg>
                    Import Excel
                </button>
            </div>

            {/* Release Time Panel */}
            <div className="glass-panel p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-white font-bold">Waktu Rilis Pengumuman</h3>
                        <p className={`text-xs font-medium ${releaseStatus.color}`}>{releaseStatus.label}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <input
                        type="datetime-local"
                        value={releaseTimeInput}
                        onChange={(e) => setReleaseTimeInput(e.target.value)}
                        className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                    <button
                        onClick={handleSaveTime}
                        disabled={savingTime || !releaseTimeInput}
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {savingTime ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm font-medium mb-1">Total Siswa</p>
                    <p className="text-3xl font-bold text-white">{total}</p>
                </div>
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm font-medium mb-1">LULUS</p>
                    <p className="text-3xl font-bold text-green-400">{stats.lulus}</p>
                </div>
                <div className="glass-panel p-6">
                    <p className="text-slate-400 text-sm font-medium mb-1">TIDAK LULUS</p>
                    <p className="text-3xl font-bold text-red-400">{stats.tidak_lulus}</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="glass-panel p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input
                        type="text"
                        placeholder="Cari nama atau NISN..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <select
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 transition-all"
                        value={kelasFilter}
                        onChange={(e) => setKelasFilter(e.target.value)}
                    >
                        <option value="">Semua Kelas</option>
                        {kelasOptions.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="glass-panel overflow-hidden border border-white/10">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-black/20 border-b border-white/5">
                            <tr>
                                <th className="px-4 py-4">No</th>
                                <th className="px-4 py-4">Nama</th>
                                <th className="px-4 py-4">NISN</th>
                                <th className="px-4 py-4">No. Ujian</th>
                                <th className="px-4 py-4">Kelas</th>
                                <th className="px-4 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array.from({ length: 6 }).map((_, j) => (
                                            <td key={j} className="px-4 py-4">
                                                <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : records.length > 0 ? (
                                records.map((record, idx) => (
                                    <tr key={record.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-4 text-slate-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                        <td className="px-4 py-4 font-medium text-white">{record.nama || '-'}</td>
                                        <td className="px-4 py-4 font-mono text-slate-400 text-xs">{record.nisn}</td>
                                        <td className="px-4 py-4 text-slate-300">{record.no_ujian || '-'}</td>
                                        <td className="px-4 py-4 text-slate-300">{record.kelas || '-'}</td>
                                        <td className="px-4 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                record.status === 'LULUS'
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        Belum ada data kelulusan. Import Excel untuk memulai.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && records.length > 0 && (
                    <div className="p-4 border-t border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                        <div className="text-slate-400">
                            Menampilkan <span className="font-semibold text-white">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-white">{Math.min(currentPage * itemsPerPage, total)}</span> dari <span className="font-semibold text-white">{total}</span> data
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-slate-800 border border-white/10 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                            <div className="px-4 py-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300 font-medium">
                                Halaman {currentPage} / {totalPages || 1}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="p-2 rounded-lg bg-slate-800 border border-white/10 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-2xl p-6 shadow-2xl relative border border-white/10">
                        <button
                            onClick={() => setShowImportModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <h3 className="text-2xl font-bold text-white mb-6">Import Data Kelulusan</h3>

                        {!importResult ? (
                            <div className="space-y-6">
                                <div className="glass-panel p-4 border border-amber-500/20 bg-amber-500/10">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="text-sm font-bold text-amber-400">Format Excel yang diperlukan:</h4>
                                        <button
                                            onClick={downloadTemplate}
                                            className="px-3 py-1 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-all"
                                        >
                                            Download Template
                                        </button>
                                    </div>
                                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                                        <li>No (opsional)</li>
                                        <li>Nama</li>
                                        <li>Tanggal Lahir</li>
                                        <li><strong>No. Peserta</strong> (wajib — digunakan untuk matching siswa)</li>
                                        <li>Kota</li>
                                        <li>No. Ujian</li>
                                        <li>Agama</li>
                                        <li>Kelas</li>
                                        <li><strong>Status</strong> (wajib — nilai: LULUS atau TIDAK LULUS)</li>
                                    </ul>
                                    <p className="text-xs text-orange-400 mt-3 font-medium">
                                        ⚠ Upload baru akan menghapus semua data kelulusan sebelumnya.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-3">Pilih File Excel (.xlsx)</label>
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="kelulusan-file-input"
                                    />
                                    <label
                                        htmlFor="kelulusan-file-input"
                                        className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
                                    >
                                        <div className="text-center">
                                            <svg className="w-12 h-12 mx-auto mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                            </svg>
                                            <p className="text-sm text-slate-300 font-medium">
                                                {importFile ? importFile.name : 'Klik untuk pilih file atau drag & drop'}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">File .xlsx atau .xls</p>
                                        </div>
                                    </label>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowImportModal(false)}
                                        className="flex-1 py-3 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleImport}
                                        disabled={!importFile || importing}
                                        className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {importing ? 'Mengimport...' : 'Import Data'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="glass-panel p-4 text-center">
                                        <p className="text-sm text-slate-400 mb-1">Total</p>
                                        <p className="text-2xl font-bold text-white">{importResult.total}</p>
                                    </div>
                                    <div className="glass-panel p-4 text-center border border-green-500/20 bg-green-500/10">
                                        <p className="text-sm text-green-400 mb-1">Berhasil</p>
                                        <p className="text-2xl font-bold text-green-400">{importResult.success}</p>
                                    </div>
                                    <div className="glass-panel p-4 text-center border border-red-500/20 bg-red-500/10">
                                        <p className="text-sm text-red-400 mb-1">Gagal</p>
                                        <p className="text-2xl font-bold text-red-400">{importResult.failed}</p>
                                    </div>
                                </div>
                                {importResult.details?.failed?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-bold text-red-400 mb-3">Data yang Gagal:</h4>
                                        <div className="max-h-60 overflow-y-auto space-y-2">
                                            {importResult.details.failed.map((fail: any, idx: number) => (
                                                <div key={idx} className="glass-panel p-3 border border-red-500/20 bg-red-500/5">
                                                    <p className="text-xs text-slate-300">
                                                        <span className="font-semibold">Baris {fail.row}</span>
                                                        {fail.nisn && <span> • NISN: {fail.nisn}</span>}
                                                    </p>
                                                    <p className="text-xs text-red-400 mt-1">{fail.reason}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={() => { setShowImportModal(false); setImportResult(null); setImportFile(null) }}
                                    className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all"
                                >
                                    Tutup
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Notification */}
            {notification.show && (
                <div className="fixed bottom-4 right-4 z-[90]">
                    <div className={`glass-panel px-6 py-4 shadow-2xl border flex items-center gap-3 ${
                        notification.type === 'success'
                            ? 'border-green-500/50 bg-green-500/10'
                            : 'border-red-500/50 bg-red-500/10'
                    }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            notification.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                            {notification.type === 'success'
                                ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            }
                        </div>
                        <span className="text-white font-medium">{notification.message}</span>
                    </div>
                </div>
            )}
        </div>
    )
}
```

- [ ] **Step 2: Verifikasi manual**

Navigate ke `http://localhost:3000/admin/grades/kelulusan`. Verify:
- Panel waktu rilis tampil dengan status "Belum diset"
- Set datetime dan klik Simpan — status berubah
- Tabel kosong dengan pesan yang benar
- Tombol Import membuka modal dengan Download Template

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/grades/kelulusan/page.tsx
git commit -m "feat: add admin kelulusan page"
```

---

### Task 7: Update Admin Grades Menu

**Files:**
- Modify: `src/app/admin/grades/page.tsx`

- [ ] **Step 1: Tambah card kelulusan ke gradeTypes**

Di `src/app/admin/grades/page.tsx`, replace seluruh array `gradeTypes`:

```typescript
const gradeTypes = [
    {
        id: 'tka',
        title: 'Nilai TKA',
        subtitle: 'Tes Kemampuan Akademik',
        description: 'Kelola data nilai TKA siswa',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
        ),
        gradient: 'from-blue-600 to-indigo-600',
        bgGlow: 'bg-blue-500/10',
        hoverGlow: 'group-hover:bg-blue-500/20'
    },
    {
        id: 'pdss',
        title: 'Nilai PDSS',
        subtitle: 'Pangkalan Data Sekolah dan Siswa',
        description: 'Kelola data nilai PDSS untuk menentukan siswa eligibel untuk SNBP Tahun 2026',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
        ),
        gradient: 'from-purple-600 to-pink-600',
        bgGlow: 'bg-purple-500/10',
        hoverGlow: 'group-hover:bg-purple-500/20'
    },
    {
        id: 'kelulusan',
        title: 'Info Kelulusan',
        subtitle: 'Pengumuman Kelulusan Siswa',
        description: 'Upload data kelulusan dan atur waktu pengumuman',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
            </svg>
        ),
        gradient: 'from-amber-500 to-orange-500',
        bgGlow: 'bg-amber-500/10',
        hoverGlow: 'group-hover:bg-amber-500/20'
    }
]
```

- [ ] **Step 2: Update grid menjadi 3 kolom**

Ubah `grid-cols-2` menjadi `grid-cols-3` pada dua div grid di file yang sama:

```tsx
{/* Cards Grid */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
```

```tsx
{/* Stats Overview */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
```

- [ ] **Step 3: Tambah info card kelulusan di Stats Overview**

Tambahkan card ketiga di dalam div Stats Overview (setelah card PDSS):

```tsx
<div className="glass-panel p-6 rounded-xl border border-white/5">
    <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
            </svg>
        </div>
        <div>
            <h4 className="text-white font-semibold mb-1">Info Kelulusan</h4>
            <p className="text-slate-400 text-sm">
                Upload data dan atur waktu pengumuman kelulusan siswa
            </p>
        </div>
    </div>
</div>
```

- [ ] **Step 4: Verifikasi**

Navigate ke `http://localhost:3000/admin/grades`. Verify: card Kelulusan tampil, klik mengarah ke `/admin/grades/kelulusan`.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/grades/page.tsx
git commit -m "feat: add kelulusan card to admin grades menu"
```

---

### Task 8: Student Kelulusan Page

**Files:**
- Create: `src/app/student/grades/kelulusan/page.tsx`

- [ ] **Step 1: Buat file halaman**

```tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'

interface GraduationRecord {
    id: string
    nisn: string
    nama: string | null
    tanggal_lahir: string | null
    no_ujian: string | null
    kota: string | null
    agama: string | null
    kelas: string | null
    status: 'LULUS' | 'TIDAK LULUS'
}

interface CountdownValues {
    days: number
    hours: number
    minutes: number
    seconds: number
}

function calcCountdown(releaseTime: string): CountdownValues {
    const diff = Math.max(0, new Date(releaseTime).getTime() - Date.now())
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
    }
}

export default function StudentKelulusanPage() {
    const [loading, setLoading] = useState(true)
    const [releaseTime, setReleaseTime] = useState<string | null>(null)
    const [isReleased, setIsReleased] = useState(false)
    const [record, setRecord] = useState<GraduationRecord | null>(null)
    const [countdown, setCountdown] = useState<CountdownValues>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/students/grades/kelulusan')
            if (!res.ok) {
                const result = await res.json()
                throw new Error(result.error || 'Gagal memuat data')
            }
            const result = await res.json()
            setReleaseTime(result.releaseTime)
            setIsReleased(result.isReleased)
            setRecord(result.record)
            if (result.releaseTime && !result.isReleased) {
                setCountdown(calcCountdown(result.releaseTime))
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    useEffect(() => {
        if (!releaseTime || isReleased) return
        const interval = setInterval(() => {
            const cd = calcCountdown(releaseTime)
            setCountdown(cd)
            if (cd.days === 0 && cd.hours === 0 && cd.minutes === 0 && cd.seconds === 0) {
                clearInterval(interval)
                fetchData()
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [releaseTime, isReleased, fetchData])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center glass-panel p-8 max-w-md border border-white/10">
                    <p className="text-red-400 font-medium">{error}</p>
                </div>
            </div>
        )
    }

    // Kondisi A: Belum dijadwalkan
    if (!releaseTime) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center glass-panel p-10 max-w-md border border-white/10">
                    <div className="w-16 h-16 rounded-full bg-slate-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Belum Dijadwalkan</h3>
                    <p className="text-slate-400 text-sm">Pengumuman kelulusan belum dijadwalkan oleh admin.</p>
                </div>
            </div>
        )
    }

    // Kondisi B: Countdown
    if (!isReleased) {
        const releaseDate = new Date(releaseTime)
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="text-center max-w-2xl w-full px-4">
                    <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                        <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Pengumuman Kelulusan</h2>
                    <p className="text-slate-400 mb-2">Akan dibuka pada</p>
                    <p className="text-amber-400 font-semibold mb-8 text-lg">
                        {releaseDate.toLocaleDateString('id-ID', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })} · {releaseDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </p>

                    <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
                        {[
                            { value: countdown.days, label: 'Hari' },
                            { value: countdown.hours, label: 'Jam' },
                            { value: countdown.minutes, label: 'Menit' },
                            { value: countdown.seconds, label: 'Detik' },
                        ].map(({ value, label }) => (
                            <div key={label} className="glass-panel p-4 border border-amber-500/20 bg-amber-500/5 rounded-2xl">
                                <div className="text-3xl md:text-4xl font-bold text-amber-400 tabular-nums">
                                    {String(value).padStart(2, '0')}
                                </div>
                                <div className="text-xs text-slate-400 mt-1 font-medium">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Kondisi C: Rilis — data tidak ditemukan
    if (!record) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center glass-panel p-10 max-w-md border border-white/10">
                    <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Data Tidak Ditemukan</h3>
                    <p className="text-slate-400 text-sm">
                        Data kelulusan Anda belum tersedia. Hubungi pihak sekolah untuk informasi lebih lanjut.
                    </p>
                </div>
            </div>
        )
    }

    // Kondisi C: Rilis — tampilkan kartu kelulusan
    const isLulus = record.status === 'LULUS'
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2">
                    Info Kelulusan
                </h2>
                <p className="text-slate-400 text-sm">Hasil pengumuman kelulusan resmi</p>
            </div>

            {/* Status Badge */}
            <div className={`glass-panel p-8 text-center border-2 ${
                isLulus ? 'border-green-500/40 bg-green-500/5' : 'border-red-500/40 bg-red-500/5'
            }`}>
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    isLulus ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                    {isLulus ? (
                        <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    ) : (
                        <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    )}
                </div>
                <div className={`text-4xl font-black mb-2 ${isLulus ? 'text-green-400' : 'text-red-400'}`}>
                    {record.status}
                </div>
                <p className={`text-sm font-medium ${isLulus ? 'text-green-300' : 'text-red-300'}`}>
                    {isLulus ? 'Selamat! Anda dinyatakan lulus.' : 'Anda dinyatakan tidak lulus.'}
                </p>
            </div>

            {/* Student Details */}
            <div className="glass-panel p-6 border border-white/10 space-y-4">
                <h3 className="text-white font-bold text-lg mb-4">Data Siswa</h3>
                {[
                    { label: 'Nama', value: record.nama },
                    { label: 'Kelas', value: record.kelas },
                    { label: 'No. Peserta', value: record.nisn },
                    { label: 'No. Ujian', value: record.no_ujian },
                    { label: 'Tanggal Lahir', value: record.tanggal_lahir },
                    { label: 'Kota', value: record.kota },
                    { label: 'Agama', value: record.agama },
                ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                        <span className="text-slate-400 text-sm">{label}</span>
                        <span className="text-white font-medium text-sm text-right">{value || '-'}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
```

- [ ] **Step 2: Verifikasi manual**

Navigate ke `http://localhost:3000/student/grades/kelulusan` (login sebagai student). Verify:
- Jika waktu belum diset: tampil "Belum Dijadwalkan"
- Jika sebelum waktu rilis: countdown berjalan tiap detik
- Jika setelah waktu rilis + NISN cocok: kartu kelulusan tampil dengan status
- Jika setelah waktu rilis + NISN tidak ada: "Data Tidak Ditemukan"

- [ ] **Step 3: Commit**

```bash
git add src/app/student/grades/kelulusan/page.tsx
git commit -m "feat: add student kelulusan page with countdown"
```

---

### Task 9: Update Student Grades Menu

**Files:**
- Modify: `src/app/student/grades/page.tsx`

- [ ] **Step 1: Tambah card kelulusan ke gradeTypes**

Di `src/app/student/grades/page.tsx`, replace seluruh array `gradeTypes`:

```typescript
const gradeTypes = [
    {
        id: 'tka',
        title: 'Nilai TKA',
        subtitle: 'Tes Kemampuan Akademik',
        description: 'Lihat hasil tes kemampuan akademik kamu',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
        ),
        gradient: 'from-blue-600 to-indigo-600',
        bgGlow: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        hoverGlow: 'group-hover:bg-blue-500/20'
    },
    {
        id: 'pdss',
        title: 'Nilai PDSS',
        subtitle: 'Pangkalan Data Sekolah dan Siswa',
        description: 'Lihat nilai untuk menentukan siswa eligibel untuk SNBP Tahun 2026',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
        ),
        gradient: 'from-purple-600 to-pink-600',
        bgGlow: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        hoverGlow: 'group-hover:bg-purple-500/20'
    },
    {
        id: 'kelulusan',
        title: 'Info Kelulusan',
        subtitle: 'Pengumuman Kelulusan',
        description: 'Lihat status kelulusan kamu',
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
            </svg>
        ),
        gradient: 'from-amber-500 to-orange-500',
        bgGlow: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        hoverGlow: 'group-hover:bg-amber-500/20'
    }
]
```

- [ ] **Step 2: Update grid menjadi 3 kolom**

Ubah div Cards Grid:
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
```

- [ ] **Step 3: Update teks info card di bagian bawah**

```tsx
<p className="text-slate-400 text-sm leading-relaxed">
    Nilai TKA adalah hasil tes kemampuan akademik yang kamu ikuti. Nilai PDSS mencakup rapor siswa untuk SNBP 2026. Info Kelulusan menampilkan status kelulusan resmi kamu.
</p>
```

- [ ] **Step 4: Verifikasi**

Navigate ke `http://localhost:3000/student/grades`. Verify: card Info Kelulusan tampil, klik mengarah ke `/student/grades/kelulusan`.

- [ ] **Step 5: Commit**

```bash
git add src/app/student/grades/page.tsx
git commit -m "feat: add kelulusan card to student grades menu"
```
