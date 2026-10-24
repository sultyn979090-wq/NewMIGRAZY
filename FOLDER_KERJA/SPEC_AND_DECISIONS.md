# SPEC_AND_DECISIONS.md — ATURAN BISNIS (`D-01..D-30`) & SKEMA DATA RYOKOURENT

> **Peran Berkas Ini (`FOLDER_KERJA/SPEC_AND_DECISIONS.md`):**  
> Satu-satunya sumber kebenaran gabungan untuk **Keputusan Bisnis (`DECISIONS`)**, **Skema 5 CPT (`DATA_MODEL`)**, dan **Rumus Ketersediaan & Denda (`ARCHITECTURE`)**.  
> **Aturan Update:** Jika ada perubahan aturan bisnis dari `NEW_TASK.md`, perbarui langsung baris `D-lama` yang terkait di tabel ini dan/atau tambahkan `D-baru` agar tidak pernah ada dua aturan yang saling bertentangan.

---

## 1. Tabel Keputusan Arsitektur & Bisnis Aktif (`D-01` .. `D-30`)

| Kode | Keputusan Inti (Kondisi Terupdate) | Dampak Teknis & Operasional |
| :--- | :--- | :--- |
| **D-01** | Platform WordPress native (`ryokourent-core` + `generatepress-child`). Tanpa plugin/tema berbayar (`D-08`). | Ringan untuk shared hosting (50–100 booking/bulan). |
| **D-02** | Role `ryokou_operator` punya akses penuh operasional (edit harga, paket, bulk pricing `-50%..+200%`, kelola booking, update `Lacak Unit`, ganti nomor WA) **KECUALI** kelola akun user & hapus master model/unit/`ryokou_lacak` (`D-09`, `D-22`). | Menggunakan custom cap `ryokourent_manage_settings` tanpa `manage_options`, diproteksi dengan filter `map_meta_cap` di `includes/post-types.php`. |
| **D-03** | Alur Booking: Form Web Publik → Validasi AJAX → Generate Pesan WA UTF-8 (`D-09`) → Redirect WhatsApp → Staf Approve di WP-Admin. | Nomor WA Admin memiliki audit log pencatat nama pengubah & waktu WIB (`D-23`) di submenu `Pengaturan & Bulk Tarif`. |
| **D-04** | **State Machine 4 Status:** `Booking` (`ryokou_booking`) → `Approve Booking` (`ryokou_approved`) → `Disewa` (`ryokou_disewa`) → `Selesai` (`ryokou_selesai`). | `Booking` belum mengunci stok; baru mengunci unit setelah `Approve Booking` di dalam kunci atomik MySQL `GET_LOCK` (`try...finally`). Reject/Cancel = hapus 2 langkah (`D-20`), ditolak jika sudah `Disewa` (`F-21`). |
| **D-05** | **Indikator Stok Biner Tegas:** Publik hanya melihat **`Tersedia` (Hijau)** atau **`Habis` (Merah)** tanpa angka stok riil. | Saat `Habis`, tombol booking tetap aktif ("Pesan via WA - Konfirmasi Ketersediaan"). Status kuning dihapus demi kejelasan kategori motor berarmada 1 unit. |
| **D-06** | Jam operasional reguler **07.00–23.00 WIB** (`Asia/Jakarta` — `D-24`). Di luar jam itu form tidak memblokir, tetapi memberi peringatan wajib kesepakatan admin (`D-10`). | Mendukung paket Sunrise Bromo / ambil malam di Pool Dinoyo Malang atau Pool Diponegoro Batu (`D-07`). |
| **D-11** | Perlengkapan standar: 2 helm SNI dan jas hujan (holder HP tersedia selama stok ada). Seluruh teks menggunakan i18n domain `ryokourent` (`D-25`). | Konsisten di katalog web dan template pesan WhatsApp. |
| **D-12** | Armada 2 tingkat: **Tingkat 1 (`motor`)** untuk katalog model & tarif; **Tingkat 2 (`ryokou_unit`)** untuk unit fisik riil (`_ryokou_kode_unit` unik & *readonly* permanen setelah dibuat, misal `B122`, plat nomor, warna, status servis, km oli). | Mendukung aksi **Tukar Unit Berkala** (`D-19`) untuk sewa jangka panjang (>1 minggu) guna servis & cegah penggelapan. |
| **D-14** | Booking berstatus `ryokou_booking` yang tidak di-approve dalam **48 jam** dihapus otomatis oleh WP-Cron (`twicedaily`) & *Lazy Purge* saat admin dibuka. | Database bersih dari pesanan gantung (`includes/post-types.php`). |
| **D-17** | **Jeda Antar-Sewa (*Turnaround Buffer*):** **90 menit (5400 detik)** di kedua sisi rentang jadwal pada unit fisik yang sama. | Akhir efektif unit yang sedang `Disewa` adalah $\max(\text{tenggat}, \text{sekarang})$ sehingga unit terlambat tidak tampak bebas sebelum diklik `Selesai`. |
| **D-18** | **2 Kategori Tarif + Paket Promo:**<br>1. **Kategori Harian:** `1 Hari (24 Jam)` [Tampilan Utama], `1 Minggu (7 Hari)`, `2 Minggu (14 Hari)`.<br>2. **Kategori Jam (ShortRent):** `12 Jam`, `9 Jam`, `6 Jam`, `3 Jam`.<br>3. **Kategori Paket:** Paket dinamis dari CPT `ryokou_paket`. | Katalog menampilkan Harga 1 Hari di posisi utama, dilengkapi dropdown bertingkat (*cascading*) Kategori → Durasi yang otomatis mengisi form booking & WA. |
| **D-21** | **Privasi UU PDP No. 27/2022 & Keamanan Form (`D-10`):** Database **DILARANG** menyimpan NIK 16 digit, foto KTP, alamat KTP lengkap, kontak darurat, medsos, atau alamat IP. | Hanya menyimpan `no_booking`, `nama`, `tanda_pelanggan` (repeat order), `jenis_id_pendukung` (`KTM`/`SIM_C`/`SIM_A`/`PASPOR`/`NPWP`/`ID_KARYAWAN`/`LAINNYA`), lokasi antar/jemput, jadwal, dan unit. Proteksi form: Honeypot, Signed Time Token ($\ge 4$ dtk), Rate Limit (`REMOTE_ADDR` 5/10m + 50/jam global), & Regex Anti-16 Digit NIK. |
| **D-26** | **Pool Hanya Sebagai Tempat Parkir & CPT Lacak Unit (`ryokou_lacak`):**<br>1. Pool Malang dan Pool Batu hanya berfungsi sebagai tempat parkir fisik, **bukan pembagi kaku kuota armada** (`D-13` direvisi: stok dihitung global dari seluruh unit aktif per tipe motor).<br>2. Ditambahkan CPT **`ryokou_lacak` (Lacak Unit)** untuk melacak posisi real-time setiap unit:<br>— **Parkir:** berada di pool mana (`Pool Malang` / `Pool Batu`).<br>— **Service:** berada di bengkel mana (nama bengkel, kontak mekanik, estimasi selesai).<br>— **Posisi Sewa:** sedang disewa oleh siapa (nama penyewa, no booking, tenggat kembali). | `ryokourent_get_available_units()` mengecek seluruh unit aktif jenis motor terkait tanpa filter pool. Saat Approve, dropdown menampilkan lokasi parkir unit saat ini (`B122 — Parkir: Pool Malang`). Aksi Serah Terima, Tukar Unit, Selesai, & Servis otomatis menyinkronkan CPT `ryokou_lacak`. |
| **D-27** | **Aturan Denda ShortRent Step-Up 60 Menit & 12 Jam = Denda Harian (Revisi `D-16`):**<br>1. **ShortRent 3, 6, 9 Jam:** Keterlambatan **$\ge 60$ menit** otomatis masuk ke **kategori jam di atasnya**:<br>— Sewa **3 Jam** telat $\ge 60$ mnt $\to$ masuk **6 Jam** (denda = $\text{Tarif}_{6\text{j}} - \text{Tarif}_{3\text{j}}$).<br>— Sewa **6 Jam** telat $\ge 60$ mnt $\to$ masuk **9 Jam** (denda = $\text{Tarif}_{9\text{j}} - \text{Tarif}_{6\text{j}}$).<br>— Sewa **9 Jam** telat $\ge 60$ mnt $\to$ masuk **12 Jam** (denda = $\text{Tarif}_{12\text{j}} - \text{Tarif}_{9\text{j}}$).<br>2. **ShortRent 12 Jam:** Denda keterlambatan yang dikenakan **sama dengan denda harian** (`_ryokou_denda_harian`, default Rp20.000/jam).<br>3. **Sewa Harian:** Toleransi 90 menit; lewat dari itu dikenakan `_ryokou_denda_harian` per jam. | Dihitung otomatis oleh `ryokourent_calculate_overtime_penalty()` di `includes/booking.php`, tampil di kolom admin `admin/booking-columns.php`, kotak `#ryokou_denda_shortrent_note` di `public/forms.php`, dan pesan WhatsApp (`includes/whatsapp.php`). |
| **D-28** | **Tata Kelola Mode Ultra-Ringkas:** Urutan kerja wajib **Checkpoint-First & Kode-Dulu** agar tahan terputus. | Menghemat pembacaan token di setiap sesi dan menjamin pekerjaan yang terputus dapat langsung dilanjutkan. |
| **D-29** | **Penyederhanaan Folder Tata Kelola (`FOLDER_KERJA/` & `docs/`) & `NEW_TASK.md`:**<br>1. **`FOLDER_KERJA/`** (1 Folder Wajib Di-upload di Setiap Sesi): `HANDOVER.md`, `NEW_TASK.md`, `SESSION_STATE.md`, `SPEC_AND_DECISIONS.md`, `AI_WORKFLOW.md`.<br>2. **`docs/`** (Panduan Pemulihan): `PANDUAN_WIZARD_RECOVERY_ZLCE.md`.<br>3. Berkas dokumentasi lama di `docs/` dan folder `ARSIP/` telah dibersihkan & dibackup di luar repo untuk merampingkan struktur repositori. | `HANDOVER.md` bersifat statis karena input tugas user dipisahkan ke `FOLDER_KERJA/NEW_TASK.md`. Seluruh aturan operasional terpusat di `FOLDER_KERJA/AI_WORKFLOW.md`. |
| **D-30** | **Penyesuaian Penuh `wp-content/` terhadap Spesifikasi (Opsi 1B, Opsi 2A, Opsi 3A):**<br>1. **Opsi 1B (Arsitektur Ringkas 8 File Modul Inti):** Seluruh fitur dikonsolidasikan ke 8 file modul inti.<br>2. **Opsi 2A (Form Publik Lengkap Lokasi):** Menyediakan dropdown Pool Area + 2 kolom terpisah (`alamat_pengantaran` & `alamat_penjemputan`) + dropdown `jenis_id_pendukung`.<br>3. **Opsi 3A (1 Unit Fisik = 1 Baris Aktif di `ryokou_lacak`):** Setiap unit fisik (`ryokou_unit`) otomatis memiliki tepat 1 baris di `ryokou_lacak`. | Menjaga struktur kode plugin tetap ringkas, bebas duplikasi baris di tabel Lacak Unit, dan patuh pada spesifikasi. |
| **D-31** | **Aturan Emas Proteksi Kode Eksisting (Larangan Mengubah/Menghapus Kode Lama Tanpa Konfirmasi):**<br>AI **DILARANG KERAS** mengubah, menimpa ulang seluruh file (*full file overwrite*), atau menghapus fungsi/kode yang sudah ada sebelumnya tanpa konfirmasi dan persetujuan eksplisit dari user. Setiap penambahan harus bersifat *surgical edit* (hanya menyentuh bagian yang diminta dan mempertahankan 100% kode lama yang sudah sesuai). | Mencegah regresi, hilangnya fitur yang sudah berjalan baik, atau rusaknya kode sebelumnya saat ada penambahan/perubahan baru. Tercantum permanen di `FOLDER_KERJA/AI_WORKFLOW.md` §3 dan §10. |

---

## 2. Skema 5 Custom Post Types (CPT) & Meta Keys Utama

### 2.1 CPT `motor` (Katalog Jenis Motor — Public)
- Taksonomi: `kategori_motor` (`Matic`, `Sport`, `Trail`, `Retro`)
- Meta Tarif: `_ryokou_harga_harian` (1 hari — utama), `_ryokou_harga_1minggu`, `_ryokou_harga_2minggu`, `_ryokou_harga_12jam`, `_ryokou_harga_9jam`, `_ryokou_harga_6jam`, `_ryokou_harga_3jam`.
- Meta Denda: `_ryokou_denda_harian` (default `20000` Rp/jam — berlaku untuk Harian & ShortRent 12 Jam sesuai `D-27`).
- Meta Info: `_ryokou_fasilitas`, `_ryokou_spesifikasi`.

### 2.2 CPT `ryokou_unit` (Unit Fisik Garasi — Admin Only)
- Post Status: `publish` (Aktif), `ryokou_servis` (Servis).
- Meta: `_ryokou_kode_unit` (unik, *readonly* permanen setelah dibuat, misal `B122`), `_ryokou_parent_motor_id`, `_ryokou_pool_lokasi` (`malang` | `batu` — hanya lokasi parkir fisik), `_ryokou_nomor_plat`, `_ryokou_warna`, `_ryokou_status_servis` (`aktif` | `servis`), `_ryokou_nama_bengkel`, `_ryokou_km_terakhir`, `_ryokou_tgl_servis_terakhir`.

### 2.3 CPT `ryokou_lacak` (Lacak Unit Real-Time — Admin Only, `D-26` & Opsi 3A: 1 Baris per Unit)
- Fungsi: Melacak posisi setiap unit fisik tanpa membagi kuota armada (1 unit fisik = 1 baris aktif).
- Meta:
  - `_ryokou_lacak_unit_id` (ID `ryokou_unit`), `_ryokou_lacak_kode_unit`, `_ryokou_lacak_motor_id`
  - `_ryokou_lacak_status_posisi`: `'parkir'` | `'servis'` | `'disewa'`
  - **Jika `parkir`:** `_ryokou_lacak_pool_parkir` (`'malang'` | `'batu'`)
  - **Jika `servis`:** `_ryokou_lacak_nama_bengkel`, `_ryokou_lacak_kontak_bengkel`, `_ryokou_lacak_estimasi_selesai_servis`
  - **Jika `disewa`:** `_ryokou_lacak_booking_id`, `_ryokou_lacak_no_booking`, `_ryokou_lacak_nama_penyewa`, `_ryokou_lacak_tenggat_kembali`
  - Audit: `_ryokou_lacak_catatan`, `_ryokou_lacak_updated_at`, `_ryokou_lacak_updated_by`
- Helper Sinkronisasi: `ryokourent_sync_unit_tracking( $unit_id, $args )` di `includes/meta-fields.php`.

### 2.4 CPT `penyewaan` (Transaksi Booking — Admin Only)
- 4 Post Status Resmi: `ryokou_booking` (`Booking`), `ryokou_approved` (`Approve Booking`), `ryokou_disewa` (`Disewa`), `ryokou_selesai` (`Selesai`).
- Meta: `_ryokou_no_booking` (`RYK-YYYYMMDD-XXX`), `_ryokou_nama`, `_ryokou_tanda_pelanggan`, `_ryokou_jenis_id_pendukung`, `_ryokou_alamat_pengantaran`, `_ryokou_alamat_penjemputan`, `_ryokou_pool` (`malang`|`batu`), `_ryokou_motor_id`, `_ryokou_snapshot_nama_motor`, `_ryokou_unit_id`, `_ryokou_snapshot_kode_unit`, `_ryokou_jam_tanggal_mulai`, `_ryokou_jam_tanggal_selesai`, `_ryokou_start_epoch`, `_ryokou_end_epoch`, `_ryokou_disewa_at`, `_ryokou_selesai_at`, `_ryokou_kategori_tarif` (`harian`|`jam`|`paket`|`kustom`), `_ryokou_pilihan_durasi` (`1_hari`|`1_minggu`|`2_minggu`|`12_jam`|`9_jam`|`6_jam`|`3_jam`), `_ryokou_label_durasi`, `_ryokou_total_harga_estimasi`, `_ryokou_denda_akhir`, `_ryokou_denda_keterangan`, `_ryokou_riwayat_tukar_unit`, `_ryokou_luar_jam_operasional`, `_ryokou_created_at`.

### 2.5 CPT `ryokou_paket` (Paket Promo Dinamis — Admin/Katalog)
- Meta: `_ryokou_paket_harga`, `_ryokou_paket_durasi_angka`, `_ryokou_paket_durasi_satuan` (`jam`|`hari`), `_ryokou_paket_motor_id`.

---

## 3. Peta Lokasi File Proyek

```text
├── FOLDER_KERJA/                    # 1 FOLDER WAJIB DI-UPLOAD DI SETIAP SESI
│   ├── HANDOVER.md                  # Prompt Jembatan Antar-AI (Statis/Permanen)
│   ├── NEW_TASK.md                  # Input Tugas Baru / Temuan Uji Manual (Default: Tidak ada)
│   ├── SESSION_STATE.md             # Status Terakhir & Checklist Checkpoint [x] / [ ]
│   ├── SPEC_AND_DECISIONS.md        # Keputusan D-01..D-31 & Skema 5 CPT
│   └── AI_WORKFLOW.md               # Tata kelola & aturan proteksi kode
├── docs/                            # PANDUAN RECOVERY
│   └── PANDUAN_WIZARD_RECOVERY_ZLCE.md
└── wp-content/
    ├── plugins/ryokourent-core/
    │   ├── ryokourent-core.php          # Bootstrap utama v2.1.0
    │   ├── includes/                    # post-types.php, meta-fields.php, availability.php, booking.php, whatsapp.php
    │   ├── admin/                       # lacak-columns.php, booking-columns.php (termasuk Settings WA, CSS, & Bulk Pricing)
    │   ├── public/                      # forms.php ([ryokou_katalog] & [ryokou_booking_form])
    │   └── assets/                      # css/ryokourent-public.css, js/ryokourent-booking.js
    └── themes/generatepress-child/
        ├── style.css
        └── functions.php
```

---

## 4. Pemetaan Alternatif Modern (React 19 + TypeScript + REST/PostgreSQL) ke Aturan Bisnis `D-01..D-31` / `BR-01..BR-06`

| Tabel PostgreSQL | Entitas WordPress Ekuivalen | Aturan Bisnis Terkait | Implementasi Teknis & Validasi |
| :--- | :--- | :--- | :--- |
| `motor_models` | CPT `motor` & Taksonomi `kategori_motor` | `D-18`, `D-22`, `BR-04` | Multi-tier tarif (1 Hari, 1 Minggu, 2 Minggu, 12 Jam, 9 Jam, 6 Jam, 3 Jam), denda harian per jam, pembulatan ribuan, penyesuaian bulk pricing (-50% s/d +200%). |
| `armada_units` | CPT `ryokou_unit` | `D-12`, `D-26`, `BR-03` | `kode_unit` unik & readonly (misal `B122`), relasi `motor_id`, nomor plat, warna, pool fisik default (`malang`/`batu`), status servis. |
| `lacak_units` | CPT `ryokou_lacak` (1 Unit = 1 Baris) | `D-26`, `Opsi 3A`, `BR-03` | Tepat 1 baris aktif per unit armada fisik. Kolom status posisi (`parkir`, `servis`, `disewa`), nama bengkel/kontak/estimasi selesai saat servis, nama penyewa/no booking/tenggat saat disewa. |
| `penyewaan` | CPT `penyewaan` | `D-03`, `D-04`, `D-17`, `D-21`, `D-27`, `BR-01`, `BR-02`, `BR-05` | Nomor booking unik `RYK-YYYYMMDD-XXX`, anti-NIK (UU PDP), buffer 90 menit (5400s), State Machine 4 status (`Booking` -> `Approve` -> `Disewa` -> `Selesai`), kalkulator denda ShortRent step-up 60 menit. |
| `pengaturan_operasional` | Submenu Pengaturan & Bulk Tarif | `D-09`, `D-22`, `D-23` | Nomor WhatsApp admin, audit log pencatat user & timestamp WIB, persentase bulk price adjustment. |
| `users` | Akun WP / Role `ryokou_operator` | `D-02`, `D-22` | Sinkronisasi Firebase Auth UID, email, nama, dan role ('admin' / 'operator'). |

> **Jaminan Proteksi Kode Eksisting (`D-31`):**  
> Seluruh kode WordPress native di `wp-content/plugins/ryokourent-core/` dan `wp-content/themes/generatepress-child/` tidak diubah destruktif dan tetap berfungsi 100% sebagai baseline teruji.

