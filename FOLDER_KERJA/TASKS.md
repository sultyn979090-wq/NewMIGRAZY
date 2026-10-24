# BACKLOG TASK PENGEMBANGAN: RYOKOURENT RENTAL MOTOR

Definisi task. **Status task tidak ditulis di sini**; status ada di `SESSION_STATE.md`. Enum dan aturan: `AI_WORKFLOW.md`.  
Metodologi: **Zero-Loss Context Engineering (ZLCE v3.2.2 - Mode LITE)**.

---

## 1. PETA FASE

* **FASE 0: Pondasi, Konsolidasi & Restrukturisasi** (`TASK-001` s/d `TASK-002`)
* **FASE 1: Dashboard Admin — Manajemen Model & Kategori Motor** (`TASK-003`)
* **FASE 2: Dashboard Admin — Manajemen Unit Armada Fisik** (`TASK-004`)
* **FASE 3: Dashboard Admin — Transaksi & State Machine (Accept, Reject, Cancel, Selesai)** (`TASK-005`)
* **FASE 4: Dashboard Admin — Monitoring Lacak Unit Real-Time (Parkir, Disewa, Servis)** (`TASK-006`)
* **FASE 5: Prototipe Arsitektur Alternatif Modern (React 19 / TypeScript / REST)** (`TASK-007`)
* **FASE 6: Verifikasi E2E & Finalisasi Handover** (`TASK-008`)
* **FASE 7: Penyelarasan & Sinkronisasi Ekosistem** (`TASK-009`)

---

## 2. FORMAT TASK

### TASK-001: Restrukturisasi & Penyederhanaan Repositori
* **Fase:** FASE 0
* **Deskripsi:** Merapikan direktori kerja, membersihkan dokumentasi lama yang sudah dibackup di luar repo, dan memelihara berkas kontrol ZLCE Mode LITE (`BLUEPRINT.md`, `TASKS.md`, `SESSION_STATE.md`, `HANDOVER.md`).
* **Dependensi:** -
* **File:** `FOLDER_KERJA/*`, `docs/*`
* **Docs Terkait (Tier 1):** `BLUEPRINT.md`
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Direktori `/FOLDER_KERJA/` hanya memuat berkas aktif terkini.
  2. Direktori `/docs/` hanya memuat panduan recovery aktif (`PANDUAN_WIZARD_RECOVERY_ZLCE.md`).
  3. Repositori bersih, ringan, dan bebas dari duplikasi file.
* **Test Case:** Validasi struktur direktori bersih.
* **Metode Verifikasi:** `list_dir` dan verifikasi integritas berkas kontrol.

---

### TASK-002: Konsolidasi Baseline & Sinkronisasi Aturan Bisnis (D-01..D-31)
* **Fase:** FASE 0
* **Deskripsi:** Memvalidasi seluruh aturan operasional rental (`D-01` s/d `D-31`) terintegrasi ke dalam spesifikasi sistem tanpa merusak kode WordPress native eksisting (`D-31`).
* **Dependensi:** `TASK-001`
* **File:** `FOLDER_KERJA/SPEC_AND_DECISIONS.md`, `FOLDER_KERJA/SESSION_STATE.md`
* **Docs Terkait (Tier 1):** `BLUEPRINT.md`
* **Docs Impact:** `SPEC_AND_DECISIONS.md`
* **Acceptance Criteria:**
  1. Aturan D-01 s/d D-31 terpetakan konsisten ke `BR-01` s/d `BR-06`.
  2. Kode eksisting `wp-content/` terproteksi 100%.
* **Test Case:** Review konsistensi aturan.
* **Metode Verifikasi:** Peninjauan silang tabel keputusan dan validasi skema database.

---

### TASK-003: Dashboard Admin — Manajemen Model & Kategori Motor
* **Fase:** FASE 1
* **Deskripsi:** Implementasi antarmuka dan logika tambah/edit model motor, kategori motor (Matic, Sport, Trail, Retro), serta penetapan multi-tier tarif (1 Hari, 1 Minggu, 2 Minggu, 12 Jam, 9 Jam, 6 Jam, 3 Jam) dan denda harian.
* **Dependensi:** `TASK-002`
* **File:** `app/page.tsx`, `components/MotorModelManager.tsx`, `app/api/motor-models/*`
* **Docs Terkait (Tier 1):** `BLUEPRINT.md` (MOD-02)
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Admin dapat menambah dan mengubah data model motor beserta kategori.
  2. Multi-tier tarif tersimpan dan terhitung secara otomatis dengan pembulatan ribuan.
* **Test Case:** Input model motor baru dan verifikasi perubahan tarif harian/jam.
* **Metode Verifikasi:** Pengujian UI form, inspeksi state management, dan cURL GET/POST `/api/motor-models`.

---

### TASK-004: Dashboard Admin — Manajemen Unit Armada Fisik
* **Fase:** FASE 2
* **Deskripsi:** Implementasi antarmuka dan logika kelola unit fisik garasi (`armada_units`): kode unit unik readonly (misal: B122), plat nomor, warna, relasi ke model induk, dan pool parkir fisik (Pool Malang / Pool Batu).
* **Dependensi:** `TASK-003`
* **File:** `app/page.tsx`, `components/ArmadaUnitManager.tsx`, `app/api/armada-units/*`
* **Docs Terkait (Tier 1):** `BLUEPRINT.md` (MOD-03)
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Admin dapat mendaftarkan unit fisik baru dengan `kode_unit` unik.
  2. `kode_unit` terkunci (readonly) setelah dibuat pertama kali.
  3. Lokasi parkir fisik tersinkronisasi otomatis ke modul pelacakan (1-unit-1-baris).
* **Test Case:** Pendaftaran unit baru dan verifikasi immutability kode unit.
* **Metode Verifikasi:** Uji interaksi form unit fisik, validasi status HTTP POST `/api/armada-units`.

---

### TASK-005: Dashboard Admin — Transaksi & State Machine (Accept, Reject, Cancel, Selesai)
* **Fase:** FASE 3
* **Deskripsi:** Implementasi antarmuka pengelolaan pesanan pelanggan dengan State Machine 4 status (`Booking` -> `Approved` -> `Disewa` -> `Selesai`), aksi konfirmasi (Approve & Kunci Unit), tolak/batal (Reject/Cancel dengan konfirmasi 2 langkah), proteksi buffer 90 menit, dan kalkulasi otomatis denda ShortRent bertingkat saat Selesai.
* **Dependensi:** `TASK-004`
* **File:** `app/page.tsx`, `components/BookingStateMachineManager.tsx`, `app/api/penyewaan/*`
* **Docs Terkait (Tier 1):** `BLUEPRINT.md` (MOD-04)
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Aksi Approve mengunci unit fisik yang tersedia bebas bentrok buffer 90 menit.
  2. Aksi Reject/Cancel hanya dapat dilakukan sebelum status Disewa.
  3. Aksi Selesai menghitung denda keterlambatan jika melebihi jadwal kembali.
* **Test Case:** Alur siklus pemesanan lengkap dan pengujian batas pembatalan saat Disewa.
* **Metode Verifikasi:** Eksekusi skenario state transition pada UI dashboard dan REST API test.

---

### TASK-006: Dashboard Admin — Monitoring Lacak Unit Real-Time (Parkir, Disewa, Servis)
* **Fase:** FASE 4
* **Deskripsi:** Implementasi tabel monitoring dan filter cepat status posisi seluruh unit armada fisik: Parkir di Pool (Malang/Batu), Servis di Bengkel (nama bengkel, kontak, estimasi selesai), atau Sedang Disewa (nama penyewa, no booking, tenggat kembali).
* **Dependensi:** `TASK-005`
* **File:** `app/page.tsx`, `components/LiveUnitTrackingDashboard.tsx`, `app/api/lacak-units/*`
* **Docs Terkait (Tier 1):** `BLUEPRINT.md` (MOD-05)
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Menampilkan 1 baris aktif per unit fisik tanpa duplikasi.
  2. Filter instan berdasarkan status posisi (Parkir, Servis, Disewa) dan Pool.
  3. Admin dapat memperbarui status servis bengkel secara cepat.
* **Test Case:** Filter pencarian unit dan transisi posisi dari Parkir -> Disewa -> Parkir.
* **Metode Verifikasi:** Pengujian filter UI dan update posisi unit via REST API `/api/lacak-units`.

---

### TASK-007: Prototipe Arsitektur Alternatif Modern (Vite / React 19 / TypeScript)
* **Fase:** FASE 5
* **Deskripsi:** Membangun antarmuka modern mandiri (portal pemesanan interaktif publik + dashboard terpadu) berbasis React 19 / TypeScript / Tailwind CSS dengan state management reaktif dan arsitektur anti double-booking yang terhubung ke backend REST API.
* **Dependensi:** `TASK-006`
* **File:** `app/*`, `components/CustomerBookingPortal.tsx`, `components/*`
* **Docs Terkait (Tier 1):** `BLUEPRINT.md` (MOD-06, MOD-07)
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. Aplikasi berjalan lancar, responsif, dan bebas error kompilasi/build.
  2. Mendukung katalog model, indikator stok biner, formulir booking anti-NIK (UU PDP), dashboard state machine, dan lacak unit.
* **Test Case:** Kompilasi aplikasi (`compile_applet`) dan validasi linting (`lint_applet`) lulus 0 error.
* **Metode Verifikasi:** Eksekusi build, lint, dan validasi UI interaktif.

---

### TASK-008: Verifikasi E2E & Finalisasi Handover
* **Fase:** FASE 6
* **Deskripsi:** Pengujian menyeluruh seluruh skenario kebutuhan inti, verifikasi interoperabilitas WordPress Native (`wp-content/`), sinkronisasi dokumen kontrol ZLCE, dan penyiapan berkas `HANDOVER.md` siap pakai.
* **Dependensi:** `TASK-007`
* **File:** `FOLDER_KERJA/*`, `wp-content/*`
* **Docs Terkait (Tier 1):** `BLUEPRINT.md`, `TASKS.md`
* **Docs Impact:** `SESSION_STATE.md`, `HANDOVER.md`
* **Acceptance Criteria:**
  1. Seluruh task 001 s/d 007 berstatus DONE dengan bukti verifikasi konkret.
  2. Checkpoint dan log audit mutakhir.
  3. Berkas WordPress native utuh dan terintegrasi dengan REST API.
* **Test Case:** Audit kualitas akhir ZLCE dan automated E2E test.
* **Metode Verifikasi:** `compile_applet`, `lint_applet`, `zlce-check.py`, dan cURL testing.

---

### TASK-009: Penyelarasan Sistem Model & Katalog Motor WordPress dengan Model (003) React
* **Fase:** FASE 7 (Penyelarasan & Sinkronisasi Ekosistem)
* **Deskripsi:** Menyamakan sistem model dan katalog motor di WordPress (`ryokourent-core`) dengan sistem model (003) di React, mencakup struktur data 6 model dummy (Scoopy, NMAX, CRF 150L, Fazzio, R15, BeAT), multi-tier tarif ribuan otomatis, badge kategori (Matic, Retro, Trail, Sport), spesifikasi & fasilitas, fungsi seeder otomatis, dan rendering katalog publik terintegrasi.
* **Dependensi:** `TASK-008`
* **File:** `wp-content/plugins/ryokourent-core/includes/meta-fields.php`, `wp-content/plugins/ryokourent-core/public/forms.php`, `wp-content/plugins/ryokourent-core/includes/rest-api.php`, `wp-content/plugins/ryokourent-core/assets/css/ryokourent-public.css`
* **Docs Terkait (Tier 1):** `BLUEPRINT.md` (MOD-02, MOD-08)
* **Docs Impact:** `SESSION_STATE.md`
* **Acceptance Criteria:**
  1. WordPress menyediakan daftar 6 model contoh/dummy identik dengan Model (003) di React (nama, kategori, tarif bertingkat, denda per jam, fasilitas, dan spesifikasi).
  2. Shortcode katalog publik `[ryokou_katalog]` dan form booking `[ryokou_booking_form]` menampilkan badge kategori, spesifikasi, dan multi-tier selector yang serasi dengan Model (003).
  3. REST API `/wp-json/ryokourent/v1/motor-models` mengembalikan data 6 model tersebut secara konsisten dan lengkap.
  4. Tersedia fungsi seeder database `ryokourent_seed_sample_motors()` untuk populasi post `motor` secara otomatis.
* **Test Case:** Pengujian render shortcode katalog dan validasi REST API endpoint `/wp-json/ryokourent/v1/motor-models`.
* **Metode Verifikasi:** Uji sintaksis PHP, pengujian cURL endpoint, dan validasi `zlce-check.py`.

---

## 3. TEMPLATE TASK REVISI

### TASK-REV-NN: [Judul]
* **Asal:** [sumber revisi / tanggal]
* **Level:** M | L
* **Mem-preempt:** [TASK-ID yang dijeda]
* **Deskripsi:** [deskripsi perubahan]
* **Dependensi:** [task dependensi]
* **File:** [berkas terdampak]
* **Docs Terkait (Tier 1):** [dokumen terkait]
* **Docs Impact:** [dokumen terdampak]
* **Acceptance Criteria:**
  1. [AC 1]
  2. [AC 2]
* **Test Case:** [test case]
* **Metode Verifikasi:** [metode verifikasi]
