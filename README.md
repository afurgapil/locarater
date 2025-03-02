# Locarater - Mekan Değerlendirme Platformu

## 🎯 Proje Amacı

Locarater, kullanıcıların çeşitli mekanları keşfedebileceği, değerlendirebileceği ve yorum yapabileceği bir platform. Mekan sahipleri işletmelerini ekleyebilir ve yönetebilir.

## 🏗 Teknik Altyapı

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- React Query (API State Management)
- Formik & Yup (Form Management)
- Leaflet (Harita)

### Backend

- Node.js & Express
- MongoDB
- JWT Authentication
- Cloudinary (Resim Yükleme)

## 👥 Kullanıcı Rolleri

### 1. Ziyaretçi

- Mekanları görüntüleme
- Arama yapma
- Filtreleme
- Mekan detaylarını inceleme

### 2. Kayıtlı Kullanıcı

- Profil oluşturma ve düzenleme
- Mekanları değerlendirme ve yorum yapma
- Mekanları favorilere ekleme
- Değerlendirmeleri beğenme

### 3. Mekan Sahibi

- Mekan ekleme ve yönetme
- Yorumlara yanıt verme
- Mekan bilgilerini güncelleme
- Mekan istatistiklerini görüntüleme

### 4. Admin

- Tüm içeriği yönetme
- Kullanıcıları yönetme
- Raporları inceleme
- Site ayarlarını yapılandırma

## 📱 Özellikler

### Mekan Yönetimi

- Mekan ekleme/düzenleme/silme
- Kategori sistemi
- Konum seçimi (harita)
- Fotoğraf yükleme
- Çalışma saatleri
- İletişim bilgileri

### Değerlendirme Sistemi

- Yıldız puanlama
- Yorum yazma
- Fotoğraf ekleme
- Beğeni sistemi
- Yanıt verme

### Arama ve Filtreleme

- Metin bazlı arama
- Kategori filtresi
- Konum bazlı filtreleme
- Puan filtresi
- Sıralama seçenekleri

### Kullanıcı Profili

- Profil düzenleme
- Değerlendirme geçmişi
- Favori mekanlar
- Bildirim tercihleri

### Dashboard

- Mekan istatistikleri
- Değerlendirme yönetimi
- Profil ayarları
- Bildirimler

## 📁 Proje Yapısı

apps/
├── web/ # Frontend (Next.js)
│ ├── src/
│ │ ├── app/ # Pages
│ │ ├── components/ # UI Components
│ │ ├── hooks/ # Custom Hooks
│ │ ├── services/ # API Services
│ │ ├── store/ # State Management
│ │ ├── types/ # TypeScript Types
│ │ └── utils/ # Helper Functions
│
└── api/ # Backend (Express)
├── src/
│ ├── controllers/ # Route Controllers
│ ├── models/ # Database Models
│ ├── routes/ # API Routes
│ ├── services/ # Business Logic
│ └── utils/ # Helper Functions

## 🚀 Geliştirme Aşamaları

### 1. Temel Altyapı

- [x] Proje kurulumu
- [x] Backend API
- [x] Frontend yapısı
- [ ] Auth sistemi

### 2. Mekan Sistemi

- [ ] Mekan CRUD işlemleri
- [ ] Harita entegrasyonu
- [ ] Fotoğraf yükleme
- [ ] Arama ve filtreleme

### 3. Değerlendirme Sistemi

- [ ] Yorum ve puanlama
- [ ] Beğeni sistemi
- [ ] Yanıt sistemi
- [ ] Raporlama

### 4. Kullanıcı Sistemi

- [ ] Profil yönetimi
- [ ] Favoriler
- [ ] Bildirimler
- [ ] Ayarlar

### 5. Dashboard ve Admin

- [ ] Mekan yönetimi
- [ ] İstatistikler
- [ ] Kullanıcı yönetimi
- [ ] Site ayarları
