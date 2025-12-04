# Rozet Görselleri Kullanım Rehberi

## 📸 Görsel Gereksinimleri

### Önerilen Boyut
- **800x800px** veya **1000x1000px** (yüksek kalite)
- **Kare format** (1:1 aspect ratio)
- **PNG formatı** (şeffaf arka plan için)
- **Maksimum 5MB**

### Tasarım Önerileri
- ✅ Şeffaf arka plan kullan
- ✅ Merkeze yerleştirilmiş tasarım
- ✅ Kenarlardan en az %10 boşluk bırak (maskable icon için)
- ✅ Yüksek kontrast renkler
- ✅ Detaylar net görünmeli

## 🚀 Nasıl Çalışır?

### 1. Tek Görsel Yükle
Admin panelinden tek bir yüksek kaliteli görsel yükle:
```
Örnek: emektar-bronze.png (1000x1000px)
```

### 2. Otomatik Ölçeklendirme
Cloudinary otomatik olarak farklı boyutlarda gösterir:

| Kullanım Yeri | Boyut | Açıklama |
|---------------|-------|----------|
| **Liste Görünümü** | 64x64px | Rozet listesi, grid |
| **Kart Görünümü** | 128x128px | Rozet kartları |
| **Detay Görünümü** | 256x256px | Modal, detay sayfası |
| **Tam Ekran** | 512x512px | Büyük gösterim |

### 3. Otomatik Optimizasyon
- ✅ Format otomatik seçilir (WebP, PNG, JPG)
- ✅ Kalite otomatik optimize edilir
- ✅ Boyut otomatik ayarlanır
- ✅ Hızlı yükleme garantisi

## 💻 Teknik Detaylar

### Cloudinary Transformation
```typescript
// Örnek URL dönüşümü:
// Orijinal:
https://res.cloudinary.com/xxx/image/upload/v123/badges/emektar-bronze.png

// Küçük boyut (64x64):
https://res.cloudinary.com/xxx/image/upload/w_64,h_64,q_auto,f_auto,c_fill,g_center/v123/badges/emektar-bronze.png

// Orta boyut (128x128):
https://res.cloudinary.com/xxx/image/upload/w_128,h_128,q_auto,f_auto,c_fill,g_center/v123/badges/emektar-bronze.png
```

### Kullanım Yerleri

#### 1. Badges Sayfası (Kullanıcı)
- **Konum:** `/badges`
- **Boyut:** 64x64px (small)
- **Görünüm:** Liste kartları

#### 2. Admin Paneli
- **Konum:** `/admin/badges`
- **Boyut:** 64x64px (small)
- **Görünüm:** Yönetim listesi

#### 3. Profile Sayfası
- **Konum:** `/profile`
- **Boyut:** 64x64px (small)
- **Görünüm:** Aktif rozet gösterimi

## 📋 Adım Adım Yükleme

### 1. Admin Paneline Git
```
http://localhost:3000/admin/badges
```

### 2. Rozet Düzenle
- Düzenlemek istediğin rozete tıkla
- "Düzenle" butonuna tıkla
- Sayfa otomatik yukarı kayar

### 3. Görsel Yükle
- "Görsel Yükle" alanına tıkla
- Rozet görselini seç (PNG, 800x800px)
- Yükleme otomatik başlar
- Cloudinary'ye yüklenir

### 4. Kaydet
- "Güncelle" butonuna tıkla
- Değişiklikler veritabanına kaydedilir

### 5. Kontrol Et
- `/badges` sayfasına git
- Rozet görselinin göründüğünü kontrol et
- Farklı cihazlarda test et

## 🎨 Örnek Görseller

### Bronz Rozet
```
Dosya: emektar-bronze.png
Boyut: 1000x1000px
Format: PNG (şeffaf arka plan)
Renk: Bronz tonları (#CD7F32)
```

### Gümüş Rozet
```
Dosya: emektar-silver.png
Boyut: 1000x1000px
Format: PNG (şeffaf arka plan)
Renk: Gümüş tonları (#C0C0C0)
```

### Altın Rozet
```
Dosya: emektar-gold.png
Boyut: 1000x1000px
Format: PNG (şeffaf arka plan)
Renk: Altın tonları (#FFD700)
```

## ⚡ Performans

### Avantajlar
- ✅ **Hızlı Yükleme:** Cloudinary CDN kullanır
- ✅ **Otomatik Optimizasyon:** Format ve kalite otomatik
- ✅ **Responsive:** Her cihaz için uygun boyut
- ✅ **Cache:** Tarayıcı cache'i kullanır
- ✅ **Bandwidth Tasarrufu:** Sadece gerekli boyut indirilir

### Örnek Boyutlar
```
Orijinal: 1000x1000px = ~500KB
Küçük (64x64): ~5KB
Orta (128x128): ~15KB
Büyük (256x256): ~40KB
```

## 🔧 Sorun Giderme

### Görsel Görünmüyor
1. Cloudinary URL'sini kontrol et
2. Tarayıcı cache'ini temizle (Ctrl+Shift+R)
3. Console'da hata var mı kontrol et (F12)

### Görsel Bulanık
1. Daha yüksek çözünürlükte yükle (min 800x800px)
2. PNG formatı kullan
3. Şeffaf arka plan kullan

### Yükleme Başarısız
1. Dosya boyutunu kontrol et (max 5MB)
2. Format kontrolü (PNG, JPG, WebP)
3. İnternet bağlantısını kontrol et

## 📚 Kaynaklar

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Image Optimization Best Practices](https://web.dev/fast/#optimize-your-images)
- [PWA Icon Guidelines](https://web.dev/maskable-icon/)

---

**Not:** Tek bir yüksek kaliteli görsel yüklemen yeterli! Cloudinary otomatik olarak tüm boyutları oluşturur ve optimize eder. 🎉
