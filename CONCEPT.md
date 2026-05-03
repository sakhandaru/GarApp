# Garapp — Product Concept v2.0
> "TickTick terlalu penuh. Things 3 terlalu simpel. Garapp adalah titik tengah yang sat set, indah, dan paham Bahasa Indonesia."

---

## 1. Filosofi Utama

| Prinsip | Artinya dalam praktek |
|---|---|
| **Sat Set** | Dari pikiran ke tercatat dalam < 3 detik |
| **Zero Friction** | Tidak ada wajib-isi. Semua field opsional kecuali judul |
| **Opinionated** | Garapp punya pendapat tentang workflow yang baik, bukan sekedar kanvas kosong |
| **Desktop-First** | Dioptimalkan untuk layar lebar. Mobile adalah v2 |
| **Paham Indonesia** | NLP, bahasa UI, dan konteks budaya kerja Indonesia |

---

## 2. Positioning vs Kompetitor

```
Simpel ←————————————————→ Kompleks
         Things 3   Garapp   TickTick   Notion
         (terlalu    (sweet    (terlalu   (bukan
          simpel)    spot)     padat)     ini)
```

**Keunggulan nyata Garapp yang tidak dimiliki kompetitor:**
1. **NLP Bahasa Indonesia terbaik** — "Rapat besok jam 10 pagi" ter-parse sempurna
2. **Desain paling premium** — Liquid Glass, animasi micro, dark mode
3. **Habit + Contribution Graph sebagai fitur utama** — bukan fitur tersembunyi
4. **Focus Mode sebagai first-class citizen** — bukan add-on

---

## 3. Struktur Navigasi (Desktop Sidebar)

```
┌─────────────────────┐
│  G  Garapp          │
├─────────────────────┤
│  + Tambah Tugas     │  ← Quick Add trigger
├─────────────────────┤
│ 🏠 Beranda          │
│ 🎯 Focus Mode       │
│ 📅 Kalender         │
├── SMART LISTS ──────┤
│ 📥 Inbox            │  ← Task tanpa proyek
│ ☀️  Hari Ini        │
│ 🌅 Besok            │
│ 📆 7 Hari Ke Depan  │
├── PROYEK ───────────┤
│ ▸ Pekerjaan         │
│ ▸ Personal          │
│ ▸ Side Project      │
│ + Proyek Baru       │
├── FITUR ────────────┤
│ 🔄 Habit            │
└─────────────────────┘
```

**Hierarki data:**
```
Inbox (uncategorized)
└── Task

Proyek
└── Task
    └── Subtask (checklist inline)
```

---

## 4. Halaman & Fitur

### 4.1 Beranda (`/`)
Halaman pembuka saat aplikasi pertama kali dibuka.

**Konten:**
- Greeting dinamis berdasarkan waktu (Selamat pagi / siang / sore / malam)
- Ringkasan hari: "Anda memiliki X tugas, Y habit hari ini"
- Daftar **Tugas Hari Ini** — bisa langsung dicentang
- Shortcut menuju Focus Mode

**Filosofi:** Tidak ada chart statistik, tidak ada gamifikasi. Bersih dan fokus.

---

### 4.2 Focus Mode (`/focus`)
Halaman paling minimalis di Garapp. Dibuka saat memulai kerja.

**Konten:**
- Hanya menampilkan task hari ini
- Tanpa sidebar, tanpa distraksi
- Shortcut `F` dari mana saja untuk masuk/keluar

---

### 4.3 Manajemen Tugas (`/tugas`)
Halaman inti. Memiliki dua view yang bisa di-toggle.

#### View 1: List View (Default)

```
┌──────────────────────────────────────────────────┐
│  [Hari Ini] [Besok] [7 Hari] [Semua]       [🔍] │
├──────────────────────────────────────────────────┤
│  ○  Rapat sinkronisasi tim       10:00     🔴 H  │
│  ○  Review PR Ahmad                        🟡 M  │
│  ✓  Beli kopi (selesai)                    ⚪ L  │
│                                                  │
│  + Tambah tugas untuk hari ini...                │
└──────────────────────────────────────────────────┘
```

- Filter bar: **Hari Ini / Besok / 7 Hari / Semua**
- Setiap baris: `checkbox · judul · waktu (opsional) · prioritas`
- Klik task → expand **inline** (tidak pindah halaman) untuk detail & subtask
- Hover → tombol hapus & edit muncul

#### View 2: Kalender — Week View

```
        Sen    Sel    Rab    Kam    Jum    Sab    Min
08:00   │                    Rapat │                │
09:00   │                          │                │
10:00   │      Deploy               │                │
All Day │ Review PR                │ Laporan Bulan  │
```

- Tampilkan 1 minggu (Senin–Minggu)
- Task **dengan waktu** → diposisikan di slot jam yang tepat
- Task **tanpa waktu** → tampil sebagai "All Day" di baris atas
- **Drag & Drop** untuk pindah tanggal/waktu → sync otomatis ke Supabase

> **Catatan Implementasi:**
> - Mulai dari Week View saja. Month View & Day View adalah v2.
> - Library: `react-big-calendar` dengan custom styling Liquid Glass.

---

### 4.4 Habit Tracker (`/habit`)

**Konsep inti:**
- Habit adalah entitas terpisah dari Task
- Setiap hari, user mencentang habit yang dilakukan
- Setiap habit punya **Contribution Graph sendiri** (ala GitHub profile)

**Tampilan per Habit:**
```
Olahraga Pagi                          🔥 12 hari streak
████░███████░░█████░██░░████████████   ← Graph 1 tahun
                              [Tandai Selesai Hari Ini]
```

**Data yang diisi user saat membuat habit:**
- Nama (wajib)
- Deskripsi (opsional)
- Frekuensi: Harian / Mingguan (pilih hari)
- Warna label (untuk identifikasi visual)

---

## 5. Spesifikasi Task

### 5.1 Semua Properti Task

| Field | Default | Wajib? | Catatan |
|---|---|---|---|
| Judul | — | ✅ Ya | |
| Tanggal Jatuh Tempo | Hari ini | ❌ | |
| Waktu | — | ❌ | Jika kosong = All Day |
| Prioritas | Low | ❌ | `low` / `medium` / `high` |
| Proyek | Inbox | ❌ | Null = Inbox |
| Tag | — | ❌ | Bisa lebih dari satu |
| Recurring | — | ❌ | Lihat 5.2 |
| Subtask | — | ❌ | Checklist inline |
| Catatan | — | ❌ | Plain text |

### 5.2 Recurring Task
Berbeda dari Habit — ini task biasa yang berulang secara otomatis.

**Pilihan frekuensi:**
- Setiap hari
- Setiap [Senin / Selasa / ... / Minggu]
- Setiap minggu (Senin secara default)
- Setiap bulan

Ketika recurring task diselesaikan → **instance baru otomatis dibuat** untuk periode berikutnya.

### 5.3 Subtask Inline
- Klik task di list → panel expand muncul **di bawah baris task tersebut**
- Di dalam panel: daftar subtask dengan checkbox masing-masing
- Tambah subtask: tombol `+` atau tekan `Enter` setelah subtask terakhir
- Progress subtask tampil di baris utama: `2/5 ✓`

---

## 6. Quick Add — Fitur Terpenting

> **Filosofi:** Dari pikiran ke tercatat dalam < 3 detik.
> Tidak boleh ada langkah yang terasa seperti membuang waktu.

### Cara Akses
| Cara | Aksi |
|---|---|
| Klik `+ Tambah Tugas` di sidebar | Buka modal |
| Tekan `/` atau `N` dari mana saja | Buka modal |
| Baris inline di bawah list | Langsung ketik tanpa modal |
| Klik tanggal di kalender | Buka Quick Add dengan tanggal sudah terisi |

### Antarmuka Modal

```
┌─────────────────────────────────────────────────────────┐
│  Rapat besok jam 10 pagi                                │
│                                                         │
│  ✨ 📅 Besok, 04 Mei  ·  ⏰ 10:00  ←  NLP Preview       │
│                                                         │
│  [📥 Inbox ▾]  [📅 Besok ▾]  [⚪ Low ▾]  [⏰ Waktu]    │
│                                                  [↵ Simpan] │
└─────────────────────────────────────────────────────────┘
```

- Chip di bawah = hasil parse, bisa diklik untuk diubah manual
- NLP berjalan **real-time** saat user mengetik
- `Enter` → simpan & tutup
- `Esc` → tutup tanpa simpan
- `Shift+Enter` → simpan & langsung buka Quick Add baru (untuk input berantai)

### NLP Bahasa Indonesia

| Input User | Yang Diparsing |
|---|---|
| `Rapat besok jam 10` | Tanggal: besok, Waktu: 10:00 |
| `Beli kopi hari ini` | Tanggal: hari ini |
| `Review laporan Jumat` | Tanggal: Jumat depan |
| `Hubungi klien minggu depan` | Tanggal: Senin minggu depan |
| `Lusa jam 3 sore` | Tanggal: lusa, Waktu: 15:00 |
| `!tinggi Deploy server` | Prioritas: High |
| `!medium Review PR` | Prioritas: Medium |
| `#pekerjaan Buat presentasi` | Proyek: Pekerjaan |

**Implementasi teknis:**
- Base: `chrono-node`
- Custom layer untuk BI: "besok", "lusa", "minggu depan", nama hari, "pagi/siang/sore/malam"
- Shorthand prioritas: `!t` = tinggi, `!m` = medium, `!r` = rendah
- Shorthand proyek: `#namaproyek` → match ke proyek yang ada

---

## 7. Skema Database (Supabase v2)

### `tasks`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
judul           text NOT NULL
catatan         text
prioritas       text DEFAULT 'low'         -- 'low' | 'medium' | 'high'
tanggal         date DEFAULT CURRENT_DATE
waktu           time                        -- null = all-day
proyek_id       uuid REFERENCES projects(id) ON DELETE SET NULL  -- null = Inbox
is_selesai      boolean DEFAULT false
is_recurring    boolean DEFAULT false
recurring_type  text                        -- 'daily'|'weekly'|'monthly'
recurring_days  int[]                       -- [1,3,5] = Sen,Rab,Jum
parent_task_id  uuid REFERENCES tasks(id) ON DELETE CASCADE  -- null = bukan subtask
dibuat_pada     timestamptz DEFAULT now()
selesai_pada    timestamptz
```

### `projects`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
nama        text NOT NULL
warna       text DEFAULT '#007AFF'
urutan      int DEFAULT 0
dibuat_pada timestamptz DEFAULT now()
```

### `tags`
```sql
id    uuid PRIMARY KEY DEFAULT gen_random_uuid()
nama  text NOT NULL UNIQUE
warna text DEFAULT '#888888'
```

### `task_tags` (junction)
```sql
task_id uuid REFERENCES tasks(id) ON DELETE CASCADE
tag_id  uuid REFERENCES tags(id) ON DELETE CASCADE
PRIMARY KEY (task_id, tag_id)
```

### `habits`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
nama            text NOT NULL
deskripsi       text
warna           text DEFAULT '#FF6B00'
frekuensi       text DEFAULT 'harian'       -- 'harian' | 'mingguan'
hari_mingguan   int[]                        -- [1,3,5] jika mingguan
dibuat_pada     timestamptz DEFAULT now()
```

### `habit_logs`
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
habit_id     uuid REFERENCES habits(id) ON DELETE CASCADE
tanggal      date NOT NULL
dicatat_pada timestamptz DEFAULT now()
UNIQUE (habit_id, tanggal)  -- 1 log per habit per hari
```

---

## 8. Roadmap Implementasi

### ✅ Fase 1 — Fondasi (Selesai)
- [x] Setup Next.js 16 + Tailwind v4 + Framer Motion
- [x] AppContext + useReducer state management
- [x] Layout desktop (Sidebar + Main area)
- [x] Koneksi Supabase + basic task CRUD
- [x] Mobile Nav (capsule)

### 🔨 Fase 2 — Core Task Engine (Berikutnya)
- [ ] Reset & migrasi skema database ke v2
- [ ] Hierarki Proyek/Inbox di sidebar (dengan warna)
- [ ] Smart Filters: Hari Ini / Besok / 7 Hari / Semua
- [ ] **Quick Add + NLP Bahasa Indonesia**
- [ ] Subtask inline (expand in-place)
- [ ] Priority visual (warna dot di list)
- [ ] Tag: buat, attach ke task, filter
- [ ] Recurring Task logic

### 📅 Fase 3 — Calendar & Focus
- [ ] Week View (`react-big-calendar`) dengan Liquid Glass styling
- [ ] Drag & Drop task antar hari/jam → sync Supabase
- [ ] Focus Mode (`/focus`) — fullscreen, no sidebar

### 🔄 Fase 4 — Habit Tracker
- [ ] CRUD Habit (buat, edit, hapus)
- [ ] Daily check-in (centang hari ini)
- [ ] Contribution Graph per habit (52 minggu)
- [ ] Streak counter

### 🚀 Fase 5 — Polish & v2
- [ ] Mobile responsive
- [ ] Kanban view (opsional)
- [ ] Notifikasi / browser reminder
- [ ] Export data (CSV / JSON)
- [ ] Auth (Supabase Auth)

---

## 9. Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR, routing, optimization |
| Styling | Tailwind CSS v4 | Utility-first, cepat iterate |
| Animasi | Framer Motion | Smooth, physics-based |
| Icons | Lucide React | Konsisten, ringan |
| Database | Supabase (PostgreSQL) | Real-time, gratis, scalable |
| NLP | chrono-node + custom BI | Parse tanggal bahasa natural |
| Calendar | react-big-calendar | Mature, D&D support |
| State | React useReducer + Context | Tidak over-engineer |
| Utils | clsx + tailwind-merge | Class merging tanpa konflik |

---

*Living document — update setiap ada keputusan desain atau arsitektur baru.*
*Versi: 2.0 · Terakhir diperbarui: Mei 2026*
