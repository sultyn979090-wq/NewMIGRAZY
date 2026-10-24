# INFORMASI KONFIGURASI LINGKUNGAN SISTEM (ENVIRONMENT CONFIG)

Dokumen ini berisi rincian parameter environment, kredensial Firebase, koneksi Google Cloud SQL PostgreSQL, dan variabel lingkungan untuk sistem Ryokourent Rental Motor.

---

## 1. FIREBASE CONFIGURATION (`FIREBASE_API_KEY`)

Konfigurasi aktif bersumber dari `firebase-applet-config.json`:

| Kunci Konfigurasi | Nilai Aktif |
| :--- | :--- |
| **`FIREBASE_API_KEY`** | `AIzaSyAX4kTGJ1y0jyxPeI6RFmZ9xP2qRwYILT0` |
| **`FIREBASE_PROJECT_ID`** | `dogwood-wharf-b61jg` |
| **`FIREBASE_AUTH_DOMAIN`** | `dogwood-wharf-b61jg.firebaseapp.com` |
| **`FIREBASE_STORAGE_BUCKET`**| `dogwood-wharf-b61jg.firebasestorage.app` |
| **`FIREBASE_APP_ID`** | `1:949152195997:web:fdee7dc8772e313cd7bb74` |
| **`FIREBASE_MESSAGING_SENDER_ID`** | `949152195997` |
| **`FIREBASE_OAUTH_CLIENT_ID`** | `949152195997-an79nl79g01uj0f7i5sbppg2kudnbcha.apps.googleusercontent.com` |

---

## 2. DATABASE CONFIGURATION (`DATABASE_URL`)

Sistem menggunakan **Google Cloud SQL (PostgreSQL 16)** yang dikelola melalui **Drizzle ORM** (`src/db/index.ts`).

### Parameter Koneksi Aktif:
* **Host Socket (`SQL_HOST`):** `/app/cloudsql/dogwood-wharf-b61jg:asia-southeast1:ai-studio-28e0596b`
* **User Database (`SQL_USER`):** `ai_studio_app_user`
* **Nama Database (`SQL_DB_NAME`):** `cloud_sql_development_database`
* **Instance Connection Name:** `dogwood-wharf-b61jg:asia-southeast1:ai-studio-28e0596b`
* **Region:** `asia-southeast1` (Jakarta / Singapura)

### Format Standard `DATABASE_URL` (PostgreSQL URI):
```text
postgresql://ai_studio_app_user:[PASSWORD]@/cloud_sql_development_database?host=/app/cloudsql/dogwood-wharf-b61jg:asia-southeast1:ai-studio-28e0596b
```

> **Catatan Teknis:**  
> Pada runtime Cloud Run / Applet AI Studio, connection pool PostgreSQL diinisialisasi melalui parameter:
> ```ts
> new Pool({
>   host: process.env.SQL_HOST,
>   user: process.env.SQL_USER,
>   password: process.env.SQL_PASSWORD,
>   database: process.env.SQL_DB_NAME,
>   max: 10,
>   connectionTimeoutMillis: 15000,
> });
> ```

---

## 3. APLIKASI ENVIRONMENT (`NEXT_PUBLIC_APP_ENV`)

* **Nilai Saat Ini (Development):**  
  ```bash
  NEXT_PUBLIC_APP_ENV="development"
  ```
* **Nilai Saat Rilis (Production):**  
  ```bash
  NEXT_PUBLIC_APP_ENV="production"
  ```
* **Node Environment (`NODE_ENV`):** `development`

---

## 4. TEMPLATE CONTOH FILE `.env` LENGKAP

Jika Anda ingin menjalankan aplikasi di lingkungan mandiri (local atau VPS), buat file `.env` dengan format berikut:

```bash
# Environment Mode
NODE_ENV="development"
NEXT_PUBLIC_APP_ENV="development"

# App Hosting URL
APP_URL="https://ais-dev-55lcqw2ai2dd7hglkhz5mh-947129619991.asia-southeast1.run.app"

# Google Cloud SQL (PostgreSQL)
SQL_HOST="/app/cloudsql/dogwood-wharf-b61jg:asia-southeast1:ai-studio-28e0596b"
SQL_USER="ai_studio_app_user"
SQL_PASSWORD=""
SQL_DB_NAME="cloud_sql_development_database"
DATABASE_URL="postgresql://ai_studio_app_user:@/cloud_sql_development_database?host=/app/cloudsql/dogwood-wharf-b61jg:asia-southeast1:ai-studio-28e0596b"

# Firebase Client Credentials
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyAX4kTGJ1y0jyxPeI6RFmZ9xP2qRwYILT0"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="dogwood-wharf-b61jg"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="dogwood-wharf-b61jg.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="dogwood-wharf-b61jg.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_APP_ID="1:949152195997:web:fdee7dc8772e313cd7bb74"
```
