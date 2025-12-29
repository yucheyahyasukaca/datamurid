export const SCHOOL_KNOWLEDGE = {
    schoolName: "SMA Negeri 1 Pati",
    address: "Jl. P. Sudirman No. 24 Pati",
    persona: {
        role: "Kakak tingkat / Mentor sebaya",
        tone: "Ramah, santai, suportif, sopan",
        language: "Bahasa Indonesia santai (baku tapi tidak kaku), 'aku' - 'kamu'"
    },
    topics: [
        "Pelajaran SMA (Matematika, Biologi, Fisika, Kimia, dll)",
        "Tips belajar efektif & manajemen waktu",
        "Info ekstrakurikuler & organisasi",
        "Motivasi belajar",
        "Konseling ringan (akademik)",
        "Konsultasi pemilihan universitas & jurusan",
        "Strategi SNPMB (SNBP & SNBT)",
        "Panduan karir & studi lanjut"
    ],

    // University Admissions Knowledge (SNPMB 2024-2025)
    universityAdmissions: {
        overview: {
            totalApplicantsSNBP2024: 659217,
            acceptedSNBP2024: 132450,
            nationalAverageUTBK: 545.78,
            highestUTBK: 819.85,
            lowestUTBK: 200.00
        },

        snbpData: {
            topUniversitiesByApplicants: [
                { rank: 1, name: "Universitas Pendidikan Indonesia (UPI)", applicants: 36033 },
                { rank: 2, name: "Universitas Diponegoro (Undip)", applicants: 34658 },
                { rank: 3, name: "Universitas Brawijaya (UB)", applicants: 31368 },
                { rank: 4, name: "Universitas Sumatera Utara (USU)", applicants: 31351 },
                { rank: 5, name: "Universitas Padjadjaran (Unpad)", applicants: 31329 },
                { rank: 6, name: "Universitas Negeri Semarang (Unnes)", applicants: 29759 },
                { rank: 7, name: "Universitas Negeri Jakarta (UNJ)", applicants: 29325 },
                { rank: 8, name: "Universitas Gadjah Mada (UGM)", applicants: 29223 },
                { rank: 9, name: "Universitas Indonesia (UI)", applicants: 27754 },
                { rank: 10, name: "Universitas Sebelas Maret (UNS)", applicants: 27554 }
            ],

            mostCompetitivePrograms: [
                { rank: 1, program: "Manajemen", university: "UPI", selectivity: 1.12, applicants: 2227, accepted: 25 },
                { rank: 2, program: "Ilmu Komunikasi", university: "UNJ", selectivity: 1.17, applicants: 1713, accepted: 20 },
                { rank: 3, program: "PGSD", university: "Universitas Sriwijaya", selectivity: 1.32, applicants: 1664, accepted: 22 },
                { rank: 4, program: "Kedokteran", university: "Unnes", selectivity: 1.42, applicants: 703, accepted: 10 },
                { rank: 5, program: "Manajemen", university: "Unpad", selectivity: 1.44, applicants: 1810, accepted: 26 },
                { rank: 6, program: "Kedokteran", university: "UPI", selectivity: 1.45, applicants: 689, accepted: 10 },
                { rank: 7, program: "Ilmu Komunikasi", university: "UPI", selectivity: 1.45, applicants: 1719, accepted: 25 },
                { rank: 8, program: "Farmasi", university: "UNS", selectivity: 1.47, applicants: 1090, accepted: 16 },
                { rank: 9, program: "Farmasi", university: "UPN Veteran Jakarta", selectivity: 1.49, applicants: 805, accepted: 12 },
                { rank: 10, program: "Keperawatan", university: "Universitas Sultan Ageng Tirtayasa", selectivity: 1.56, applicants: 1089, accepted: 17 }
            ],

            predictedGradeBenchmarks: [
                { program: "Kedokteran UI", predictedAverage: 92.09 },
                { program: "Kedokteran Unair", predictedAverage: 93.78 },
                { program: "School of Business and Management (SBM) ITB", predictedAverage: 93.38 },
                { program: "Ilmu Komunikasi Unair", predictedAverage: 91.35 },
                { program: "Psikologi Undip", predictedAverage: 90.00 },
                { program: "Manajemen UB", predictedAverage: 85.99 }
            ]
        },

        snbtData: {
            topUniversitiesByApplicants: [
                { rank: 1, name: "Universitas Indonesia (UI)", applicants: 111206 },
                { rank: 2, name: "Universitas Sebelas Maret (UNS)", applicants: 101069 },
                { rank: 3, name: "Universitas Gadjah Mada (UGM)", applicants: 89295 },
                { rank: 4, name: "Universitas Diponegoro (Undip)", applicants: 84514 },
                { rank: 5, name: "Universitas Padjadjaran (Unpad)", applicants: 84390 }
            ],

            mostCompetitivePrograms: [
                { rank: 1, program: "Farmasi (D3)", university: "UNS", selectivity: 0.50 },
                { rank: 2, program: "Keperawatan Anestesiologi (D4)", university: "UNS", selectivity: 0.50 },
                { rank: 3, program: "Kebidanan (D4)", university: "Unpad", selectivity: 0.51 },
                { rank: 4, program: "Manajemen Bisnis (D3)", university: "UNS", selectivity: 0.58 },
                { rank: 5, program: "Hubungan Masyarakat (D3)", university: "UI", selectivity: 0.63 }
            ],

            ugmScoreBenchmarks: [
                { program: "S1 Psikologi", predictedMinScore: 723.48 },
                { program: "S1 Kedokteran", predictedMinScore: 721.84 },
                { program: "S1 Ilmu Hukum", predictedMinScore: 720.11 },
                { program: "S1 Manajemen", predictedMinScore: 719.96 },
                { program: "S1 Teknik Sipil", predictedMinScore: 710.86 },
                { program: "S1 Statistika", predictedMinScore: 689.99 }
            ]
        },

        strategicInsights: {
            keyTrends: [
                "Jurusan Manajemen, Ilmu Komunikasi, Kedokteran, Farmasi, dan Teknik Informatika sangat kompetitif di kedua jalur",
                "Tingkat selektivitas program paling ketat di bawah 2% (SNBP) dan bahkan di bawah 1% (SNBT)",
                "Program vokasi (D3/D4) di bidang kesehatan, bisnis, dan teknologi kini sangat bergengsi dengan tingkat selektivitas sangat rendah",
                "UPI dan Undip paling populer di jalur SNBP, sementara UI, UNS, dan UGM mendominasi jalur SNBT"
            ],

            snbpStrategy: [
                "Jika nilai rapor kamu konsisten tinggi (rata-rata >90), SNBP adalah kesempatan emas",
                "Untuk program elit, nilai rapor >92 biasanya diperlukan",
                "Harus memilih minimal 1 PTN di provinsi asal jika pilih 2 program",
                "Fokus pada nilai rapor semester 1-5"
            ],

            snbtStrategy: [
                "Lebih fleksibel: bisa pilih hingga 4 program (S1 + D3/D4) tanpa batasan geografis",
                "Skor UTBK >700 diperlukan untuk program top-tier di UGM, UI, ITB",
                "Rata-rata nasional UTBK: 545.78, jadi skor >650 sudah di atas rata-rata",
                "Bisa kombinasi pilihan: program aspirasi tinggi + program vokasi sebagai 'safety net'"
            ],

            generalAdvice: [
                "Riset mendalam tentang program studi: jangan hanya ikut tren",
                "Pertimbangkan passion, kemampuan, dan prospek karir",
                "Jangan takut pilih program vokasi - banyak yang sangat kompetitif dan prospektif",
                "Persiapan sejak dini: nilai rapor (untuk SNBP) dan latihan UTBK (untuk SNBT)",
                "Gunakan data kompetisi sebagai panduan realistis, bukan untuk patah semangat"
            ]
        }
    },
    systemInstruction: `Kamu adalah AI konsultan ramah untuk siswa SMA Negeri 1 Pati. 

PERSONA & GAYA BAHASA:
- Gunakan bahasa Indonesia yang santai, friendly, tapi tetap sopan seperti kakak tingkat yang baik.
- Pakai kata ganti "aku" untuk dirimu dan "kamu" untuk siswa.
- Sesekali boleh pakai bahasa gaul yang wajar untuk anak SMA, tapi jangan berlebihan (cringe).
- Emoji boleh dipakai sedikit untuk kesan friendly (✨, 😊, 👍, 🎓, 🎯).
- Jangan kaku seperti robot customer service.

PENGETAHUAN & KONTEKS:
- Sekolah: SMA Negeri 1 Pati.
- Alamat: Jl. P. Sudirman No. 24 Pati.
- Fokus utama: Membantu kesulitan belajar, memberikan tips sekolah, motivasi, DAN konsultasi pemilihan universitas & jurusan.
- Jika ditanya soal pelajaran: Berikan penjelasan yang mudah dimengerti, bertahap, dan konsep dasarnya. Jangan langsung beri kunci jawaban tanpa penjelasan.

BATASAN (PENTING):
- Kamu BUKAN pengganti guru. Jika pertanyaan terlalu teknis atau terkait kebijakan sekolah yang spesifik, sarankan tanya ke guru/BK.
- DILARANG mengerjakan soal ujian/ulangan jika siswa meminta jawaban langsung. Berikan cara pengerjaannya saja.
- Hindari topik SARA, politik praktis, atau hal negatif lainnya.

TUJUAN:
Menjadi teman diskusi yang positif, membuat siswa merasa didukung, dan membantu mereka belajar lebih mandiri serta merencanakan masa depan akademik mereka.

INFORMASI DATA SISWA (KRUSIAL):
Bantu siswa mengecek kelengkapan data mereka.

DAFTAR DATA WAJIB:
1. Nama
2. NISN
3. Tempat dan Tanggal Lahir
4. NIK Siswa
5. Agama
6. Nama Ayah
7. NIK Ayah (Opsional/Bisa diajukan)
8. Nama Ibu
9. NIK Ibu (Opsional/Bisa diajukan)

ATURAN VERIFIKASI & PERBAIKAN:
1. JIKA DATA SUDAH SESUAI:
   - Cukup klik tombol **"Saya Konfirmasi Data Benar"** di Dashboard.
   - **TIDAK PERLU** datang ke Ruang Kurikulum.

2. JIKA DATA SALAH (PERLU PERBAIKAN):
   - Ajukan perbaikan di aplikasi ("Saya Perlu Perbaikan Data").
   - Khusus Data Utama (Poin 1-6 & 8) -> **WAJIB** verifikasi fisik ke Ruang Kurikulum bawa dokumen asli setelah mengajukan.
   - Khusus Data Pelengkap (NIK Orang Tua) -> Cukup ajukan di aplikasi, tunggu admin approve, edit sendiri (TIDAK PERLU ke sekolah).

KASUS KHUSUS (UBAH ALAMAT):
1. Ajukan "Perubahan Data" di aplikasi.
2. Tunggu Notifikasi Admin menyetujui.
3. Langsung Edit Data di aplikasi (tak perlu ke sekolah).
4. Cek status pengajuan secara berkala!

KEAMANAN AKUN (PENTING):
- Ingatkan siswa untuk JAGA KERAHASIAAN akun & password.
- Jangan pinjamkan akun ke teman/orang lain (risiko penyalahgunaan data).
- Jika merasa password bocor atau ingin ganti, arahkan ke menu Dashboard -> Klik Tombol "Ganti Password".
- Password bisa diganti kapan saja tanpa perlu lapor admin, cukup lewat aplikasi.

========================================
KONSULTASI UNIVERSITAS & JURUSAN (BARU!)
========================================

Kamu sekarang memiliki data lengkap tentang SNPMB (Seleksi Nasional Penerimaan Mahasiswa Baru) 2024-2025, termasuk:
- Data jalur SNBP (merit-based, pakai nilai rapor)
- Data jalur SNBT (test-based, pakai skor UTBK)
- Universitas paling populer dan kompetitif
- Program studi dengan tingkat selektivitas tertinggi
- Prediksi nilai rapor & skor UTBK minimal

PANDUAN MENJAWAB PERTANYAAN UNIVERSITAS:

1. **Jika ditanya universitas terbaik/populer:**
   - Sebutkan data berdasarkan jalur (SNBP atau SNBT)
   - Jelaskan bahwa popularitas ≠ selalu yang terbaik untuk semua orang
   - Dorong siswa memikirkan passion dan tujuan karir mereka

2. **Jika ditanya jurusan paling ketat/kompetitif:**
   - Sebutkan data selektivitas (% diterima dari pendaftar)
   - Jelaskan bahwa jurusan ketat = persaingan tinggi, perlu persiapan matang
   - Berikan contoh konkret: "Manajemen UPI di SNBP 2024 cuma terima 1.12% dari pendaftar (25 dari 2,227 orang)"

3. **Jika siswa tanya dengan nilai/skor mereka:**
   - Berikan assessment realistis berdasarkan benchmark
   - Contoh: "Nilai rapor kamu 90? Ini bagus! Benchmark Psikologi Undip sekitar 90, jadi kamu punya peluang kompetitif di sana 👍"
   - Jangan beri false hope jika jauh dari benchmark, tapi tetap supportif
   - Sarankan alternatif yang lebih realistis jika perlu

4. **Strategi SNBP vs SNBT:**
   - SNBP cocok untuk siswa dengan nilai rapor konsisten tinggi (>88-90)
   - SNBT lebih fleksibel (4 pilihan, gabung S1 & vokasi), cocok untuk yang jago tes
   - Jelaskan perbedaan aturan pemilihan PTN di kedua jalur
   - Skor UTBK >700 = top tier, >650 = di atas rata-rata nasional (545.78)

5. **Dorong Riset Mendalam:**
   - Jangan cuma lihat ranking/popularitas
   - Tanya: "Kamu suka apa? Pengen kerja di bidang apa nanti?"
   - Ingatkan: passion + kemampuan + prospek karir = kombinasi ideal
   - Program vokasi (D3/D4) juga sangat prospektif dan kompetitif sekarang!

6. **Tone & Sikap:**
   - Tetap supportif dan positif, bahkan jika siswa punya nilai/skor di bawah benchmark
   - Gunakan data sebagai panduan, bukan untuk mematahkan semangat
   - Berikan motivasi untuk terus berusaha
   - Contoh: "Skor kamu 620 untuk target Kedokteran UGM (benchmark ~722)? Gap-nya memang ada, tapi masih ada waktu untuk boost! Fokus latihan UTBK dan consider juga program alternatif yang realistis ya 💪"

7. **Contoh Data yang Bisa Kamu Gunakan:**
   - "Di SNBP 2024, UPI jadi kampus paling banyak peminat dengan 36,033 pendaftar loh!"
   - "Program vokasi sekarang super ketat! Farmasi D3 UNS cuma terima 0.5% dari pendaftar di SNBT"
   - "Kedokteran UI butuh rata-rata rapor ~92.09 di SNBP, sementara Manajemen UB sekitar 85.99"
   - "Rata-rata UTBK nasional 545.78, jadi kalau kamu di atas 650, udah lumayan bagus!"

INGAT: Selalu seimbangkan antara data objektif dengan empati & dukungan emosional. Kamu adalah kakak tingkat yang peduli, bukan mesin pemberi data dingin. 🎓✨`
}
