'use client';

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Wrench,
  UserCheck,
  Clock,
  CheckCircle2,
  FileCode2,
  FileText,
  Search,
  Copy,
  Check,
  ArrowRight,
  Terminal,
  Bike,
  KeyRound,
  Globe,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import MotorModelManager from '@/components/admin/MotorModelManager';
import ArmadaUnitManager from '@/components/admin/ArmadaUnitManager';
import BookingStateMachineManager from '@/components/admin/BookingStateMachineManager';
import LiveUnitTrackingDashboard from '@/components/admin/LiveUnitTrackingDashboard';
import CustomerBookingPortal from '@/components/public/CustomerBookingPortal';
import ZlceStudioWorkbench from '@/components/zlce/ZlceStudioWorkbench';

type UnitPositionStatus = 'parkir' | 'servis' | 'disewa';
type PoolLocation = 'malang' | 'batu';

interface TrackedUnit {
  id: string;
  kodeUnit: string;
  motorName: string;
  platNomor: string;
  warna: string;
  statusPosisi: UnitPositionStatus;
  poolParkir: PoolLocation;
  namaBengkel: string;
  kontakBengkel: string;
  estimasiSelesaiServis: string;
  noBooking: string;
  namaPenyewa: string;
  tenggatKembali: string;
  updatedAt: string;
  updatedBy: string;
}

interface MotorTariff {
  id: string;
  name: string;
  harga3Jam: number;
  harga6Jam: number;
  harga9Jam: number;
  harga12Jam: number;
  hargaHarian: number;
  dendaHarianPerJam: number;
}

const INITIAL_UNITS: TrackedUnit[] = [
  {
    id: 'u1',
    kodeUnit: 'B122',
    motorName: 'Honda Beat CBS 2022',
    platNomor: 'N 4521 AB',
    warna: 'Hitam',
    statusPosisi: 'parkir',
    poolParkir: 'malang',
    namaBengkel: '',
    kontakBengkel: '',
    estimasiSelesaiServis: '',
    noBooking: '',
    namaPenyewa: '',
    tenggatKembali: '',
    updatedAt: '11 Okt 2026 08:15 WIB',
    updatedBy: 'Operator Rian',
  },
  {
    id: 'u2',
    kodeUnit: 'B222',
    motorName: 'Honda Beat CBS 2022',
    platNomor: 'N 4890 AC',
    warna: 'Merah',
    statusPosisi: 'disewa',
    poolParkir: 'malang',
    namaBengkel: '',
    kontakBengkel: '',
    estimasiSelesaiServis: '',
    noBooking: 'RYK-20261011-004',
    namaPenyewa: 'Dian Pratama',
    tenggatKembali: '11 Okt 2026 15:00 WIB',
    updatedAt: '11 Okt 2026 09:00 WIB',
    updatedBy: 'Operator Rian',
  },
  {
    id: 'u3',
    kodeUnit: 'V123',
    motorName: 'Honda Vario 125 CBS-ISS',
    platNomor: 'N 3112 KL',
    warna: 'Putih Matte',
    statusPosisi: 'parkir',
    poolParkir: 'batu',
    namaBengkel: '',
    kontakBengkel: '',
    estimasiSelesaiServis: '',
    noBooking: '',
    namaPenyewa: '',
    tenggatKembali: '',
    updatedAt: '11 Okt 2026 07:45 WIB',
    updatedBy: 'Operator Dani',
  },
  {
    id: 'u4',
    kodeUnit: 'V223',
    motorName: 'Honda Vario 125 CBS-ISS',
    platNomor: 'N 3199 KM',
    warna: 'Hitam Matte',
    statusPosisi: 'servis',
    poolParkir: 'malang',
    namaBengkel: 'AHASS Soekarno Hatta Malang',
    kontakBengkel: '0812-3344-5566 (Pak Hendra)',
    estimasiSelesaiServis: '11 Okt 2026 16:30 WIB',
    noBooking: '',
    namaPenyewa: '',
    tenggatKembali: '',
    updatedAt: '11 Okt 2026 10:10 WIB',
    updatedBy: 'Operator Rian',
  },
  {
    id: 'u5',
    kodeUnit: 'N124',
    motorName: 'Yamaha All New NMAX 155',
    platNomor: 'N 6012 EE',
    warna: 'Hijau Matte',
    statusPosisi: 'disewa',
    poolParkir: 'batu',
    namaBengkel: '',
    kontakBengkel: '',
    estimasiSelesaiServis: '',
    noBooking: 'RYK-20261011-007',
    namaPenyewa: 'Bagus Setiawan',
    tenggatKembali: '12 Okt 2026 10:00 WIB',
    updatedAt: '11 Okt 2026 10:00 WIB',
    updatedBy: 'Operator Dani',
  },
  {
    id: 'u6',
    kodeUnit: 'S123',
    motorName: 'Honda Scoopy Prestige',
    platNomor: 'N 2781 AA',
    warna: 'Cream Putih',
    statusPosisi: 'parkir',
    poolParkir: 'malang',
    namaBengkel: '',
    kontakBengkel: '',
    estimasiSelesaiServis: '',
    noBooking: '',
    namaPenyewa: '',
    tenggatKembali: '',
    updatedAt: '11 Okt 2026 08:30 WIB',
    updatedBy: 'Operator Rian',
  },
];

const MOTOR_TARIFFS: MotorTariff[] = [
  {
    id: 'beat',
    name: 'Honda Beat CBS 2022',
    harga3Jam: 35000,
    harga6Jam: 50000,
    harga9Jam: 65000,
    harga12Jam: 70000,
    hargaHarian: 80000,
    dendaHarianPerJam: 20000,
  },
  {
    id: 'vario125',
    name: 'Honda Vario 125 CBS-ISS',
    harga3Jam: 45000,
    harga6Jam: 65000,
    harga9Jam: 80000,
    harga12Jam: 90000,
    hargaHarian: 100000,
    dendaHarianPerJam: 20000,
  },
  {
    id: 'nmax155',
    name: 'Yamaha All New NMAX 155',
    harga3Jam: 65000,
    harga6Jam: 95000,
    harga9Jam: 115000,
    harga12Jam: 125000,
    hargaHarian: 140000,
    dendaHarianPerJam: 25000,
  },
];

const STATIC_HANDOVER_PROMPT = `Anda bertindak sebagai Lead WordPress Engineer untuk proyek "Ryokourent" (Rental Motor Malang & Batu, plugin \`ryokourent-core\` + child theme \`generatepress-child\`). Proyek ini menggunakan Sistem 1 Folder Kerja (\`FOLDER_KERJA/\`) agar kerja cepat, hemat token, dan tahan terputus.

## 1. TARGET & PERMINTAAN USER
- Status Sesi Sebelumnya: Lihat bagian "Checkpoint Pekerjaan Aktif" di \`FOLDER_KERJA/SESSION_STATE.md\` (jika ada item \`[ ]\` yang belum dicentang berarti sesi sebelumnya terputus dan WAJIB diselesaikan lebih dulu).
- Permintaan User: Baca berkas \`FOLDER_KERJA/NEW_TASK.md\` (pada bagian \`ISI PERMINTAAN USER\`). Jika tertulis \`Tidak ada\`, langsung lanjutkan pekerjaan yang belum selesai di \`SESSION_STATE.md\`. Jika berisi task baru / temuan uji manual / perubahan aturan, jadikan isi \`NEW_TASK.md\` tersebut sebagai target utama.

## 2. URUTAN BACA UTAMA (\`FOLDER_KERJA/\`)
1. \`FOLDER_KERJA/NEW_TASK.md\` — Periksa apakah ada instruksi task baru atau tertulis \`Tidak ada\`.
2. \`FOLDER_KERJA/SESSION_STATE.md\` — Cek apakah ada checklist \`[ ]\` yang belum selesai dari sesi sebelumnya.
3. \`FOLDER_KERJA/SPEC_AND_DECISIONS.md\` — Acuan tunggal aturan bisnis (\`D-01..D-31\`), skema 5 CPT (\`motor\`, \`ryokou_unit\`, \`ryokou_lacak\`, \`penyewaan\`, \`ryokou_paket\`), serta peta file kode.

## 3. ATURAN EMAS PROTEKSI KODE EKSISTING (WAJIB DIPATUHI — DILARANG MERUSAK KODE LAMA!)
1. **DILARANG KERAS MERUBAH ATAU MENGHAPUS KODE SEBELUMNYA TANPA KONFIRMASI (\`D-31\`):**
   - **JANGAN PERNAH** menimpa ulang seluruh isi file (\`full file overwrite\`) yang menyebabkan fungsi, tampilan, variabel, atau alur yang sudah berjalan baik sebelumnya menjadi hilang atau rusak!
   - Gunakan prinsip **Surgical Edit (Edit Terfokus / Tambah Saja)**: hanya sentuh baris atau blok spesifik yang diminta user. Biarkan seluruh kode, fungsi, dan struktur lainnya tetap utuh 100% seperti semula.
   - Jika suatu penambahan fitur baru terpaksa harus mengubah atau menghapus logika/fungsi kode yang sudah ada sebelumnya, **BERHENTI DULU, JANGAN UBAH KODE**, jelaskan bagian mana yang akan terdampak, dan **minta konfirmasi/persetujuan user terlebih dahulu**.

## 4. CARA KERJA SINGKAT & ANTI-TERPUTUS (WAJIB DIIKUTI)
1. **Cek Sambung Kerja / Permintaan Baru (\`NEW_TASK.md\`):**
   - Jika \`NEW_TASK.md\` berisi \`Tidak ada\`: langsung kerjakan item yang masih bertanda \`[ ]\` di \`SESSION_STATE.md\`.
   - Jika \`NEW_TASK.md\` berisi instruksi baru: tulis daftar file target dengan tanda \`[ ]\` di \`SESSION_STATE.md\` terlebih dahulu (pastikan tidak melanggar Aturan Emas Proteksi Kode Eksisting di atas).
2. **Kerjakan Kode Dulu Secara Terfokus, Dokumen Terakhir (Agar Tidak Terputus):**
   - Lakukan penambahan/perubahan kode secara terfokus (surgical edit) tanpa menghapus kode sebelumnya yang sudah sesuai.
   - Patuhi aturan inti: Pool hanya tempat parkir (\`D-26\`), lacak posisi di CPT \`ryokou_lacak\` (\`D-26\`), denda ShortRent telat 60m naik kategori jam di atasnya & 12 jam = denda harian (\`D-27\`), serta larangan simpan NIK 16 digit/foto KTP/IP di DB (\`D-21\`).
3. **Update Hanya File di \`FOLDER_KERJA/\` Saat Selesai:**
   - Jika ada perubahan aturan bisnis/skema CPT: perbarui \`FOLDER_KERJA/SPEC_AND_DECISIONS.md\` (ubah langsung pasal \`D-lama\` yang terdampak dan/atau tambah \`D-baru\`).
   - Tandai \`[x]\` pada file yang sudah selesai di \`FOLDER_KERJA/SESSION_STATE.md\` dan catat baris task baru di tabel riwayatnya.
   - Di \`FOLDER_KERJA/NEW_TASK.md\`, kembalikan isi di bawah \`ISI PERMINTAAN USER\` menjadi \`Tidak ada\`. (\`HANDOVER.md\` tidak perlu diubah).

## 5. FORMAT LAPORAN RINGKAS (5 POIN)
1. **Pekerjaan / Task:** Apa yang dikerjakan (sambung kerja atau isi dari \`NEW_TASK.md\`).
2. **File Kode Diubah/Dibuat:** Daftar file \`.php\`/\`.js\`/\`.css\` yang disentuh (beserta jaminan tidak ada kode lama yang dihapus tanpa izin).
3. **File \`FOLDER_KERJA/\` Diperbarui:** (\`SPEC_AND_DECISIONS.md\`, \`SESSION_STATE.md\`, dan reset \`NEW_TASK.md\` ke \`Tidak ada\`).
4. **Ringkasan Implementasi & Verifikasi:** Penjelasan singkat logika yang diterapkan dan hasil cek sintaks/build.
5. **Status Checkpoint:** \`COMPLETED (Semua [x])\` atau daftar \`[ ]\` jika masih ada tahap lanjutan.`;

function buildNewTaskFile(permintaanUser: string) {
  const cleanRequest = permintaanUser.trim() ? permintaanUser.trim() : 'Tidak ada';
  return `# NEW_TASK.md — INPUT TUGAS BARU / TEMUAN UJI MANUAL / PERUBAHAN ATURAN

> **Cara Pakai untuk User:**
> - Jika Anda ingin memberi **task baru, temuan uji manual, atau perubahan aturan bisnis**, tuliskan instruksi Anda di bawah bagian **ISI PERMINTAAN USER DI BAWAH INI** (menggantikan tulisan \`Tidak ada\`).
> - Jika Anda **hanya ingin menyambung pekerjaan yang terputus** di AI sebelumnya (tanpa task tambahan), biarkan tertulis \`Tidak ada\`.
> - **Kewajiban AI:** Setelah seluruh pekerjaan pada \`NEW_TASK.md\` selesai dikerjakan dan ditandai \`[x]\` di \`SESSION_STATE.md\`, AI **wajib mengembalikan** isi bagian di bawah ini menjadi \`Tidak ada\`.

---

## ISI PERMINTAAN USER DI BAWAH INI:
${cleanRequest}`;
}

const MD_FILES_CONTENT: Record<string, { title: string; path: string; summary: string; content: string }> = {
  handover: {
    title: '1. FOLDER_KERJA/HANDOVER.md (Prompt Jembatan Permanen)',
    path: 'FOLDER_KERJA/HANDOVER.md',
    summary: 'Wajib di-upload (1 Folder). Berisi Prompt Siap Salin statis yang otomatis mengarahkan AI membaca NEW_TASK.md.',
    content: STATIC_HANDOVER_PROMPT,
  },
  new_task: {
    title: '2. FOLDER_KERJA/NEW_TASK.md (Input Permintaan User)',
    path: 'FOLDER_KERJA/NEW_TASK.md',
    summary: 'Wajib di-upload (1 Folder). Tempat Anda menulis task baru / perubahan aturan; default berisi "Tidak ada".',
    content: buildNewTaskFile('Tidak ada'),
  },
  session_state: {
    title: '3. FOLDER_KERJA/SESSION_STATE.md (Status & Checkpoint [x]/[ ])',
    path: 'FOLDER_KERJA/SESSION_STATE.md',
    summary: 'Wajib di-upload (1 Folder). Mencatat posisi terakhir & checklist file [x]/[ ] agar jika terputus bisa langsung disambung.',
    content: `# SESSION_STATE.md — STATUS TERKINI & CHECKPOINT SAMBUNG KERJA

## 1. Status Sesi Saat Ini
- Terakhir Diperbarui: 11 Oktober 2026
- Fase Aktif: FASE 6 — Uji Manual (UAT), Update Penyesuaian Operasional, & Permintaan Baru (D-28 & D-29)
- Status NEW_TASK.md Saat Ini: Tidak ada (Siap diisi kapan saja jika ada task/perubahan baru)
- Status Pekerjaan Terakhir: 100% SELESAI (IDLE / Semua item [x])

## 2. Checkpoint Pekerjaan Aktif (Untuk Sambung Kerja Lintas-AI)
- [x] FOLDER_KERJA/NEW_TASK.md — File khusus input permintaan user (default: Tidak ada)
- [x] FOLDER_KERJA/HANDOVER.md — Prompt Jembatan Antar-AI permanen yang mengarahkan ke NEW_TASK.md
- [x] FOLDER_KERJA/SESSION_STATE.md & FOLDER_KERJA/SPEC_AND_DECISIONS.md — Dipindahkan ke FOLDER_KERJA/ (1 folder wajib upload)
- [x] docs/ — Berisi khusus file tutorial & panduan (PANDUAN_XAMPP_WIN11_SIMULASI.md, OPERATOR_MANUAL.md, ADMIN_GUIDE.md, DEPLOYMENT_GUIDE.md)
- [x] ARSIP/ — Mengumpulkan seluruh 15 file MD tata kelola lama di satu folder arsip
- [x] wp-content/plugins/ryokourent-core/ — Seluruh kode plugin CPT Lacak Unit (D-26) & Denda ShortRent (D-27) selesai 100%`,
  },
  spec_decisions: {
    title: '4. FOLDER_KERJA/SPEC_AND_DECISIONS.md (D-01..D-29 & Skema 5 CPT)',
    path: 'FOLDER_KERJA/SPEC_AND_DECISIONS.md',
    summary: 'Wajib di-upload (1 Folder). Gabungan tunggal DECISIONS + DATA_MODEL + ARCHITECTURE (termasuk D-26 Lacak Unit & D-27 ShortRent).',
    content: `# SPEC_AND_DECISIONS.md — ATURAN BISNIS (D-01..D-29) & SKEMA DATA RYOKOURENT

| Kode | Keputusan Inti (Kondisi Terupdate) | Dampak Teknis & Operasional |
| :--- | :--- | :--- |
| D-01..D-04 | WP Native (ryokourent-core + generatepress-child); State Machine 4 Status (Booking -> Approve Booking -> Disewa -> Selesai). | Stok baru terkunci saat Approve Booking dengan MySQL GET_LOCK. |
| D-05 | Indikator Stok Biner Tegas: Publik hanya melihat "Tersedia" (Hijau) atau "Habis" (Merah). | Tombol pesan WA tetap aktif saat Habis untuk konfirmasi admin. |
| D-18 | 2 Kategori Tarif: Harian (1 Hari [Utama], 1 Minggu, 2 Minggu) & Jam/ShortRent (12, 9, 6, 3 Jam) + Paket Promo. | Cascading dropdown otomatis mengisi form booking & pesan WA. |
| D-21 | Kepatuhan UU PDP: DILARANG simpan NIK 16 digit, foto KTP, alamat KTP, kontak darurat, medsos, atau IP di DB. | Hanya simpan no_booking, nama, tanda_pelanggan, jenis_id_pendukung, lokasi, jadwal, & unit. |
| D-26 | Pool Hanya Tempat Parkir (tanpa bagi kuota Malang vs Batu) + CPT Lacak Unit (ryokou_lacak). | Melacak posisi real-time: Parkir di Pool mana, Servis di Bengkel mana, atau Posisi Sewa disewa siapa. |
| D-27 | Denda ShortRent: Terlambat >= 60 menit masuk kategori jam di atasnya (3j->6j->9j->12j); untuk 12 Jam denda = Denda Harian (_ryokou_denda_harian). | Dihitung otomatis di includes/booking.php, tampil di kolom admin, form publik, & WA. |
| D-28 | Tata Kelola Mode Ringkas & Pengecualian Panduan: Urutan kerja wajib Checkpoint-First & Kode-Dulu. | File tutorial/panduan di docs/ tidak dibaca rutin dan hanya diubah jika diminta di NEW_TASK.md. |
| D-29 | Organisasi 3 Folder MD (FOLDER_KERJA/, docs/, ARSIP/) & Pemisahan Input Tugas ke NEW_TASK.md. | HANDOVER.md bersifat statis; user cukup meng-upload 1 folder (FOLDER_KERJA/) di setiap sesi. |`,
  },
  panduan_recovery: {
    title: '5. docs/PANDUAN_WIZARD_RECOVERY_ZLCE.md (Tutorial Pemulihan Sesi)',
    path: 'docs/PANDUAN_WIZARD_RECOVERY_ZLCE.md',
    summary: 'Tutorial 4 langkah pemakaian Wizard Recovery untuk sesi AI terputus di HP/Android & desktop.',
    content: `# PANDUAN PENGGUNAAN FITUR WIZARD RECOVERY ZLCE v3.2.2
## Ryokourent Rental Motor Management System

### CARA AKSES CEPAT DARI BROWSER ANDROID:
1. Tekan tombol hijau "⚡ Wizard Recovery" di pojok kanan atas console atau tab pertama "Wizard Recovery ZLCE".
2. Langkah 1 (Opsi): Pilih skenario "Sesi AI Terputus Tiba-tiba", centang Git Diff (--diff) dan Simpan Arsip.
3. Langkah 2 (Eksekusi): Tekan "⚡ Eksekusi & Buat Snapshot Sekarang".
4. Langkah 3 (Diagnostik): Sistem otomatis mencocokkan status dengan WAL dan mendeteksi Kasus A/B/C/D.
5. Langkah 4 (Handover): Tekan tombol hijau "📋 Salin Bundel Handover All-in-One".
6. Buka tab chat AI baru di Android -> Tempel (Paste) & Kirim! AI baru langsung melanjutkan tanpa mengulang dari awal.

### 4 KASUS RECOVERY PROTOKOL ZLCE:
- KASUS A (Working tree bersih): Ulangi dari field "Langkah Berikutnya" pada WAL.
- KASUS B (Diff uncommitted cocok dengan WAL): Pertahankan diff, verifikasi AC, commit wip().
- KASUS C (Commit baru ada di Git log): Sinkronkan SESSION_STATE.md dengan commit Git.
- KASUS D (Perubahan di luar WAL): Tahan perubahan, ubah status ke BLOCKED, minta konfirmasi user.

Lokasi arsip file fisik: docs/archive/snapshot-[timestamp].txt`,
  },
  docs_dan_arsip: {
    title: 'Folder docs/ (Tutorial/Panduan) & ARSIP/ (MD Lama)',
    path: 'docs/ & ARSIP/',
    summary: 'Tidak perlu di-upload / dibaca rutin. docs/ berisi tutorial XAMPP, Recovery, & Operator; ARSIP/ berisi 15 file MD lama.',
    content: `# PETA FOLDER docs/ (TUTORIAL & PANDUAN) DAN ARSIP/ (MD LAMA)

1. FOLDER docs/ — KHUSUS TUTORIAL & PANDUAN (Hanya Diubah Jika Diminta di NEW_TASK.md):
   - docs/PANDUAN_WIZARD_RECOVERY_ZLCE.md
   - docs/PANDUAN_IMPORT_DATA_MOTOR_DARI_REACT.md
   - docs/PANDUAN_XAMPP_WIN11_SIMULASI.md
   - docs/OPERATOR_MANUAL.md
   - docs/ADMIN_GUIDE.md
   - docs/DEPLOYMENT_GUIDE.md

2. FOLDER ARSIP/ — KUMPULAN SEMUA 15 FILE MD LAMA (Diarsipkan Permanen):
   - ARSIP/AI_RULES.md
   - ARSIP/AI_WORKFLOW.md
   - ARSIP/ARCHITECTURE.md
   - ARSIP/BLUEPRINT.md
   - ARSIP/CHANGELOG.md
   - ARSIP/CODING_STANDARDS.md
   - ARSIP/DATA_MODEL.md
   - ARSIP/DECISIONS.md
   - ARSIP/GIT_WORKFLOW.md
   - ARSIP/OPEN_QUESTIONS.md
   - ARSIP/PRE_PRODUCTION_CHECKLIST.md
   - ARSIP/PRODUCTION_CHECKLIST.md
   - ARSIP/PROJECT_OVERVIEW.md
   - ARSIP/TASKS.md
   - ARSIP/TESTING.md`,
  },
};

const CODE_SNIPPETS: Record<string, { title: string; path: string; summary: string; code: string }> = {
  lacak_cpt: {
    title: 'CPT Lacak Unit (ryokou_lacak)',
    path: 'wp-content/plugins/ryokourent-core/includes/post-types.php',
    summary: 'Pendaftaran CPT ryokou_lacak untuk memantau posisi unit: Parkir di Pool mana, Servis di Bengkel mana, atau Disewa oleh siapa.',
    code: `// 3. CPT Lacak Unit (\`ryokou_lacak\`) — BARU SESUAI D-26
register_post_type(
	'ryokou_lacak',
	array(
		'labels'       => array(
			'name'          => __( 'Lacak Unit', 'ryokourent' ),
			'singular_name' => __( 'Lacak Unit', 'ryokourent' ),
			'menu_name'     => __( 'Lacak Unit (Posisi)', 'ryokourent' ),
			'add_new_item'  => __( 'Catat / Perbarui Posisi Unit', 'ryokourent' ),
			'edit_item'     => __( 'Perbarui Posisi Unit', 'ryokourent' ),
		),
		'public'        => false,
		'show_ui'       => true,
		'show_in_menu'  => true,
		'menu_icon'     => 'dashicons-location-alt',
		'menu_position' => 26,
		'supports'      => array( 'title' ),
		'show_in_rest'  => false,
	)
);`,
  },
  global_availability: {
    title: 'Stok Armada Global Tanpa Partisi Pool (D-26)',
    path: 'wp-content/plugins/ryokourent-core/includes/availability.php',
    summary: 'Pool hanya berfungsi sebagai tempat parkir fisik. Ketersediaan dihitung dari total armada global per tipe motor.',
    code: `// Ambil semua unit fisik aktif untuk tipe motor ini (TIDAK difilter per pool — sesuai D-26)
$all_units = get_posts(
	array(
		'post_type'      => 'ryokou_unit',
		'post_status'    => 'publish',
		'posts_per_page' => -1,
		'meta_query'     => array(
			'relation' => 'AND',
			array(
				'key'   => '_ryokou_parent_motor_id',
				'value' => $motor_id,
				'type'  => 'NUMERIC',
			),
			array(
				'key'     => '_ryokou_status_servis',
				'value'   => 'servis',
				'compare' => '!=',
			),
		),
	)
);`,
  },
  shortrent_penalty: {
    title: 'Kalkulator Denda ShortRent Step-Up 60 Menit & 12 Jam = Harian (D-27)',
    path: 'wp-content/plugins/ryokourent-core/includes/booking.php',
    summary: 'Keterlambatan >= 60 menit otomatis masuk ke kategori jam di atasnya (3j -> 6j -> 9j -> 12j), dan 12 jam dikenakan denda harian.',
    code: `// A. Jika paket awal adalah 12 Jam: Denda sama dengan denda harian (D-27)
if ( '12_jam' === $current_key ) {
	if ( $late_minutes >= 60 ) {
		$late_hours    = (int) ceil( $late_minutes / 60 );
		$denda_nominal = $late_hours * $tariffs['denda_harian'];
	}
}

// B. Jika paket awal 3 Jam, 6 Jam, atau 9 Jam:
// Keterlambatan >= 60 menit otomatis masuk ke kategori jam di atasnya (Contoh: 3 Jam -> 6 Jam)
if ( $late_minutes >= 60 ) {
	$upgraded_key   = $base_info['next']; // 3_jam -> 6_jam, 6_jam -> 9_jam, 9_jam -> 12_jam
	$upgraded_price = $tier_order[ $upgraded_key ]['price'];
	$denda_selisih  = max( 0, $upgraded_price - $base_price );
}`,
  },
};

function formatRp(val: number) {
  return 'Rp ' + val.toLocaleString('id-ID');
}

export default function RyokourentAuditDashboard() {
  const [activeTab, setActiveTab] = useState<'recovery_wizard' | 'workflow' | 'portal_publik' | 'model_katalog' | 'armada_fisik' | 'transaksi_state' | 'lacak' | 'denda' | 'kode'>('recovery_wizard');

  // State untuk CPT Lacak Unit (`ryokou_lacak`)
  const [units, setUnits] = useState<TrackedUnit[]>(INITIAL_UNITS);
  const [filterPosition, setFilterPosition] = useState<'semua' | 'parkir_malang' | 'parkir_batu' | 'servis' | 'disewa'>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    statusPosisi: UnitPositionStatus;
    poolParkir: PoolLocation;
    namaBengkel: string;
    kontakBengkel: string;
    estimasiSelesaiServis: string;
    noBooking: string;
    namaPenyewa: string;
    tenggatKembali: string;
  }>({
    statusPosisi: 'parkir',
    poolParkir: 'malang',
    namaBengkel: '',
    kontakBengkel: '',
    estimasiSelesaiServis: '',
    noBooking: '',
    namaPenyewa: '',
    tenggatKembali: '',
  });

  // State untuk Kalkulator Denda ShortRent (D-27)
  const [selectedMotorId, setSelectedMotorId] = useState<string>('beat');
  const [selectedTier, setSelectedTier] = useState<'3_jam' | '6_jam' | '9_jam' | '12_jam' | 'harian'>('3_jam');
  const [lateMinutes, setLateMinutes] = useState<number>(60);

  // State untuk MD & Code Viewer
  const [selectedMdKey, setSelectedMdKey] = useState<string>('handover');
  const [permintaanUser, setPermintaanUser] = useState<string>('Tidak ada');
  const [selectedSnippet, setSelectedSnippet] = useState<string>('lacak_cpt');
  const [copied, setCopied] = useState(false);

  const activeNewTaskFile = useMemo(() => buildNewTaskFile(permintaanUser), [permintaanUser]);

  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      if (filterPosition === 'parkir_malang' && !(u.statusPosisi === 'parkir' && u.poolParkir === 'malang')) return false;
      if (filterPosition === 'parkir_batu' && !(u.statusPosisi === 'parkir' && u.poolParkir === 'batu')) return false;
      if (filterPosition === 'servis' && u.statusPosisi !== 'servis') return false;
      if (filterPosition === 'disewa' && u.statusPosisi !== 'disewa') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          u.kodeUnit.toLowerCase().includes(q) ||
          u.motorName.toLowerCase().includes(q) ||
          u.platNomor.toLowerCase().includes(q) ||
          u.namaBengkel.toLowerCase().includes(q) ||
          u.namaPenyewa.toLowerCase().includes(q) ||
          u.noBooking.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [units, filterPosition, searchQuery]);

  const penaltySimulation = useMemo(() => {
    const motor = MOTOR_TARIFFS.find((m) => m.id === selectedMotorId) || MOTOR_TARIFFS[0];

    const tierMap = {
      '3_jam': { label: 'ShortRent 3 Jam', hours: 3, price: motor.harga3Jam, nextKey: '6_jam' as const },
      '6_jam': { label: 'ShortRent 6 Jam', hours: 6, price: motor.harga6Jam, nextKey: '9_jam' as const },
      '9_jam': { label: 'ShortRent 9 Jam', hours: 9, price: motor.harga9Jam, nextKey: '12_jam' as const },
      '12_jam': { label: 'ShortRent 12 Jam', hours: 12, price: motor.harga12Jam, nextKey: 'harian' as const },
      harian: { label: 'Sewa Harian (24 Jam)', hours: 24, price: motor.hargaHarian, nextKey: 'harian' as const },
    };

    const base = tierMap[selectedTier];

    if (lateMinutes <= 0) {
      return {
        motor,
        kategoriAwal: base.label,
        hargaAwal: base.price,
        kategoriBaru: base.label,
        dendaNominal: 0,
        totalBayar: base.price,
        ruleApplied: 'Tepat Waktu (Tidak ada keterlambatan)',
        explanation: 'Unit dikembalikan tepat sesuai jadwal sewa.',
      };
    }

    if (selectedTier === 'harian') {
      if (lateMinutes <= 90) {
        return {
          motor,
          kategoriAwal: base.label,
          hargaAwal: base.price,
          kategoriBaru: 'Sewa Harian (Dalam Toleransi <= 90 Menit)',
          dendaNominal: 0,
          totalBayar: base.price,
          ruleApplied: 'Toleransi Harian 90 Menit (D-16)',
          explanation: `Terlambat ${lateMinutes} menit masih dalam batas toleransi 90 menit kategori Harian.`,
        };
      }
      const lateHours = Math.ceil(lateMinutes / 60);
      const denda = lateHours * motor.dendaHarianPerJam;
      return {
        motor,
        kategoriAwal: base.label,
        hargaAwal: base.price,
        kategoriBaru: `Harian + Denda ${lateHours} Jam`,
        dendaNominal: denda,
        totalBayar: base.price + denda,
        ruleApplied: 'Denda Harian per Jam (D-16)',
        explanation: `Terlambat ${lateMinutes} menit (${lateHours} jam) x Denda Harian ${formatRp(motor.dendaHarianPerJam)}/jam.`,
      };
    }

    if (selectedTier === '12_jam') {
      if (lateMinutes < 60) {
        return {
          motor,
          kategoriAwal: base.label,
          hargaAwal: base.price,
          kategoriBaru: 'ShortRent 12 Jam (< 60 Menit)',
          dendaNominal: 0,
          totalBayar: base.price,
          ruleApplied: 'ShortRent 12 Jam — Belum Mencapai 60 Menit (D-27)',
          explanation: `Terlambat ${lateMinutes} menit (< 60 menit). Saat mencapai 60 menit berlaku Denda Harian (${formatRp(motor.dendaHarianPerJam)}/jam).`,
        };
      }
      const lateHours = Math.ceil(lateMinutes / 60);
      const denda = lateHours * motor.dendaHarianPerJam;
      return {
        motor,
        kategoriAwal: base.label,
        hargaAwal: base.price,
        kategoriBaru: `ShortRent 12 Jam + Denda Harian (${lateHours} Jam)`,
        dendaNominal: denda,
        totalBayar: base.price + denda,
        ruleApplied: 'D-27: Denda di 12 Jam Sama Dengan Denda Harian',
        explanation: `Sesuai D-27, keterlambatan pada paket 12 Jam dikenakan tarif Denda Harian: ${lateHours} jam x ${formatRp(motor.dendaHarianPerJam)} = ${formatRp(denda)}.`,
      };
    }

    if (lateMinutes < 60) {
      const nextTierLabel = tierMap[base.nextKey].label;
      return {
        motor,
        kategoriAwal: base.label,
        hargaAwal: base.price,
        kategoriBaru: `${base.label} (< 60 Menit)`,
        dendaNominal: 0,
        totalBayar: base.price,
        ruleApplied: 'Belum Mencapai Ambang 60 Menit (D-27)',
        explanation: `Terlambat ${lateMinutes} menit (< 60 menit). Jika mencapai 60 menit otomatis masuk ke kategori ${nextTierLabel}.`,
      };
    }

    const totalUsedHours = base.hours + lateMinutes / 60;
    let upgradedKey: '6_jam' | '9_jam' | '12_jam' = '6_jam';

    if (selectedTier === '3_jam') {
      if (totalUsedHours >= 10) upgradedKey = '12_jam';
      else if (totalUsedHours >= 7) upgradedKey = '9_jam';
      else upgradedKey = '6_jam';
    } else if (selectedTier === '6_jam') {
      if (totalUsedHours >= 10) upgradedKey = '12_jam';
      else upgradedKey = '9_jam';
    } else {
      upgradedKey = '12_jam';
    }

    const upgradedTier = tierMap[upgradedKey];
    const selisihTarif = Math.max(0, upgradedTier.price - base.price);
    let tambahanDiAtas12Jam = 0;

    if (upgradedKey === '12_jam' && totalUsedHours >= 13) {
      const extraHoursOver12 = Math.ceil(totalUsedHours - 12);
      tambahanDiAtas12Jam = extraHoursOver12 * motor.dendaHarianPerJam;
    }

    const totalDenda = selisihTarif + tambahanDiAtas12Jam;

    return {
      motor,
      kategoriAwal: base.label,
      hargaAwal: base.price,
      kategoriBaru: upgradedTier.label + (tambahanDiAtas12Jam > 0 ? ' + Denda Harian >12 Jam' : ''),
      dendaNominal: totalDenda,
      totalBayar: base.price + totalDenda,
      ruleApplied: 'D-27: Keterlambatan 60 Menit Masuk Kategori Jam Atasnya',
      explanation: `Sewa awal ${base.label} (${formatRp(base.price)}) terlambat ${lateMinutes} menit (total pakai ${totalUsedHours.toFixed(1)} jam) -> otomatis masuk kategori ${upgradedTier.label} (${formatRp(upgradedTier.price)}). Selisih tarif: ${formatRp(selisihTarif)}${tambahanDiAtas12Jam > 0 ? ` + Denda Harian di atas 12 jam: ${formatRp(tambahanDiAtas12Jam)}` : ''}.`,
    };
  }, [selectedMotorId, selectedTier, lateMinutes]);

  const startEditUnit = (unit: TrackedUnit) => {
    setEditingUnitId(unit.id);
    setEditForm({
      statusPosisi: unit.statusPosisi,
      poolParkir: unit.poolParkir,
      namaBengkel: unit.namaBengkel || 'AHASS Soekarno Hatta Malang',
      kontakBengkel: unit.kontakBengkel || '0812-3344-5566',
      estimasiSelesaiServis: unit.estimasiSelesaiServis || '12 Okt 2026 16:00 WIB',
      noBooking: unit.noBooking || 'RYK-20261011-009',
      namaPenyewa: unit.namaPenyewa || 'Pelanggan Baru',
      tenggatKembali: unit.tenggatKembali || '12 Okt 2026 12:00 WIB',
    });
  };

  const saveUnitPosition = (unitId: string) => {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id !== unitId) return u;
        return {
          ...u,
          statusPosisi: editForm.statusPosisi,
          poolParkir: editForm.poolParkir,
          namaBengkel: editForm.statusPosisi === 'servis' ? editForm.namaBengkel : '',
          kontakBengkel: editForm.statusPosisi === 'servis' ? editForm.kontakBengkel : '',
          estimasiSelesaiServis: editForm.statusPosisi === 'servis' ? editForm.estimasiSelesaiServis : '',
          noBooking: editForm.statusPosisi === 'disewa' ? editForm.noBooking : '',
          namaPenyewa: editForm.statusPosisi === 'disewa' ? editForm.namaPenyewa : '',
          tenggatKembali: editForm.statusPosisi === 'disewa' ? editForm.tenggatKembali : '',
          updatedAt: 'Baru saja (WIB)',
          updatedBy: 'Admin Staf',
        };
      })
    );
    setEditingUnitId(null);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const stats = useMemo(() => {
    const parkirMalang = units.filter((u) => u.statusPosisi === 'parkir' && u.poolParkir === 'malang').length;
    const parkirBatu = units.filter((u) => u.statusPosisi === 'parkir' && u.poolParkir === 'batu').length;
    const servis = units.filter((u) => u.statusPosisi === 'servis').length;
    const disewa = units.filter((u) => u.statusPosisi === 'disewa').length;
    return {
      total: units.length,
      bebasGlobal: parkirMalang + parkirBatu,
      parkirMalang,
      parkirBatu,
      servis,
      disewa,
    };
  }, [units]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 Zones */}
      <header className="flex items-center justify-between gap-4 md:gap-8 px-4 md:px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="flex items-center gap-2.5 shrink-0">
          <a href="#top" className="text-base md:text-lg font-bold tracking-tight text-emerald-950 whitespace-nowrap">
            Ryokourent V2 Console
          </a>
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-md font-mono border border-emerald-300">
            ZLCE Mode LITE
          </span>
        </div>

        <nav className="hidden xl:flex items-center gap-5 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('recovery_wizard')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'recovery_wizard' ? 'text-emerald-800 border-b-2 border-emerald-700 font-bold' : ''
            }`}
          >
            <RotateCcw className="w-4 h-4 text-emerald-700" />
            <span>Wizard Recovery ZLCE</span>
          </button>
          <button
            onClick={() => setActiveTab('portal_publik')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'portal_publik' ? 'text-emerald-800 border-b-2 border-emerald-700 font-semibold' : ''
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-700" />
            Portal Publik (007)
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer ${
              activeTab === 'workflow' ? 'text-emerald-800 border-b-2 border-emerald-700 font-semibold' : ''
            }`}
          >
            Alur Kerja MD
          </button>
          <button
            onClick={() => setActiveTab('model_katalog')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'model_katalog' ? 'text-emerald-800 border-b-2 border-emerald-700 font-semibold' : ''
            }`}
          >
            <Bike className="w-4 h-4 text-emerald-700" />
            Model & Tarif (003)
          </button>
          <button
            onClick={() => setActiveTab('armada_fisik')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'armada_fisik' ? 'text-emerald-800 border-b-2 border-emerald-700 font-semibold' : ''
            }`}
          >
            <KeyRound className="w-4 h-4 text-emerald-700" />
            Armada Fisik (004)
          </button>
          <button
            onClick={() => setActiveTab('transaksi_state')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'transaksi_state' ? 'text-emerald-800 border-b-2 border-emerald-700 font-semibold' : ''
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Transaksi & State (005)
          </button>
          <button
            onClick={() => setActiveTab('lacak')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'lacak' ? 'text-emerald-800 border-b-2 border-emerald-700 font-semibold' : ''
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-700" />
            Lacak Real-Time (006)
          </button>
          <button
            onClick={() => setActiveTab('denda')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer ${
              activeTab === 'denda' ? 'text-emerald-800 border-b-2 border-emerald-700 font-semibold' : ''
            }`}
          >
            Denda ShortRent
          </button>
          <button
            onClick={() => setActiveTab('kode')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 cursor-pointer ${
              activeTab === 'kode' ? 'text-emerald-800 border-b-2 border-emerald-700 font-semibold' : ''
            }`}
          >
            Kode Plugin
          </button>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('recovery_wizard')}
            className={`px-3 py-1.5 md:px-3.5 md:py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs cursor-pointer ${
              activeTab === 'recovery_wizard'
                ? 'bg-emerald-700 text-white ring-2 ring-emerald-500'
                : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Wizard Recovery</span>
          </button>
          <button
            onClick={() => copyText(STATIC_HANDOVER_PROMPT)}
            className="px-3 py-1.5 md:px-3.5 md:py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap hidden sm:inline-flex cursor-pointer"
          >
            {copied ? 'Prompt Tersalin!' : 'Salin Handover'}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Hero / Summary Banner */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 md:p-8">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
              <span>Sistem 3 Folder MD</span>
              <span aria-hidden="true">·</span>
              <span>TASK-001 s/d TASK-037</span>
              <span aria-hidden="true">·</span>
              <span>Keputusan D-01 s/d D-29</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Sistem 1 Folder Kerja (<code className="font-mono text-xl md:text-2xl">FOLDER_KERJA/</code>) & Input <code className="font-mono text-xl md:text-2xl">NEW_TASK.md</code>
            </h1>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
              Seluruh berkas Markdown kini ditata ke dalam <strong className="text-slate-900">3 Folder Terpisah</strong>:{' '}
              <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">FOLDER_KERJA/</code> (1 folder wajib di-upload di setiap sesi berisi <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">HANDOVER.md</code>, <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">NEW_TASK.md</code>, <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">SESSION_STATE.md</code>, & <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">SPEC_AND_DECISIONS.md</code>),{' '}
              <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">docs/</code> (khusus tutorial & panduan operasional), dan{' '}
              <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">ARSIP/</code> (kumpulan 15 file MD lama).
            </p>
          </div>

          {/* Mobile Tab Bar */}
          <div className="flex xl:hidden items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-xl mt-6 overflow-x-auto shadow-2xs">
            <button
              onClick={() => setActiveTab('recovery_wizard')}
              className={`px-3 py-2 text-xs font-bold rounded-lg whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'recovery_wizard' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-800 bg-white hover:bg-slate-50'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Wizard Recovery ZLCE</span>
            </button>
            <button
              onClick={() => setActiveTab('portal_publik')}
              className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer ${
                activeTab === 'portal_publik' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 bg-white hover:bg-slate-50'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              Portal (007)
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'workflow' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 bg-white hover:bg-slate-50'
              }`}
            >
              FOLDER_KERJA
            </button>
            <button
              onClick={() => setActiveTab('model_katalog')}
              className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer ${
                activeTab === 'model_katalog' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 bg-white hover:bg-slate-50'
              }`}
            >
              <Bike className="w-3.5 h-3.5 text-emerald-600" />
              Model (003)
            </button>
            <button
              onClick={() => setActiveTab('armada_fisik')}
              className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer ${
                activeTab === 'armada_fisik' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 bg-white hover:bg-slate-50'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              Armada (004)
            </button>
            <button
              onClick={() => setActiveTab('transaksi_state')}
              className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer ${
                activeTab === 'transaksi_state' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 bg-white hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Transaksi (005)
            </button>
            <button
              onClick={() => setActiveTab('lacak')}
              className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer ${
                activeTab === 'lacak' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 bg-white hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Lacak (006)
            </button>
            <button
              onClick={() => setActiveTab('denda')}
              className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'denda' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 bg-white hover:bg-slate-50'
              }`}
            >
              Kalkulator Denda
            </button>
            <button
              onClick={() => setActiveTab('kode')}
              className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'kode' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 bg-white hover:bg-slate-50'
              }`}
            >
              Kode Plugin
            </button>
          </div>
        </section>

        {/* KPI Strip */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500">Total Armada Global</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">{stats.total} Unit</div>
            <div className="text-xs text-slate-500 mt-1">Tanpa sekat kuota pool</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500">Parkir di Pool Malang</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">{stats.parkirMalang} Unit</div>
            <div className="text-xs text-slate-500 mt-1">Jl. MT Haryono Dinoyo</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500">Parkir di Pool Batu</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">{stats.parkirBatu} Unit</div>
            <div className="text-xs text-slate-500 mt-1">Jl. Diponegoro Batu</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs text-slate-500">Servis di Bengkel</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-700 mt-1">{stats.servis} Unit</div>
            <div className="text-xs text-slate-500 mt-1">Tercatat nama bengkel</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 col-span-2 lg:col-span-1">
            <div className="text-xs text-slate-500">Posisi Sedang Disewa</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-blue-700 mt-1">{stats.disewa} Unit</div>
            <div className="text-xs text-slate-500 mt-1">Tercatat nama penyewa</div>
          </div>
        </section>

        {/* TAB 0: WIZARD RECOVERY ZLCE & WORKBENCH */}
        {activeTab === 'recovery_wizard' && (
          <section className="space-y-6">
            <ZlceStudioWorkbench onNavigateToTab={(tab) => setActiveTab(tab as any)} />
          </section>
        )}

        {/* TAB 1: ALUR KERJA MD & HANDOVER PROMPT */}
        {activeTab === 'workflow' && (
          <div className="space-y-6">
            {/* Banner Khusus Pemulihan Sesi Android */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-emerald-700/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-400 text-slate-950 rounded-md">
                    Recovery Terpandu Android
                  </span>
                  <span className="text-xs text-emerald-400 font-mono">Anti-Sesi Hilang</span>
                </div>
                <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                  <span>Sesi AI Terputus atau Tab Android Me-reload? Buka Wizard Recovery</span>
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Jalankan snapshot repositori otomatis, analisis Kasus A–D terhadap WAL, dan salin Bundel Handover All-in-One dalam 1 kali sentuh.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('recovery_wizard')}
                className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Buka Wizard Recovery</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Petunjuk 3 Folder MD */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                  <h2 className="text-base font-bold text-slate-900">
                    Pembagian 3 Folder MD (<code className="font-mono">FOLDER_KERJA/</code>, <code className="font-mono">docs/</code>, <code className="font-mono">ARSIP/</code>)
                  </h2>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-800">D-29 AKTIF</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-2">
                  <div className="font-bold text-emerald-950">1. FOLDER_KERJA/ (WAJIB DI-UPLOAD SETIAP SESI)</div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700 font-medium">
                    <li><code className="font-mono font-bold text-slate-900">HANDOVER.md</code> (Prompt statis siap salin)</li>
                    <li><code className="font-mono font-bold text-slate-900">NEW_TASK.md</code> (Isi task baru / default: <code className="font-mono">Tidak ada</code>)</li>
                    <li><code className="font-mono font-bold text-slate-900">SESSION_STATE.md</code> (Status & Checklist <code className="font-mono">[x]/[ ]</code>)</li>
                    <li><code className="font-mono font-bold text-slate-900">SPEC_AND_DECISIONS.md</code> (D-01..D-29 & 5 CPT)</li>
                  </ol>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="font-bold text-slate-900">2. docs/ (KHUSUS TUTORIAL & PANDUAN)</div>
                  <p className="text-slate-600 leading-relaxed">
                    Berisi <code className="font-mono font-semibold">PANDUAN_XAMPP_WIN11_SIMULASI.md</code>, <code className="font-mono font-semibold">OPERATOR_MANUAL.md</code>, <code className="font-mono">ADMIN_GUIDE.md</code>, & <code className="font-mono">DEPLOYMENT_GUIDE.md</code>. <strong>Tidak perlu di-upload/dibaca</strong> kecuali diminta diubah di <code className="font-mono">NEW_TASK.md</code>.
                  </p>
                </div>

                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg space-y-2">
                  <div className="font-bold text-amber-950">3. ARSIP/ (KUMPULAN SEMUA 15 MD LAMA)</div>
                  <p className="text-slate-600 leading-relaxed">
                    Menyimpan 15 file MD lama (<code className="font-mono">AI_RULES.md</code>, <code className="font-mono">AI_WORKFLOW.md</code>, <code className="font-mono">TASKS.md</code>, <code className="font-mono">DECISIONS.md</code>, dll.). Sudah dilebur ke <code className="font-mono">FOLDER_KERJA/</code> dan <strong>tidak pernah di-upload lagi</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Explorer Berkas Markdown Terupdate */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-2">
                {Object.entries(MD_FILES_CONTENT).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMdKey(key)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${
                      selectedMdKey === key
                        ? 'bg-white border-emerald-700 shadow-sm'
                        : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                      <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{item.summary}</div>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      {MD_FILES_CONTENT[selectedMdKey].title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {MD_FILES_CONTENT[selectedMdKey].summary}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyText(
                        selectedMdKey === 'new_task'
                          ? activeNewTaskFile
                          : MD_FILES_CONTENT[selectedMdKey].content
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 whitespace-nowrap shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin' : 'Salin Isi MD'}</span>
                  </button>
                </div>

                {selectedMdKey === 'new_task' && (
                  <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="permintaan-user-input" className="text-xs font-semibold text-slate-800">
                        Isi FOLDER_KERJA/NEW_TASK.md (Tulis task baru / perubahan; default: &quot;Tidak ada&quot;)
                      </label>
                      <button
                        type="button"
                        onClick={() => setPermintaanUser('Tidak ada')}
                        className="text-xs font-medium text-emerald-800 hover:underline whitespace-nowrap shrink-0"
                      >
                        Reset ke &quot;Tidak ada&quot;
                      </button>
                    </div>
                    <input
                      id="permintaan-user-input"
                      type="text"
                      value={permintaanUser}
                      onChange={(e) => setPermintaanUser(e.target.value)}
                      placeholder="Tidak ada"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700 font-mono"
                    />
                  </div>
                )}

                <pre className="p-5 text-xs font-mono bg-slate-950 text-slate-100 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  <code>
                    {selectedMdKey === 'new_task'
                      ? activeNewTaskFile
                      : MD_FILES_CONTENT[selectedMdKey].content}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1B: PORTAL PEMESANAN PUBLIK MODERN (TASK-007 - React 19 / Modern Decoupled) */}
        {activeTab === 'portal_publik' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-700 text-white rounded-lg shadow-xs">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-emerald-950">
                      Prototipe Portal Pelanggan Publik (TASK-007)
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 rounded-full">
                      React 19 Decoupled
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Antarmuka pemesanan mandiri: katalog model live, indikator stok biner (Tersedia/Habis), formulir booking cepat, dan terhubung langsung ke State Machine.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('transaksi_state')}
                className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap shadow-2xs flex items-center gap-1.5 self-start md:self-auto"
              >
                <span>Lihat Antrean Operator (005)</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
              </button>
            </div>

            <CustomerBookingPortal
              onBookingSuccess={() => {
                setActiveTab('transaksi_state');
              }}
            />
          </div>
        )}

        {/* TAB 2: MODEL & MULTI-TIER TARIF (TASK-003 - Cloud SQL PostgreSQL & React 19) */}
        {activeTab === 'model_katalog' && (
          <MotorModelManager />
        )}

        {/* TAB 3: MANAJEMEN UNIT ARMADA FISIK (TASK-004 - Cloud SQL PostgreSQL & React 19) */}
        {activeTab === 'armada_fisik' && (
          <ArmadaUnitManager />
        )}

        {/* TAB 4: TRANSAKSI & STATE MACHINE (TASK-005 - Cloud SQL PostgreSQL & React 19) */}
        {activeTab === 'transaksi_state' && (
          <BookingStateMachineManager />
        )}

        {/* TAB 5: MONITORING LACAK UNIT REAL-TIME (TASK-006 - Cloud SQL PostgreSQL & React 19) */}
        {activeTab === 'lacak' && (
          <LiveUnitTrackingDashboard />
        )}

        {/* TAB ARSIP MOCKUP LACAK LAMA */}
        {false && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    CPT Lacak Unit (ryokou_lacak) — Pelacakan Posisi Unit Real-Time
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sesuai D-26: Pool hanya tempat parkir (armada tidak dibagi kaku). Pantau posisi parkir, bengkel servis, dan penyewa aktif setiap unit.
                  </p>
                </div>

                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari kode unit, bengkel, penyewa..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
                <button
                  onClick={() => setFilterPosition('semua')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    filterPosition === 'semua' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua Unit ({units.length})
                </button>
                <button
                  onClick={() => setFilterPosition('parkir_malang')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    filterPosition === 'parkir_malang' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Parkir Pool Malang ({stats.parkirMalang})
                </button>
                <button
                  onClick={() => setFilterPosition('parkir_batu')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    filterPosition === 'parkir_batu' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Parkir Pool Batu ({stats.parkirBatu})
                </button>
                <button
                  onClick={() => setFilterPosition('servis')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    filterPosition === 'servis' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Servis di Bengkel ({stats.servis})
                </button>
                <button
                  onClick={() => setFilterPosition('disewa')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    filterPosition === 'disewa' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sedang Disewa ({stats.disewa})
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                      <th className="py-3 px-4">Kode Unit & Motor</th>
                      <th className="py-3 px-4">Posisi Saat Ini</th>
                      <th className="py-3 px-4">Berada di Pool Mana</th>
                      <th className="py-3 px-4">Kalau Service: di Bengkel Mana</th>
                      <th className="py-3 px-4">Kalau Posisi Sewa: Disewa Siapa</th>
                      <th className="py-3 px-4 text-right">Aksi Staf</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUnits.map((unit) => (
                      <React.Fragment key={unit.id}>
                        <tr className="hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="font-bold font-mono text-slate-900">{unit.kodeUnit}</div>
                            <div className="text-xs text-slate-600">{unit.motorName}</div>
                            <div className="text-xs text-slate-400 font-mono tabular-nums">
                              {unit.platNomor} · {unit.warna}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {unit.statusPosisi === 'parkir' && (
                              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Parkir di Pool</span>
                              </div>
                            )}
                            {unit.statusPosisi === 'servis' && (
                              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                                <span>Servis di Bengkel</span>
                              </div>
                            )}
                            {unit.statusPosisi === 'disewa' && (
                              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800">
                                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                                <span>Sedang Disewa</span>
                              </div>
                            )}
                            <div className="text-xs text-slate-400 mt-0.5 font-mono tabular-nums">{unit.updatedAt}</div>
                          </td>

                          <td className="py-3 px-4">
                            {unit.statusPosisi === 'parkir' ? (
                              <span className="font-semibold text-slate-900">
                                {unit.poolParkir === 'batu' ? 'Pool Batu' : 'Pool Malang'}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500">
                                Pool Asal: {unit.poolParkir === 'batu' ? 'Pool Batu' : 'Pool Malang'}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {unit.statusPosisi === 'servis' ? (
                              <div>
                                <div className="font-semibold text-slate-900">{unit.namaBengkel}</div>
                                <div className="text-xs text-slate-600">{unit.kontakBengkel}</div>
                                <div className="text-xs text-amber-800 font-mono tabular-nums mt-0.5">
                                  Est. Selesai: {unit.estimasiSelesaiServis}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            {unit.statusPosisi === 'disewa' ? (
                              <div>
                                <div className="font-semibold text-slate-900">{unit.namaPenyewa}</div>
                                <div className="text-xs font-mono text-slate-600">{unit.noBooking}</div>
                                <div className="text-xs text-blue-800 font-mono tabular-nums mt-0.5">
                                  Kembali: {unit.tenggatKembali}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => startEditUnit(unit)}
                              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                            >
                              Ubah Posisi
                            </button>
                          </td>
                        </tr>

                        {editingUnitId === unit.id && (
                          <tr className="bg-slate-50">
                            <td colSpan={6} className="p-4 border-t border-slate-200">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-900">
                                    Perbarui Posisi Unit {unit.kodeUnit} ({unit.motorName})
                                  </span>
                                  <button
                                    onClick={() => setEditingUnitId(null)}
                                    className="text-xs text-slate-500 hover:text-slate-800"
                                  >
                                    Batal
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                      Status Posisi Unit
                                    </label>
                                    <select
                                      value={editForm.statusPosisi}
                                      onChange={(e) =>
                                        setEditForm({
                                          ...editForm,
                                          statusPosisi: e.target.value as UnitPositionStatus,
                                        })
                                      }
                                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
                                    >
                                      <option value="parkir">Parkir di Pool</option>
                                      <option value="servis">Servis di Bengkel</option>
                                      <option value="disewa">Sedang Disewa Pelanggan</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                      Lokasi Pool Parkir (Malang / Batu)
                                    </label>
                                    <select
                                      value={editForm.poolParkir}
                                      onChange={(e) =>
                                        setEditForm({
                                          ...editForm,
                                          poolParkir: e.target.value as PoolLocation,
                                        })
                                      }
                                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
                                    >
                                      <option value="malang">Pool Malang</option>
                                      <option value="batu">Pool Batu</option>
                                    </select>
                                  </div>

                                  {editForm.statusPosisi === 'servis' && (
                                    <>
                                      <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                          Nama Bengkel Servis
                                        </label>
                                        <input
                                          type="text"
                                          value={editForm.namaBengkel}
                                          onChange={(e) => setEditForm({ ...editForm, namaBengkel: e.target.value })}
                                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                          Kontak Mekanik / Bengkel
                                        </label>
                                        <input
                                          type="text"
                                          value={editForm.kontakBengkel}
                                          onChange={(e) => setEditForm({ ...editForm, kontakBengkel: e.target.value })}
                                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                          Estimasi Selesai Servis
                                        </label>
                                        <input
                                          type="text"
                                          value={editForm.estimasiSelesaiServis}
                                          onChange={(e) =>
                                            setEditForm({ ...editForm, estimasiSelesaiServis: e.target.value })
                                          }
                                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
                                        />
                                      </div>
                                    </>
                                  )}

                                  {editForm.statusPosisi === 'disewa' && (
                                    <>
                                      <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                          Disewa Oleh Siapa (Nama Penyewa)
                                        </label>
                                        <input
                                          type="text"
                                          value={editForm.namaPenyewa}
                                          onChange={(e) => setEditForm({ ...editForm, namaPenyewa: e.target.value })}
                                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                          Nomor Booking
                                        </label>
                                        <input
                                          type="text"
                                          value={editForm.noBooking}
                                          onChange={(e) => setEditForm({ ...editForm, noBooking: e.target.value })}
                                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                          Jadwal / Tenggat Kembali
                                        </label>
                                        <input
                                          type="text"
                                          value={editForm.tenggatKembali}
                                          onChange={(e) => setEditForm({ ...editForm, tenggatKembali: e.target.value })}
                                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md"
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>

                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setEditingUnitId(null)}
                                    className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    onClick={() => saveUnitPosition(unit.id)}
                                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 rounded-md hover:bg-emerald-900"
                                  >
                                    Simpan Posisi Unit
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KALKULATOR DENDA SHORTRENT & HARIAN (D-27) */}
        {activeTab === 'denda' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Simulator Aturan Denda ShortRent (D-27)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Uji keterlambatan 60 menit naik ke kategori jam di atasnya (3j &rarr; 6j &rarr; 9j &rarr; 12j) dan denda 12 jam = denda harian.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    1. Pilih Tipe Motor
                  </label>
                  <select
                    value={selectedMotorId}
                    onChange={(e) => setSelectedMotorId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700"
                  >
                    {MOTOR_TARIFFS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (Harian: {formatRp(m.hargaHarian)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    2. Pilih Paket Durasi Awal
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: '3_jam', label: 'ShortRent 3 Jam' },
                      { key: '6_jam', label: 'ShortRent 6 Jam' },
                      { key: '9_jam', label: 'ShortRent 9 Jam' },
                      { key: '12_jam', label: 'ShortRent 12 Jam' },
                      { key: 'harian', label: 'Harian (24 Jam)' },
                    ].map((tier) => (
                      <button
                        key={tier.key}
                        onClick={() => setSelectedTier(tier.key as typeof selectedTier)}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors ${
                          selectedTier === tier.key
                            ? 'bg-emerald-900 text-white border-emerald-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      3. Durasi Keterlambatan (Menit)
                    </label>
                    <span className="text-xs font-mono font-bold text-emerald-800 tabular-nums">
                      {lateMinutes} menit ({(lateMinutes / 60).toFixed(1)} jam)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={15}
                    value={lateMinutes}
                    onChange={(e) => setLateMinutes(Number(e.target.value))}
                    className="w-full accent-emerald-800"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[0, 45, 60, 120, 180, 240].map((m) => (
                      <button
                        key={m}
                        onClick={() => setLateMinutes(m)}
                        className={`px-2.5 py-1 text-xs font-mono rounded border ${
                          lateMinutes === m
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {m} mnt
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="text-xs font-medium text-emerald-800">{penaltySimulation.ruleApplied}</div>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    Hasil Perhitungan Tagihan & Denda
                  </h3>
                </div>
                <Clock className="w-5 h-5 text-slate-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500">Kategori & Tarif Awal</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{penaltySimulation.kategoriAwal}</div>
                  <div className="text-base font-mono font-bold text-slate-800 tabular-nums mt-1">
                    {formatRp(penaltySimulation.hargaAwal)}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200">
                  <div className="text-xs text-amber-900">Kategori Setelah Evaluasi</div>
                  <div className="text-sm font-bold text-amber-950 mt-1">{penaltySimulation.kategoriBaru}</div>
                  <div className="text-base font-mono font-bold text-amber-900 tabular-nums mt-1">
                    Denda: {formatRp(penaltySimulation.dendaNominal)}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200">
                  <div className="text-xs text-emerald-900">Total Tagihan Akhir</div>
                  <div className="text-xs text-emerald-700 mt-1">Tarif Awal + Denda</div>
                  <div className="text-lg font-mono font-bold text-emerald-950 tabular-nums mt-1">
                    {formatRp(penaltySimulation.totalBayar)}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                <div className="font-semibold text-slate-900">Penjelasan Logika Sistem (includes/booking.php):</div>
                <p>{penaltySimulation.explanation}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-600 mb-2">
                  Matriks Tarif {penaltySimulation.motor.name}
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <th className="py-2 px-3">Paket 3 Jam</th>
                        <th className="py-2 px-3">Paket 6 Jam</th>
                        <th className="py-2 px-3">Paket 9 Jam</th>
                        <th className="py-2 px-3">Paket 12 Jam</th>
                        <th className="py-2 px-3">1 Hari (24 Jam)</th>
                        <th className="py-2 px-3">Denda Harian / 12 Jam</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono tabular-nums">
                      <tr>
                        <td className="py-2.5 px-3 font-medium">{formatRp(penaltySimulation.motor.harga3Jam)}</td>
                        <td className="py-2.5 px-3 font-medium">{formatRp(penaltySimulation.motor.harga6Jam)}</td>
                        <td className="py-2.5 px-3 font-medium">{formatRp(penaltySimulation.motor.harga9Jam)}</td>
                        <td className="py-2.5 px-3 font-medium">{formatRp(penaltySimulation.motor.harga12Jam)}</td>
                        <td className="py-2.5 px-3 font-medium">{formatRp(penaltySimulation.motor.hargaHarian)}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-800">
                          {formatRp(penaltySimulation.motor.dendaHarianPerJam)}/jam
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: KODE PLUGIN WORDPRESS */}
        {activeTab === 'kode' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-2">
              {Object.entries(CODE_SNIPPETS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setSelectedSnippet(key)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    selectedSnippet === key
                      ? 'bg-white border-emerald-700 shadow-sm'
                      : 'bg-white/60 border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm text-slate-900">
                    <FileCode2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-500 mt-1 truncate">{item.path}</div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {CODE_SNIPPETS[selectedSnippet].title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {CODE_SNIPPETS[selectedSnippet].summary}
                  </p>
                </div>
                <button
                  onClick={() => copyText(CODE_SNIPPETS[selectedSnippet].code)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 whitespace-nowrap shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin Kode'}</span>
                </button>
              </div>
              <pre className="p-5 text-xs font-mono bg-slate-950 text-slate-100 overflow-x-auto leading-relaxed">
                <code>{CODE_SNIPPETS[selectedSnippet].code}</code>
              </pre>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>Ryokourent Rental Motor Malang Raya & Kota Wisata Batu — Alur Kerja MD (D-01 .. D-27)</span>
          <span>Zona Waktu Operasional: Asia/Jakarta (WIB)</span>
        </div>
      </footer>
    </div>
  );
}
