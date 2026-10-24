# Ryokourent — Rental Sepeda Motor Malang Raya & Kota Wisata Batu

Sistem manajemen rental sepeda motor WordPress Native (`ryokourent-core` + `generatepress-child`) dengan pelacakan posisi unit *real-time* (`CPT Lacak Unit` — `D-26`), kalkulator denda ShortRent Step-Up 60 Menit (`D-27`), dan tata kelola **Sistem 1 Folder Kerja (`D-29`)**.

---

## Struktur Folder Tata Kelola Proyek

1. **`FOLDER_KERJA/` — WAJIB DI-UPLOAD DI SETIAP SESI AI (1 Folder Saja!)**
   - `FOLDER_KERJA/HANDOVER.md` — Prompt Jembatan Antar-AI permanen (siap salin).
   - `FOLDER_KERJA/NEW_TASK.md` — Tempat Anda menulis task baru / temuan uji manual / perubahan aturan (default: `Tidak ada`).
   - `FOLDER_KERJA/SESSION_STATE.md` — Status sesi terakhir & checklist checkpoint `[x]` / `[ ]` untuk sambung kerja bila terputus.
   - `FOLDER_KERJA/SPEC_AND_DECISIONS.md` — Acuan tunggal keputusan bisnis (`D-01..D-31`) & skema 5 CPT.
   - `FOLDER_KERJA/AI_WORKFLOW.md` — Tata kelola operasional agen, aturan R1–R12, triase revisi R7, dan proteksi kode `D-31`.

2. **`docs/` — PANDUAN RECOVERY (Tidak Perlu Di-upload Rutin)**
   - `docs/PANDUAN_WIZARD_RECOVERY_ZLCE.md` — Panduan langkah demi langkah penggunaan Fitur Wizard Recovery ZLCE untuk pemulihan sesi AI terputus di HP/Android & desktop.

