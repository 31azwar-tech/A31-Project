# A31-PM — PWA (terhubung otomatis ke database A31-PM)

Aplikasi ini adalah **A31 Board** (basis kode) yang sudah **dipindahkan ke database A31-PM (Firestore)**.
Config Firebase sudah tertanam di dalam `index.html`, jadi **begitu di-deploy, aplikasi langsung
terhubung ke database A31-PM tanpa setup manual apa pun.**

---

## Isi folder

| File | Fungsi |
|---|---|
| `index.html` | Seluruh aplikasi (HTML + CSS + JS + config Firebase) |
| `sw.js` | Service worker — offline + notifikasi |
| `manifest.json` | Manifest PWA (nama, ikon, shortcut) |
| `favicon.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | Ikon aplikasi |
| `netlify.toml` | Konfigurasi Netlify (dipakai hanya kalau deploy ke Netlify) |
| `firestore.rules` | Security rules Firestore |
| `.nojekyll` | Wajib untuk GitHub Pages (mematikan Jekyll) |
| `README.md` | Deskripsi repo |

---

## Cara deploy ke GitHub Pages (GRATIS, tanpa token)

Aplikasi ini **100% statis dan semua path-nya relatif**, jadi berjalan normal
di sub-folder GitHub Pages (`username.github.io/a31-pm/`). Sudah diuji.

### Langkah 1 — Buat repo & upload
1. Buka https://github.com/new
2. Nama repo: **`a31-pm`** → pilih **Public** → **Create repository**.
   > Repo *Private* juga bisa pakai Pages, tapi hanya untuk akun berbayar.
   > Kalau akun gratis, pilih **Public**.
3. Di halaman repo baru, klik **uploading an existing file**.
4. Seret **seluruh isi folder ini** (file-filenya, bukan foldernya) ke jendela upload.

   ⚠️ **Penting:** file `.nojekyll` diawali titik sehingga sering **tersembunyi**
   di file manager. Aktifkan "tampilkan file tersembunyi" dulu:
   - **Windows:** Explorer → tab *View* → centang *Hidden items*
   - **Mac:** tekan `Cmd + Shift + .` di Finder

   Kalau `.nojekyll` tetap tidak terbawa, lihat *Langkah 1b* di bawah.
5. Klik **Commit changes**.

### Langkah 1b — Kalau `.nojekyll` gagal ter-upload
Di halaman repo: **Add file** → **Create new file** → ketik nama `.nojekyll`
→ biarkan isinya kosong → **Commit changes**.

### Langkah 2 — Aktifkan Pages
1. Repo → **Settings** → menu kiri **Pages**.
2. **Source**: pilih **Deploy from a branch**.
3. **Branch**: `main` — **Folder**: `/ (root)` → **Save**.
4. Tunggu 1–2 menit. URL akan muncul di halaman itu, bentuknya:
   **`https://USERNAME.github.io/a31-pm/`**

### Langkah 3 — Daftarkan domain di Firebase (WAJIB)
Tanpa ini, login akan gagal dengan error `auth/unauthorized-domain`.

Firebase Console → project **a31-pm** → **Authentication** → **Settings**
→ **Authorized domains** → **Add domain** → masukkan:

```
USERNAME.github.io
```

> Isi **hanya domainnya** (`USERNAME.github.io`), **tanpa** `https://` dan
> **tanpa** `/a31-pm` di belakangnya.

Selesai — aplikasi langsung tersambung ke database A31-PM.

### Cara update aplikasi nanti
Repo → klik file yang mau diganti → ikon pensil (✏️) → paste isi baru → Commit.
Atau **Add file → Upload files** untuk menimpa beberapa file sekaligus.
Pages otomatis re-deploy dalam ~1 menit.

> **Catatan cache:** karena ini PWA, versi lama bisa masih tersimpan di perangkat.
> Kalau perubahan belum terlihat, tutup semua tab aplikasi lalu buka lagi, atau
> hard-refresh (`Ctrl + Shift + R`). File `sw.js` sudah memakai strategi
> *network-first* untuk halaman, jadi biasanya update langsung masuk.

---

## Alternatif lain yang juga gratis & tanpa token

| Layanan | Cara |
|---|---|
| **Cloudflare Pages** | Connect ke repo GitHub yang sama, build command dikosongkan, output directory `/` |
| **Vercel** | Import repo GitHub, framework preset **Other**, tanpa build command |
| **Firebase Hosting** | Sudah satu project dengan `a31-pm`: `npm i -g firebase-tools` → `firebase login` → `firebase init hosting` → `firebase deploy` |

Semua tetap perlu **Langkah 3** (daftarkan domainnya di Authorized domains).

> `netlify.toml` boleh dibiarkan di repo — layanan lain akan mengabaikannya.

---

## Kalau nanti token Netlify sudah pulih

Deploy ke Netlify tetap didukung — file `netlify.toml` sudah disiapkan:
1. Buka https://app.netlify.com/drop dan seret isi folder ini, **atau**
2. Netlify → site Anda → **Deploys** → seret isi folder ke area drag-and-drop.

Tidak ada build step. `netlify.toml` mengatur agar `sw.js`, `manifest.json`, dan
`index.html` tidak di-cache lama supaya update langsung sampai ke perangkat.

---

## Checklist Firebase Console

Aplikasi memakai project **a31-pm** yang sudah ada.

### 1. Login Email/Password — ✅ SUDAH ENABLE
Sudah dikonfirmasi aktif. Tidak perlu tindakan.

### 2. Firestore Rules — ✅ SUDAH BENAR
Rules yang terpasang sudah persis sesuai kebutuhan:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /boards/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Pastikan sudah ditekan **Publish** (bukan hanya tersimpan di editor).

### 3. Authorized domains — ⬅️ INI YANG MASIH PERLU
Karena pindah dari Netlify ke GitHub Pages, domainnya berubah.

Authentication → **Settings** → **Authorized domains** → **Add domain**:

```
USERNAME.github.io
```

Ganti `USERNAME` dengan username GitHub Anda. Isi **hanya domainnya** —
tanpa `https://` dan tanpa `/a31-pm`.

Domain `a31-pm.netlify.app` boleh tetap dibiarkan di daftar; tidak mengganggu.

---

## Data lama A31-PM aman

Aplikasi membaca dokumen yang **sama persis** dengan A31-PM lama: `boards/{uid}`.
Login pakai akun A31-PM yang sudah ada → board lama langsung muncul.

Karena skema A31 Board berbeda, aplikasi punya **konverter otomatis**:

| Data lama A31-PM | Menjadi |
|---|---|
| `task.folder` | `task.folderId` |
| `task.prio` (1/2/3) | `task.priority` (`high`/`medium`/`low`) |
| `task.imp` | tetap disimpan (dipakai Eisenhower Matrix) |
| Folder datar | Grup **New Life 3.0** + folder lama jadi subfolder |
| `buckets` (kolom kanban) | dipetakan ke status `todo` / `doing` / `done` |
| `subtasks` | dipertahankan |

Konversi berjalan **otomatis sekali** saat login pertama, lalu dokumen ditulis ulang
dengan penanda `schema: "a31board"` supaya tidak dikonversi berulang.

> **Saran:** sebelum login pertama kali, backup dokumen `boards/{uid}` dari Firebase
> Console (Firestore → boards → dokumen Anda → titik tiga → Export/copy JSON).
> Ini hanya jaga-jaga; konversi sudah diuji dan tidak menghapus data.

---

## Install sebagai aplikasi (PWA)

- **Android / Chrome:** buka situs → menu ⋮ → *Install app* / *Add to Home screen*.
  Bisa juga lewat tombol **⬇ Install App** di pojok kanan bawah.
- **iPhone / Safari:** tombol Share → *Add to Home Screen*.
- **Desktop Chrome/Edge:** ikon install di address bar.

Setelah di-install: bekerja offline, punya shortcut (Add Task / Today / Next 7 Days),
dan bisa mengirim notifikasi deadline.

---

## Fitur (sesuai kolom "Pilihanku")

| Fitur | Status |
|---|---|
| Light/Dark Mode | ✅ toggle, tersimpan di perangkat |
| Subfolder (2 level) | ✅ grup → subfolder |
| Activity Log + Undo | ✅ |
| Task input pintar + tombol Save/Cancel | ✅ parser bahasa Indonesia (`!high`, `#tag`, tanggal) |
| PWA (offline, install, notifikasi) | ✅ |
| Recurrence / Reminder / Snooze | ✅ |
| Views: Kanban, Calendar, Timeline, Eisenhower, Dashboard, Activity | ✅ |
| Bottom tab bar (mobile) | ✅ |
| Advanced filter (tag + priority + rentang tanggal) | ✅ |
| Database | ✅ **Firestore project `a31-pm`** |

---

## Kalau status tertulis "Local only ⚠"

Artinya data tersimpan di perangkat tapi belum sampai server. Klik tulisan statusnya
untuk melihat pesan error aslinya. Penyebab paling umum:

1. **Rules belum di-publish** → error `permission-denied`. Publish `firestore.rules`.
2. **Domain belum di-authorize** → tambahkan domain di Authentication → Settings.
3. **Benar-benar offline** → status akan berubah "Offline"; data tersinkron sendiri saat online.

## Error saat login

| Pesan | Artinya | Solusi |
|---|---|---|
| `auth/unauthorized-domain` | Domain GitHub Pages belum didaftarkan | Tambahkan `USERNAME.github.io` di Authentication → Settings → Authorized domains |
| "Email atau password salah" | Kredensial tidak cocok | Gunakan akun A31-PM lama, atau klik "Lupa password?" |
| "Metode Email/Password belum diaktifkan" | Sign-in method mati | Sudah enable — kalau muncul, cek ulang di Authentication → Sign-in method |
| Halaman putih / aset tidak muncul | Jekyll memproses file | Pastikan file `.nojekyll` ada di root repo |
