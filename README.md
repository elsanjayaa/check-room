# 🏨 Hotel Room Check

Sistem pengecekan kamar hotel berbasis web — realtime, multi-user, dan bisa cetak laporan harian.

---

## Fitur

- **Input pengecekan kamar** — door lock (before/after/durasi), expired baterai, channel TV rusak, catatan
- **Data realtime** — tersimpan di Firebase Firestore, langsung sync ke semua perangkat
- **Merge otomatis** — beberapa staff bisa input kamar yang sama di hari yang sama, data digabung otomatis
- **Riwayat per hari** — data hari berbeda disimpan terpisah
- **Filter per lantai** — lihat data lantai tertentu di halaman database
- **Print & simpan PDF** — filter per tanggal & lantai, output tabel A4 siap cetak
- **Edit & hapus** — data bisa diubah atau dihapus kapan saja

---

## Teknologi

| Teknologi | Kegunaan |
|-----------|----------|
| React + Vite | Frontend framework |
| Firebase Firestore | Database realtime (cloud) |
| html2pdf.js | Export PDF |

---

## Cara Menjalankan

### 1. Prasyarat

Pastikan sudah terinstall:
- [Node.js](https://nodejs.org) (versi LTS)

### 2. Clone / buat project

```bash
npm create vite@latest hotel-check -- --template react
cd hotel-check
npm install
npm install firebase
```

### 3. Tambahkan file konfigurasi Firebase

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

> Ganti nilai di atas dengan konfigurasi dari Firebase Console kamu.

### 4. Salin kode utama

Salin isi `App.jsx` ke `src/App.jsx`.

### 5. Jalankan

```bash
npm run dev
```

Buka browser di `http://localhost:5173`

---

## Struktur Firestore

Koleksi: `pengecekan`

Setiap dokumen mewakili **satu kamar pada satu hari**, dengan ID format:

```
YYYY-MM-DD_ltX_NomorKamar
contoh: 2026-06-05_lt3_301
```

Field yang disimpan:

```
tanggal        string    "2026-06-05"
lantai         number    3
kamar          string    "301"
doorBefore     string    "08:00:00"
doorAfter      string    "08:45:30"
expiredBulan   string    "06"
expiredTahun   string    "2026"
catatanDoor    string    "Battery lowbat"
channelRusak   array     ["Metro TV", "Trans7"]
catatan        string    "AC perlu dicek"
createdAt      string    ISO timestamp
updatedAt      string    ISO timestamp
```

---

## Cara Pakai

### Input data
1. Buka tab **📋 Input**
2. Pilih lantai dan isi nomor kamar
3. Isi bagian yang perlu dicek (boleh tidak semua diisi)
4. Klik **Simpan ke Database**
5. Kalau kamar yang sama sudah diinput hari ini, data akan **digabung otomatis**

### Lihat database
1. Buka tab **🗄️ Database**
2. Gunakan filter lantai untuk mempersempit tampilan
3. Klik **Edit** untuk ubah data, **Hapus** untuk menghapus

### Cetak laporan
1. Buka tab **🖨️ Print**
2. Pilih tanggal (ada shortcut "Hari Ini" dan "Kemarin")
3. Pilih lantai yang ingin dicetak
4. Klik **Preview & Print**
5. Klik **⬇ Simpan PDF** untuk download, atau **🖨️ Print** untuk cetak langsung

---

## Batas Gratis Firebase

Paket gratis Firebase (Spark Plan) sudah lebih dari cukup untuk penggunaan hotel:

| Operasi | Batas/hari |
|---------|-----------|
| Baca | 50.000 kali |
| Tulis | 20.000 kali |
| Hapus | 20.000 kali |
| Storage | 1 GB total |

---

## Lantai

Sistem dikonfigurasi untuk **lantai 1–17**. Untuk mengubahnya, edit baris berikut di `App.jsx`:

```js
const FLOORS = Array.from({length:17}, (_,i) => i+1);
//                               ^^
//                         ganti angka ini
```