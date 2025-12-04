# Uygulamayı Yükle Kartı

## 📱 Özellikler

Dashboard'a eklenen "Uygulamayı Yükle" kartı hem Android hem iOS cihazlarda çalışır.

### Android (Chrome/Edge)
- Karta tıklandığında otomatik olarak PWA kurulum prompt'u gösterilir
- Kullanıcı "Yükle" butonuna tıklayarak uygulamayı ana ekrana ekler
- Uygulama native app gibi çalışır

### iOS (Safari)
- Karta tıklandığında kurulum talimatları gösterilir:
  1. Safari'de sayfayı aç
  2. Paylaş butonuna (⬆️) tıkla
  3. "Ana Ekrana Ekle" seçeneğini seç

## 🎨 Tasarım

- **Konum**: Dashboard > Kategoriler bölümü > Kurallar kartından sonra
- **Renk**: Purple-Pink gradient (mor-pembe geçişli)
- **Icon**: Download (indirme) ikonu
- **Boyut**: Diğer kartlarla aynı (aspect-square)

## 🔧 Davranış

### Görünürlük
Kart şu durumlarda **gösterilmez**:
- Uygulama zaten yüklüyse (standalone modda çalışıyorsa)
- Kullanıcı kartı kapatmışsa (X butonuna tıklamışsa)

### Kapatma
- Sağ üst köşedeki X butonuna tıklanarak kapatılabilir
- Kapatıldığında `localStorage`'a kaydedilir
- Bir daha gösterilmez

### Kurulum Sonrası
- Uygulama yüklendikten sonra kart otomatik olarak gizlenir
- Standalone modda açıldığında kart görünmez

## 📂 Dosyalar

### Yeni Dosyalar
- `components/molecules/InstallAppCard.tsx` - Kart bileşeni

### Güncellenen Dosyalar
- `app/(game)/dashboard/page.tsx` - Kart eklendi
- `components/PWAInstallPrompt.tsx` - Dashboard'da gösterilmemesi için güncellendi

## 🚀 Kullanım

Kart otomatik olarak dashboard'da görünür. Kullanıcı:

1. **Android'de:**
   - Karta tıklar
   - Kurulum prompt'u açılır
   - "Yükle" butonuna tıklar
   - Uygulama ana ekrana eklenir

2. **iOS'ta:**
   - Karta tıklar
   - Talimatları okur
   - Safari'de paylaş butonunu kullanır
   - "Ana Ekrana Ekle" seçer

## 💡 Teknik Detaylar

### Event Handling
```typescript
// Android/Chrome için
window.addEventListener('beforeinstallprompt', handler);

// iOS için
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
```

### State Management
```typescript
- deferredPrompt: PWA kurulum event'i
- isInstalled: Uygulama yüklü mü?
- isVisible: Kart görünür mü?
```

### LocalStorage
```typescript
'install-card-dismissed': Kullanıcı kartı kapattı mı?
```

## 🎯 Avantajlar

1. **Kullanıcı Dostu**: Dashboard'da kolayca erişilebilir
2. **Platform Agnostic**: Hem Android hem iOS destekler
3. **Akıllı**: Gereksiz durumlarda gösterilmez
4. **Kapatılabilir**: Kullanıcı istemezse kapatabilir
5. **Persistent**: Bir kez kapatıldığında tekrar gösterilmez

## 🔄 Diğer PWA Özellikleri ile İlişki

- **PWAInstallPrompt**: Dashboard dışındaki sayfalarda 30 saniye sonra gösterilir
- **InstallAppCard**: Sadece dashboard'da gösterilir
- İkisi birbirini tamamlar, çakışmaz

## ✅ Test Checklist

- [ ] Android Chrome'da kart görünüyor
- [ ] Karta tıklandığında kurulum prompt'u açılıyor
- [ ] Kurulum sonrası kart gizleniyor
- [ ] iOS Safari'de kart görünüyor
- [ ] iOS'ta talimatlar gösteriliyor
- [ ] X butonuna tıklandığında kart kapanıyor
- [ ] Kapatılan kart tekrar gösterilmiyor
- [ ] Standalone modda kart görünmüyor

---

**Not:** Icon görselleri güncellendiğinde otomatik olarak kart icon'u da güncellenir (manifest.json'dan alınır).
