<div align="center">

<img src="assets/images/ourin.jpg" alt="Ourin-AI Banner" width="200" style="border-radius: 50%"/>

# 🤖 Kepo-Botz — WhatsApp Bot

> Bot WhatsApp multifungsi berbasis **Baileys** dengan arsitektur plugin modular, sistem database persisten, penjadwalan otomatis, dan ratusan fitur siap pakai.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Baileys-25D366?style=flat-square&logo=whatsapp)](https://github.com/WhiskeySockets/Baileys)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)]()

---

**Developer:** Lucky Archz (Zann) &nbsp;|&nbsp; **Lead Owner:** HyuuSATAN &nbsp;|&nbsp; **Owner:** Keisya, Syura Salsabila &nbsp;|&nbsp; **Designer:** Danzzz

</div>

---

## 📋 Daftar Isi

- [Tentang Bot](#-tentang-bot)
- [Fitur Utama](#-fitur-utama)
- [Kategori Command](#-kategori-command)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Bot](#-menjalankan-bot)
- [Struktur Folder](#-struktur-folder)
- [Sistem Plugin](#-sistem-plugin)
- [Mode Bot](#-mode-bot)
- [Manajemen Grup](#-manajemen-grup)
- [Sistem Keamanan](#-sistem-keamanan)
- [FAQ](#-faq)
- [Credits](#-credits)

---

## 🧠 Tentang Bot

**Ourin-AI** adalah bot WhatsApp bertenaga [Baileys](https://github.com/WhiskeySockets/Baileys) yang dirancang untuk menjadi asisten serbaguna di dalam grup maupun chat pribadi. Bot ini mendukung sistem plugin modular sehingga mudah dikembangkan, dengan fitur mulai dari download media, AI chat, game interaktif, manajemen grup, hingga jadwal otomatis.

### Keunggulan

- ✅ **Modular** — Ratusan fitur dikelola via sistem plugin terpisah
- ✅ **Hot Reload** — Plugin dapat di-reload tanpa restart bot (Dev Mode)
- ✅ **Multi-mode** — Mendukung mode `self`, `public`, `store`, `pushkontak`, dll
- ✅ **Database Persisten** — Data user, grup, dan setting tersimpan otomatis
- ✅ **Anti-Crash** — Dilengkapi handler untuk `uncaughtException` dan `unhandledRejection`
- ✅ **Scheduler** — Pesan terjadwal, cek sholat otomatis, sahur reminder, dan lainnya
- ✅ **Jadibot** — Fitur bot turunan dari nomor lain
- ✅ **Rate Limiter** — Perlindungan bawaan terhadap spam command

---

## ⚡ Fitur Utama

### 🔗 Koneksi & Sesi
| Fitur | Keterangan |
|-------|-----------|
| QR Code Login | Scan QR dari terminal |
| Pairing Code | Login via kode pairing tanpa scan |
| Auto Reconnect | Reconnect otomatis saat putus |
| Session Backup | Backup sesi secara berkala |
| Anti-Session Conflict | Penanganan konflik sesi (kode 440) |

### 🛡️ Keamanan & Proteksi
| Fitur | Keterangan |
|-------|-----------|
| Anti-Spam | Rate limiter global (10 pesan / 5 detik) |
| Anti-Link | Menghapus link yang tidak diizinkan di grup |
| Anti-Tag SW | Menghapus pesan tag status WhatsApp |
| Anti-Bot | Deteksi dan kick bot lain dari grup |
| Anti-Toxic | Filter kata-kata kasar otomatis |
| Anti-Remove | Deteksi pesan yang dihapus |
| Anti-Hidetag | Blokir hidetag di grup |
| Anti-Document | Blokir kiriman dokumen di grup |
| Anti-Sticker | Blokir kiriman stiker di grup |
| Anti-Media | Blokir kiriman media di grup |
| Banned User | Blacklist user dari menggunakan bot |
| Slowmode | Batasi frekuensi pengiriman pesan di grup |

### 🤖 Kecerdasan Buatan
| Fitur | Keterangan |
|-------|-----------|
| Auto AI | Balas pesan otomatis dengan AI |
| Voice Note Command | Konversi voice note ke teks → jalankan command (via Groq Whisper) |
| Smart Triggers | Custom autoreply berdasarkan kata kunci |
| Mention Response | Balas otomatis saat bot di-mention |

### 📅 Penjadwalan Otomatis
| Fitur | Keterangan |
|-------|-----------|
| Scheduled Messages | Kirim pesan terjadwal ke grup/user |
| Jadwal Sholat | Notifikasi waktu sholat otomatis |
| Auto Sahur | Reminder sahur otomatis |
| Auto JPM | Jadwal pesan massal otomatis |
| Sewa Checker | Cek masa aktif sewa grup otomatis |
| Giveaway Checker | Monitor giveaway grup |

### 🎮 Game & Hiburan
| Game | Deskripsi |
|------|-----------|
| Asah Otak | Pertanyaan trivia |
| Tebak Kata | Tebak kata tersembunyi |
| Tebak Gambar | Tebak dari gambar |
| Siapakah Aku | Teka-teki tokoh |
| Teka-Teki | Teka-teki tradisional |
| Susun Kata | Acak huruf |
| Cak Lontong | Pertanyaan kocak |
| Family 100 | Survey says! |
| Tebak Bendera | Tebak bendera negara |
| Tebak Kalimat | Lengkapi kalimat |
| Tebak Lirik | Lanjutkan lirik lagu |
| Tebak Kimia | Soal kimia |
| Tebak Drakor | Judul drama Korea |
| Tebak JKT48 | Member JKT48 |
| Tebak Makanan | Tebak nama makanan |
| Quiz Battle | PvP kuis |
| Tic Tac Toe | Game TTT 1v1 |
| Suit PvP | Suit antar pemain |
| Ular Tangga | Board game klasik |
| Sulap | Game sulap interaktif |

---

## 📂 Kategori Command

Bot memiliki sistem kategori untuk mengelompokkan command:

| Kategori | Emoji | Deskripsi |
|----------|-------|-----------|
| `main` | 🏠 | Menu, info bot, help |
| `owner` | 👑 | Command khusus owner |
| `utility` | 🔧 | Tools utilitas umum |
| `tools` | 🛠️ | Alat bantu tambahan |
| `fun` | 🎮 | Hiburan & konten lucu |
| `game` | 🎯 | Game interaktif |
| `download` | 📥 | Download media (YT, TikTok, dll) |
| `search` | 🔍 | Pencarian informasi |
| `sticker` | 🖼️ | Buat & kelola stiker |
| `media` | 🎬 | Proses media (gambar, video) |
| `ai` | 🤖 | Fitur kecerdasan buatan |
| `group` | 👥 | Manajemen grup |
| `religi` | ☪️ | Konten islami & jadwal sholat |
| `info` | ℹ️ | Informasi umum |
| `cek` | 🔎 | Pengecekan data |
| `economy` | 💰 | Sistem ekonomi virtual |
| `user` | 📊 | Profil & statistik user |
| `canvas` | 🎨 | Generasi gambar & canvas |
| `random` | 🎲 | Konten acak |
| `premium` | 💎 | Fitur eksklusif premium |
| `ephoto` | 📸 | Edit foto |
| `jpm` | 📨 | Jadwal pesan massal |
| `pushkontak` | 📲 | Kirim kontak massal |
| `panel` | 🖥️ | Panel kontrol CPanel |
| `store` | 🏪 | Sistem toko virtual |

> Lihat semua command dengan: `.menu` atau `.menucat <kategori>`

---

## 💻 Persyaratan Sistem

| Komponen | Versi Minimum |
|----------|---------------|
| Node.js | `v18.0.0` atau lebih baru |
| npm | `v8.0.0` atau lebih baru |
| RAM | 512 MB (disarankan 1 GB+) |
| OS | Linux / Windows / macOS |
| FFmpeg | Terbaru (untuk voice note & media) |

---

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/USERNAME/ourin-ai.git
cd ourin-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Bot

Salin file konfigurasi contoh dan sesuaikan:

```bash
cp config.example.js config.js
```

Edit `config.js` sesuai kebutuhan (lihat bagian [Konfigurasi](#-konfigurasi)).

### 4. Buat Folder yang Dibutuhkan

```bash
mkdir -p storage/session database tmp assets/images assets/video
```

### 5. Jalankan Bot

```bash
node index.js
```

---

## ⚙️ Konfigurasi

Berikut contoh pengaturan utama di `config.js`:

```js
module.exports = {
  bot: {
    name: "Ourin-AI",        // Nama bot
    version: "1.0.0",        // Versi bot
    developer: "Lucky Archz",
    support: "https://wa.me/62XXXXXXXXXX",
    owner: {
      name: "Owner",
      number: "62XXXXXXXXXX" // Nomor owner (tanpa +)
    }
  },

  mode: "public",            // "public" | "self"

  command: {
    prefix: "."              // Prefix command default
  },

  session: {
    folderName: "session",
    usePairingCode: false,   // true = pakai kode pairing, false = QR Code
    pairingNumber: "",       // Isi nomor jika usePairingCode: true
    printQRInTerminal: true,
    maxReconnectAttempts: 10,
    reconnectInterval: 5000
  },

  database: {
    path: "./database/main"
  },

  features: {
    antiSpam: true,
    autoRead: false,
    autoTyping: true,
    antiCall: true,
    logMessage: true,
    smartTriggers: false
  },

  APIkey: {
    groq: "YOUR_GROQ_API_KEY"  // Untuk fitur Voice Note Command
  },

  dev: {
    enabled: false,
    watchPlugins: true,
    watchSrc: false,
    debugLog: false
  }
};
```

---

## ▶️ Menjalankan Bot

### Mode Normal
```bash
node index.js
```

### Mode Development (Hot Reload Plugin)
```bash
# Aktifkan dev.enabled: true di config.js, lalu:
node index.js
```

### Dengan PM2 (Recommended untuk Production)
```bash
npm install -g pm2
pm2 start index.js --name ourin-ai
pm2 save
pm2 startup
```

### Login via QR Code
Setelah bot berjalan, QR Code akan muncul di terminal. Scan menggunakan WhatsApp:
> **WhatsApp → Setelan → Perangkat Tertaut → Tautkan Perangkat**

### Login via Pairing Code
Set `usePairingCode: true` dan isi `pairingNumber` di config, lalu jalankan bot. Kode 8 digit akan tampil di terminal.

---

## 📁 Struktur Folder

```
ourin-ai/
├── index.js              # Entry point utama
├── config.js             # Konfigurasi bot
├── src/
│   ├── connection.js     # Manajemen koneksi WhatsApp
│   ├── handler.js        # Handler pesan, grup, update
│   └── lib/
│       ├── plugins.js        # Loader & manager plugin
│       ├── database.js       # Database handler
│       ├── serialize.js      # Serialisasi pesan
│       ├── scheduler.js      # Sistem penjadwalan
│       ├── colors.js         # Logger & tampilan terminal
│       ├── formatter.js      # Format teks & uptime
│       ├── groupProtection.js # Proteksi grup
│       ├── gameData.js       # State game
│       ├── jadibotManager.js # Manager bot turunan
│       ├── sholatScheduler.js
│       ├── autojpmScheduler.js
│       ├── backup.js
│       └── ...
├── plugins/
│   ├── main/             # Plugin utama (menu, help, dll)
│   ├── owner/            # Command owner
│   ├── group/            # Manajemen grup
│   ├── download/         # Downloader media
│   ├── search/           # Pencarian
│   ├── ai/               # AI & chatbot
│   ├── game/             # Game interaktif
│   ├── fun/              # Hiburan
│   ├── sticker/          # Stiker
│   ├── media/            # Media editor
│   ├── religi/           # Konten islami
│   ├── user/             # Profil user
│   ├── store/            # Toko virtual
│   └── ...
├── case/
│   └── ourin.js          # Case handler khusus
├── database/             # Data tersimpan (auto-generated)
├── storage/
│   ├── session/          # File sesi WhatsApp
│   └── baileys_store.json
├── assets/
│   ├── images/           # Gambar bot
│   └── video/            # Video bot
└── tmp/                  # File sementara
```

---

## 🔌 Sistem Plugin

Setiap plugin adalah file `.js` dalam folder `plugins/`. Struktur plugin:

```js
const pluginConfig = {
  name: 'namacommand',         // Nama command utama
  alias: ['alias1', 'alias2'], // Alias command
  category: 'tools',           // Kategori menu
  description: 'Deskripsi command',
  usage: '.namacommand <arg>',
  example: '.namacommand hello',
  isOwner: false,              // Hanya owner?
  isPremium: false,            // Hanya premium?
  isGroup: false,              // Hanya di grup?
  isPrivate: false,            // Hanya di chat pribadi?
  isAdmin: false,              // Hanya admin grup?
  isBotAdmin: false,           // Bot harus jadi admin?
  cooldown: 5,                 // Cooldown dalam detik
  energi: 0,                   // Energi yang dibutuhkan
  isEnabled: true              // Plugin aktif?
};

async function handler(m, { sock, config, db, uptime }) {
  await m.reply("Hello World!");
}

module.exports = { config: pluginConfig, handler };
```

### Objek `m` (Serialized Message)
| Property | Tipe | Keterangan |
|----------|------|-----------|
| `m.body` | `string` | Teks pesan |
| `m.command` | `string` | Command yang digunakan |
| `m.args` | `string[]` | Argumen command |
| `m.sender` | `string` | JID pengirim |
| `m.chat` | `string` | JID chat |
| `m.pushName` | `string` | Nama pengirim |
| `m.isGroup` | `bool` | Apakah di grup |
| `m.isOwner` | `bool` | Apakah owner |
| `m.isPremium` | `bool` | Apakah premium |
| `m.isAdmin` | `bool` | Apakah admin grup |
| `m.isBotAdmin` | `bool` | Apakah bot admin |
| `m.quoted` | `Object` | Pesan yang di-reply |
| `m.reply(text)` | `Function` | Balas pesan |
| `m.download()` | `Function` | Download media |

---

## 🔄 Mode Bot

Bot mendukung beberapa mode operasi:

| Mode | Keterangan |
|------|-----------|
| `public` | Semua user bisa pakai bot |
| `self` | Hanya owner yang bisa pakai bot |

### Mode Grup (BotMode)
Setiap grup dapat dikonfigurasi dengan mode berbeda via `.botmode <mode>`:

| BotMode | Keterangan |
|---------|-----------|
| `md` | Multi Device — semua fitur aktif |
| `store` | Mode toko — hanya fitur toko |
| `pushkontak` | Mode kirim kontak massal |
| `cpanel` | Mode panel kontrol |
| `otp` | Mode OTP |

---

## 👥 Manajemen Grup

### Welcome & Goodbye
Bot otomatis mengirim pesan selamat datang dan selamat tinggal saat member bergabung/keluar.

### Notifikasi Promote & Demote
Saat admin dipromote atau di-demote, bot mengirim notifikasi otomatis ke grup.

### Notifikasi Buka/Tutup Grup
Bot mendeteksi perubahan pengaturan grup (open/close) dan memberi tahu anggota.

### Proteksi Grup
Semua proteksi dapat diaktifkan/nonaktifkan oleh admin dengan command grup yang tersedia.

---

## 🔐 Sistem Keamanan

### Level Akses User
```
Owner > Partner > Premium > User Biasa
```

### Fitur Cooldown
Setiap command memiliki cooldown individual. User non-premium/non-owner terkena cooldown.

### Rate Limiter Global
- **10 pesan** dalam **5 detik** per user
- Jika terdeteksi spam, user mendapat penundaan 3 detik untuk command berikutnya

### Exec Owner (Terminal)
Owner dapat menjalankan kode JavaScript langsung via chat:
```
>> require('os').platform()
```

Owner juga dapat menjalankan perintah terminal via:
```
$ ls -la
```

---

## ❓ FAQ

**Q: Bot tidak merespons setelah login?**
> Pastikan sesi tersimpan dengan benar di `storage/session/`. Coba restart bot.

**Q: Bagaimana cara menambah plugin baru?**
> Buat file `.js` baru di folder `plugins/<kategori>/` dengan struktur plugin yang benar. Bot akan memuat otomatis saat restart (atau langsung jika Dev Mode aktif).

**Q: Voice Note Command tidak bekerja?**
> Pastikan `APIkey.groq` sudah diisi di `config.js` dan FFmpeg terinstal di sistem.

**Q: Bot keluar dari WhatsApp sendiri?**
> Kemungkinan sesi expired atau konflik. Hapus folder `storage/session/` dan login ulang.

**Q: Bagaimana cara mengaktifkan mode developer?**
> Set `dev.enabled: true` dan `dev.watchPlugins: true` di `config.js`. Plugin akan hot-reload otomatis saat ada perubahan file.

---

## 📜 Credits

```
Developer    : Lucky Archz ( Zann )
Lead Owner   : HyuuSATAN
Owner        : Keisya
Owner        : Syura Salsabila
Designer     : Danzzz
Library      : Baileys (Penyedia Baileys)
API          : Penyedia API
Scraper      : Penyedia Scraper
```

> ⚠️ **JANGAN HAPUS/GANTI CREDITS & THANKS TO**
> ⚠️ **JANGAN DIJUAL**

---

<div align="center">

Made with ❤️ by **Lucky Archz (Zann)** & Team

*© 2026 Ourin-AI — All Rights Reserved*

</div>
