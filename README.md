# Hotel Room Maintenance System

Sistem manajemen pengecekan kamar hotel berbasis web — realtime, multi-user, dengan laporan harian yang dapat dicetak.

---

## Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Instalasi](#instalasi)
- [Struktur Database](#struktur-database)
- [Panduan Penggunaan](#panduan-penggunaan)
- [Keamanan & Akses](#keamanan--akses)
- [Konfigurasi Lantai & Kamar](#konfigurasi-lantai--kamar)
- [Batas Gratis Firebase](#batas-gratis-firebase)

---

## Fitur

| Fitur | Keterangan |
|-------|------------|
| Input pengecekan | Door lock (before/after/durasi otomatis), expired baterai (multi-entry), status lowbat, channel TV rusak, kerusakan pintu, catatan umum |
| Realtime sync | Data tersimpan di Firebase Firestore dan langsung tersinkronisasi ke semua perangkat |
| Merge otomatis | Beberapa staff dapat menginput kamar yang sama di hari yang sama — data digabung otomatis tanpa duplikasi |
| Filter database | Filter data berdasarkan tanggal (hari ini / kemarin / custom) dan lantai |
| Tab Status | Ringkasan terakhir kali setiap lantai dicek, lengkap dengan indikator warna |
| Print & PDF | Cetak laporan per tanggal dan lantai dalam format tabel A4 — tiap lantai otomatis pisah halaman |
| Akses PIN | Halaman login dengan keypad PIN sebelum dapat mengakses sistem |
| Auto-hapus data | Data lebih dari 2 bulan dihapus otomatis saat app dibuka |
| Edit & hapus | Data dapat diubah atau dihapus kapan saja |

---

## Teknologi

| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| React | 18+ | Frontend framework |
| Vite | 5+ | Build tool & dev server |
| Firebase Firestore | 10+ | Database realtime (cloud) |
| html2pdf.js | 0.10 | Export laporan ke PDF |

---

## Instalasi

### Prasyaratan

- [Node.js](https://nodejs.org) versi LTS (18 atau lebih baru)
- Akun [Firebase](https://firebase.google.com) (Spark Plan / gratis sudah cukup)

### Langkah

**1. Buat project baru**

```bash
npm create vite@latest hotel-check -- --template react
cd hotel-check
npm install
npm install firebase
```

**2. Buat project Firebase**

1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. Klik **Add project** → ikuti langkah setup
3. Di sidebar, buka **Firestore Database** → **Create database** → pilih mode **Production**
4. Di **Project Settings** → **Your apps** → klik ikon Web (`</>`) → daftarkan app → salin `firebaseConfig`

**3. Buat file konfigurasi Firebase**

Buat file `src/firebase.js`:

```js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

**4. Salin kode utama**

Salin isi `App.jsx` ke `src/App.jsx`.

**5. Jalankan**

```bash
npm run dev
```

Buka browser di `http://localhost:5173`

---

## Struktur Database

**Koleksi:** `pengecekan`

Setiap dokumen merepresentasikan **satu kamar pada satu hari**, dengan format ID:

```
{YYYY-MM-DD}_lt{lantai}_{nomorKamar}
Contoh: 2026-06-10_lt3_301
```

**Field dokumen:**

```
tanggal        string    "2026-06-10"
lantai         number    3
kamar          string    "301"
doorBefore     string    "08:00:00"
doorAfter      string    "08:45:30"
bateraiList    array     [{ bulan: "06", tahun: "2027" }]
batreLowbat    boolean   true
catatanDoor    string    "Handle longgar"
channelRusak   array     ["Metro TV", "Trans7"]
catatan        string    "AC perlu dicek"
expireAt       timestamp Otomatis dihapus setelah 2 bulan
createdAt      string    ISO timestamp
updatedAt      string    ISO timestamp
```

---

## Panduan Penggunaan

### Input Data

1. Buka tab **Input**
2. Pilih lantai — nomor kamar akan muncul sesuai lantai yang dipilih
3. Isi bagian yang perlu dicek (semua field boleh dikosongkan kecuali lantai & kamar)
4. Klik **Simpan ke Database**

> Jika kamar yang sama sudah diinput hari ini, data baru akan **digabung otomatis** dengan data yang ada.

### Lihat Database

1. Buka tab **Database**
2. Pilih tanggal menggunakan tombol **Hari Ini**, **Kemarin**, atau date picker
3. Filter lantai untuk mempersempit tampilan
4. Klik **Edit** untuk mengubah data, **Hapus** untuk menghapus

### Cek Status Lantai

1. Buka tab **Status**
2. Tampil ringkasan semua lantai — kapan terakhir dicek dan berapa kamar yang sudah diinput hari ini
3. Indikator warna: 🟢 hari ini · 🟡 kemarin · 🔴 lebih dari kemarin · ⚫ belum pernah

### Cetak Laporan

1. Buka tab **Print**
2. Pilih tanggal dan lantai
3. Klik **Preview & Print**
4. Pilih **Simpan PDF** untuk download atau **Print** untuk cetak langsung
5. Setiap lantai otomatis berada di halaman terpisah

---

## Keamanan & Akses

Sistem dilindungi dengan **PIN keypad** di halaman depan. Hanya pengguna yang mengetahui PIN yang dapat mengakses dan menginput data.

**Mengubah PIN** — edit baris berikut di `App.jsx`:

```js
const VALID_PINS = ["1234", "5678"];  // tambah atau ubah PIN di sini
```

Beberapa PIN dapat didaftarkan sekaligus (misalnya beda shift). Sesi login bertahan **8 jam** secara default, setelah itu pengguna perlu login kembali.

**Mengubah durasi sesi:**

```js
const SESSION_HOURS = 8;  // ganti angka sesuai kebutuhan
```

> Untuk keamanan lebih lanjut, pertimbangkan mengaktifkan **Firebase Security Rules** di Firestore Console agar database tidak dapat diakses langsung dari luar aplikasi.

---

## Konfigurasi Lantai & Kamar

Daftar lantai dan kamar dikonfigurasi di bagian atas `App.jsx`:

```js
const FLOORS = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 16, 17];

const ROOMS = {
  1: ["101", "102", "103", ...],
  2: ["201", "202", ...],
  // dst.
};
```

Tambah, hapus, atau ubah nomor kamar langsung di objek `ROOMS`.

---

## Batas Gratis Firebase

Paket Spark (gratis) sudah lebih dari cukup untuk penggunaan operasional hotel:

| Operasi | Batas per Hari | Estimasi Penggunaan |
|---------|---------------|---------------------|
| Baca | 50.000 | ~500 kamar × 10 baca = 5.000/hari |
| Tulis | 20.000 | ~500 kamar × 2 tulis = 1.000/hari |
| Hapus | 20.000 | Sangat jarang |
| Storage | 1 GB total | Data 2 bulan ≈ beberapa MB |

Data lama dihapus otomatis setiap 2 bulan sehingga storage tetap terjaga.