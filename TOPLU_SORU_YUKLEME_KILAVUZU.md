# Toplu Soru Yükleme Kılavuzu

## 📋 Genel Bakış

Mavi Fit Game'de toplu soru yüklemek için CSV dosyası kullanabilirsiniz. Bu sistem, çok sayıda soruyu tek seferde sisteme eklemenizi sağlar.

## 🚀 Adım Adım Kullanım

### 1. Admin Paneline Giriş

1. Tarayıcıda `http://localhost:3000/admin/questions` adresine gidin
2. Admin hesabınızla giriş yapın

### 2. Toplu Yükleme Modalını Açın

1. Sağ üstteki **"Toplu Yükle"** butonuna tıklayın
2. Modal penceresi açılacak

### 3. CSV Şablonunu İndirin

1. Modal içindeki **"Örnek Şablon İndir"** butonuna tıklayın
2. `template.csv` dosyası indirilecek
3. Bu dosyayı Excel veya Google Sheets ile açın

### 4. CSV Dosyasını Hazırlayın

CSV dosyanız şu sütunları içermelidir:

| Sütun Adı | Zorunlu | Açıklama | Örnek |
|-----------|---------|----------|-------|
| `name` | ✅ Evet | Soru/ürün adı | "Marcus Fit" |
| `image_url` | ✅ Evet | Ürün görseli URL'si | "https://res.cloudinary.com/..." |
| `description` | ✅ Evet | Kısa açıklama | "Slim fit denim pantolon" |
| `explanation` | ❌ Hayır | Detaylı açıklama | "Dar kesim, modern görünüm" |
| `tags` | ❌ Hayır | Etiketler (noktalı virgülle ayrılmış) | "Slim;Denim" |
| `gender` | ✅ Evet | Cinsiyet | "Kadın" veya "Erkek" |
| `fit_category` | ✅ Evet | Fit kategorisi | "SLIM", "STRAIGHT", "MOM" |

**Örnek CSV İçeriği:**
```csv
name,image_url,description,explanation,tags,gender,fit_category
Marcus Fit,https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/marcus-fit.jpg,Slim fit denim pantolon,Dar kesim modern görünüm,Slim,Denim,Erkek,SLIM
Carrot Fit,https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/carrot-fit.jpg,Havuç kesim pantolon,Üstten bol alttan dar,Carrot,Denim,Erkek,CARROT
Serenay,https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/serenay.jpg,Yüksek bel süper skinny,Çok dar kesim,Super Skinny,Yüksek Bel,Kadın,SUPER SKINNY
```

**ÖNEMLİ NOT:**
- Sistem otomatik olarak `image_url`'den `images` array'i oluşturur
- Sadece `image_url` yazmanız yeterlidir
- Çoklu görsel desteği için admin panelden manuel düzenleme yapabilirsiniz

### 5. Görselleri Hazırlayın

#### Seçenek A: Cloudinary'ye Manuel Yükleme

1. [Cloudinary Dashboard](https://cloudinary.com/console) adresine gidin
2. **Media Library** > **Upload** tıklayın
3. Görselleri sürükle-bırak ile yükleyin
4. Her görselin URL'sini kopyalayın
5. CSV dosyasındaki `image_url` sütununa yapıştırın

#### Seçenek B: Toplu Görsel Yükleme (Önerilen)

1. Tüm görselleri bir klasöre koyun
2. Cloudinary CLI kullanarak toplu yükleyin:

```bash
# Cloudinary CLI kurulumu
npm install -g cloudinary-cli

# Giriş yapın
cld config

# Toplu yükleme
cld uploader upload_dir ./images --folder mavi-fit-game/questions
```

3. Yüklenen görsellerin URL'lerini alın
4. CSV dosyasına ekleyin

#### Seçenek C: URL'leri Otomatik Oluşturma

Eğer görseller zaten Cloudinary'de belirli bir pattern ile yüklüyse:

```csv
name,image_url,description,explanation,tags
Marcus Fit,https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/mavi-fit-game/marcus-fit.jpg,Slim fit denim pantolon,Dar kesim,Slim,Erkek,Denim
```

### 6. CSV Dosyasını Yükleyin

1. Modal'da kategori seçin (örn: "Pantolon Fit")
2. **"CSV Dosyası"** alanından hazırladığınız dosyayı seçin
3. **"Yükle"** butonuna tıklayın

### 7. Sonuçları Kontrol Edin

Yükleme tamamlandığında şu bilgileri göreceksiniz:

- ✅ **Toplam:** Kaç satır işlendi
- ✅ **Başarılı:** Kaç soru eklendi
- ❌ **Hatalı:** Kaç satırda hata oluştu
- 📝 **Hata Detayları:** Hangi satırlarda ne hatalar var

## 🖼️ Görsel Yönetimi

### Cloudinary Optimizasyonu

Cloudinary otomatik olarak görselleri optimize eder:

- **Format:** WebP, AVIF gibi modern formatlar
- **Boyut:** Cihaza göre otomatik boyutlandırma
- **Kalite:** Otomatik kalite ayarı
- **Lazy Loading:** Geç yükleme desteği

### Görsel URL Formatı

```
https://res.cloudinary.com/YOUR_CLOUD/image/upload/
  c_fill,w_800,h_600,q_auto,f_auto/
  v1/mavi-fit-game/questions/
  marcus-fit.jpg
```

**Parametreler:**
- `c_fill`: Kırpma modu (fill, fit, scale)
- `w_800`: Genişlik
- `h_600`: Yükseklik
- `q_auto`: Otomatik kalite
- `f_auto`: Otomatik format

### Toplu Görsel İşleme

Cloudinary'de toplu işlem için:

1. **Media Library** > Görselleri seçin
2. **Bulk Actions** > **Transform**
3. İstediğiniz dönüşümleri uygulayın
4. **Apply** tıklayın

## 📝 İpuçları

### CSV Hazırlama

1. **Excel'de Hazırlayın:** Daha kolay düzenleme
2. **UTF-8 Encoding:** Türkçe karakterler için
3. **Virgül Kullanımı:** Etiketlerde virgül kullanın
4. **URL Kontrolü:** Tüm URL'lerin çalıştığından emin olun

### Görsel Optimizasyonu

1. **Boyut:** 800x600px ideal
2. **Format:** JPG veya PNG
3. **Dosya Boyutu:** Max 500KB
4. **İsimlendirme:** `product-name.jpg` formatında

### Hata Önleme

1. **Önce Test Edin:** 5-10 satırlık küçük bir dosya ile test edin
2. **URL Kontrolü:** Tüm görsellerin yüklendiğinden emin olun
3. **Kategori Seçimi:** Doğru kategoriyi seçtiğinizden emin olun
4. **Zorunlu Alanlar:** name, image_url, description dolu olmalı

## 🔧 Sorun Giderme

### "Resim URL'si geçersiz" Hatası

- URL'nin `https://` ile başladığından emin olun
- URL'de boşluk olmadığından emin olun
- Görselin gerçekten erişilebilir olduğunu test edin

### "Soru adı boş olamaz" Hatası

- CSV'de boş satır olmadığından emin olun
- Her satırda `name` sütununun dolu olduğunu kontrol edin

### Görseller Yüklenmiyor

1. Cloudinary hesabınızın aktif olduğunu kontrol edin
2. Upload preset'in doğru yapılandırıldığını kontrol edin
3. Dosya boyutunun limitin altında olduğunu kontrol edin

## 📊 Örnek Senaryo

### 50 Pantolon Fit Sorusu Ekleme

1. **Görselleri Hazırlayın:**
   - 50 adet ürün fotoğrafı
   - İsimlendirme: `pantolon-01.jpg`, `pantolon-02.jpg`, ...

2. **Cloudinary'ye Yükleyin:**
   ```bash
   cld uploader upload_dir ./pantolon-gorselleri --folder mavi-fit-game/pantolon
   ```

3. **CSV Oluşturun:**
   - Excel'de 50 satırlık tablo
   - Her satır bir ürün
   - URL'leri Cloudinary'den kopyalayın

4. **Yükleyin:**
   - Admin panelde "Toplu Yükle"
   - "Pantolon Fit" kategorisi seçin
   - CSV'yi yükleyin

5. **Kontrol Edin:**
   - Başarılı: 50/50
   - Sorular listesinde görünüyor mu?

## 🎯 Sonraki Adımlar

Toplu yükleme tamamlandıktan sonra:

1. **Soruları Kontrol Edin:** Admin panelde listeyi gözden geçirin
2. **Test Edin:** Oyunu oynayarak soruların doğru göründüğünden emin olun
3. **Düzenleyin:** Gerekirse tek tek düzenleme yapın
4. **Aktif Edin:** Tüm soruların aktif olduğundan emin olun

## 📞 Destek

Sorun yaşarsanız:
- Hata mesajlarını kaydedin
- CSV dosyasını kontrol edin
- Cloudinary loglarını inceleyin
