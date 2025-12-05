# Mağaza Yöneticisi Rolü (Store Manager)

## Genel Bakış

Mağaza Yöneticisi rolü, mağaza düzeyinde analitik ve eğitim ihtiyacı verilerine erişim sağlayan yeni bir kullanıcı rolüdür.

## Özellikler

### Erişim Yetkileri

**Mağaza Yöneticisi (store_manager) Erişebilir:**
- ✅ Analitik Dashboard (`/admin/analytics`)
- ✅ Eğitim İhtiyacı Analizi (`/admin/training-needs`)
- ✅ Sadece kendi mağazasının verileri

**Mağaza Yöneticisi Erişemez:**
- ❌ Kullanıcı Yönetimi
- ❌ Soru Yönetimi
- ❌ Kategori Yönetimi
- ❌ Mağaza Yönetimi
- ❌ Rozet Yönetimi
- ❌ Hata Raporları
- ❌ Diğer mağazaların verileri

### Admin vs Store Manager

| Özellik | Admin | Store Manager |
|---------|-------|---------------|
| Tüm mağazaları görebilir | ✅ | ❌ |
| Kendi mağazasını görebilir | ✅ | ✅ |
| Kullanıcı yönetimi | ✅ | ❌ |
| Soru/Kategori yönetimi | ✅ | ❌ |
| Analitik erişimi | ✅ | ✅ |
| Eğitim ihtiyacı erişimi | ✅ | ✅ |

## Teknik Detaylar

### 1. Database Schema

```sql
-- users tablosunda role sütunu
role: 'employee' | 'admin' | 'store_manager'
```

**Migration:**
```bash
# Supabase SQL Editor'de çalıştırın:
database/migrations/add_store_manager_role.sql
```

### 2. Type Definitions

```typescript
// types/database.types.ts
export interface User {
  role: 'employee' | 'admin' | 'store_manager';
  // ...
}
```

### 3. Authentication & Authorization

**Helper Functions:**
```typescript
// lib/utils/session.ts
- getCurrentUserFromSession(): Promise<User | null>
- isAdmin(user): boolean
- isStoreManager(user): boolean
- hasAnalyticsAccess(user): boolean
- getStoreFilterForUser(user): string | undefined
```

**Guards:**
```typescript
// components/organisms/AdminGuard.tsx
// Sadece admin erişebilir

// components/organisms/AnalyticsGuard.tsx
// Admin ve store_manager erişebilir
```

### 4. API Routes

Tüm analytics API route'ları otomatik olarak store filter uygular:

```typescript
// app/api/analytics/*/route.ts
const currentUser = await getCurrentUserFromSession();
const userStoreFilter = getStoreFilterForUser(currentUser);

// Store manager için: storeId = user.store_code
// Admin için: storeId = undefined (tüm mağazalar)
```

### 5. UI Components

**AdminSidebar:**
- Admin: Tüm menü öğelerini görür
- Store Manager: Sadece Analitik ve Eğitim İhtiyacı menülerini görür
- Başlık: "Mağaza Yönetimi - Mağaza {store_code}"

## Kullanım

### Mağaza Yöneticisi Oluşturma

1. **Admin Panel'den:**
   ```
   Admin > Kullanıcılar > Yeni Kullanıcı
   - Rol: "Mağaza Yöneticisi" seçin
   - Mağaza kodu: İlgili mağazayı seçin
   ```

2. **Veritabanından:**
   ```sql
   UPDATE users 
   SET role = 'store_manager' 
   WHERE id = 'user-id';
   ```

### Giriş Yapma

Mağaza yöneticisi normal kullanıcı gibi giriş yapar:
```
/login
- Kullanıcı adı
- Şifre
```

Giriş yaptıktan sonra otomatik olarak:
- Analitik sayfasına yönlendirilir
- Sadece kendi mağazasının verilerini görür
- Sidebar'da sadece yetkili sayfalar görünür

## Test Senaryoları

### 1. Store Manager Erişim Testi

```typescript
// Store manager olarak giriş yap
// Beklenen: Analitik ve Eğitim İhtiyacı sayfalarına erişebilir
// Beklenen: Sadece kendi mağazasının verileri görünür
// Beklenen: Diğer admin sayfalarına erişemez
```

### 2. Veri Filtreleme Testi

```typescript
// Store manager (mağaza 101) olarak giriş yap
// Analitik sayfasını aç
// Beklenen: Sadece mağaza 101'in verileri görünür
// Beklenen: Diğer mağazaların verileri görünmez
```

### 3. Yetki Testi

```typescript
// Store manager olarak giriş yap
// /admin/users URL'ine git
// Beklenen: Dashboard'a yönlendirilir (403 Forbidden)
```

## Güvenlik

### API Level Security

Tüm analytics API route'ları:
1. Session kontrolü yapar
2. Role kontrolü yapar (admin veya store_manager)
3. Store filter uygular (store_manager için)

```typescript
// Örnek API route
const currentUser = await getCurrentUserFromSession();

if (!currentUser || !hasAnalyticsAccess(currentUser)) {
  return NextResponse.json(
    { error: { code: 'UNAUTHORIZED', message: 'Erişim yetkiniz yok' } },
    { status: 403 }
  );
}

const userStoreFilter = getStoreFilterForUser(currentUser);
// Store manager için otomatik olarak kendi mağazası filtrelenir
```

### Client Level Security

- `AnalyticsGuard`: Sayfa erişimini kontrol eder
- `AdminSidebar`: Menü öğelerini role göre filtreler
- URL değişikliği ile bypass edilemez (API level security)

## Bakım ve Güncelleme

### Yeni Analytics Sayfası Eklerken

1. API route'a authorization ekle:
```typescript
import { getCurrentUserFromSession, getStoreFilterForUser, hasAnalyticsAccess } from '@/lib/utils/session';

const currentUser = await getCurrentUserFromSession();
if (!currentUser || !hasAnalyticsAccess(currentUser)) {
  return 403;
}

const userStoreFilter = getStoreFilterForUser(currentUser);
```

2. Sayfada `AnalyticsGuard` kullan:
```typescript
<AnalyticsGuard>
  <AdminSidebar />
  {/* Sayfa içeriği */}
</AnalyticsGuard>
```

3. Sidebar'a menü öğesi ekle:
```typescript
{ 
  href: '/admin/new-page', 
  label: 'Yeni Sayfa', 
  icon: '📊', 
  roles: ['admin', 'store_manager'] 
}
```

## Sorun Giderme

### Store Manager Giriş Yapamıyor

1. Veritabanında role kontrolü:
```sql
SELECT id, username, role, store_code FROM users WHERE username = 'username';
```

2. Role'ün doğru olduğundan emin olun: `store_manager`

### Store Manager Yanlış Verileri Görüyor

1. Session kontrolü:
```typescript
// Browser console
localStorage.getItem('current-user')
```

2. API response kontrolü:
```typescript
// Network tab'de API response'u kontrol et
// storeId parametresi doğru mu?
```

### Store Manager Admin Sayfalarına Erişebiliyor

1. Guard kontrolü:
```typescript
// Sayfa AdminGuard yerine AnalyticsGuard kullanmalı
<AnalyticsGuard> // ✅ Doğru
<AdminGuard>     // ❌ Yanlış
```

2. API route authorization kontrolü:
```typescript
// API route hasAnalyticsAccess kullanmalı
if (!hasAnalyticsAccess(currentUser)) // ✅ Doğru
if (!isAdmin(currentUser))            // ❌ Yanlış
```

## Gelecek Geliştirmeler

- [ ] Store manager'ın kendi mağazasındaki kullanıcıları görebilmesi
- [ ] Store manager'ın mağaza hedeflerini görebilmesi
- [ ] Store manager'ın mağaza raporlarını export edebilmesi
- [ ] Store manager'ın mağaza performans karşılaştırması yapabilmesi
- [ ] Email bildirimleri (haftalık/aylık raporlar)
