# PWA Icons

Bu klasöre aşağıdaki icon dosyalarını eklemeniz gerekiyor:

## Gerekli Icon Boyutları

1. **icon-192x192.png** (192x192 piksel)
   - Android için standart icon
   - Purpose: any maskable

2. **icon-512x512.png** (512x512 piksel)
   - Android splash screen için
   - Purpose: any maskable

3. **apple-touch-icon.png** (180x180 piksel) - Opsiyonel
   - iOS cihazlar için
   - Ana ekrana ekleme ikonu

4. **favicon.ico** (32x32 piksel) - Opsiyonel
   - Browser tab ikonu

## Icon Oluşturma

Verdiğiniz "Mavi Fit Game" coin görselini kullanarak bu boyutlarda icon'lar oluşturabilirsiniz:

### Yöntem 1: Online Generator (Önerilen)
1. https://www.pwabuilder.com/imageGenerator adresine gidin
2. Coin görselini yükleyin
3. "Generate" butonuna tıklayın
4. Tüm boyutları indirin ve bu klasöre koyun

### Yöntem 2: Photoshop/GIMP
1. Coin görselini açın
2. Her boyut için yeni bir dosya oluşturun
3. Görseli merkeze yerleştirin
4. PNG olarak kaydedin

### Yöntem 3: ImageMagick (Command Line)
```bash
# 192x192
convert coin.png -resize 192x192 -background transparent -gravity center -extent 192x192 icon-192x192.png

# 512x512
convert coin.png -resize 512x512 -background transparent -gravity center -extent 512x512 icon-512x512.png

# 180x180 (Apple)
convert coin.png -resize 180x180 -background transparent -gravity center -extent 180x180 apple-touch-icon.png
```

## Önemli Notlar

- Icon'lar **PNG formatında** olmalı
- **Şeffaf arka plan** kullanın
- Coin görseli **merkezde** olmalı
- **Maskable** icon'lar için görselin kenarlardan 10% içeride olmasına dikkat edin
- iOS için **köşeler yuvarlatılmış** olmalı (sistem otomatik yapar)

## Kontrol Listesi

- [ ] icon-192x192.png eklendi
- [ ] icon-512x512.png eklendi
- [ ] apple-touch-icon.png eklendi (opsiyonel)
- [ ] favicon.ico eklendi (opsiyonel)
- [ ] Tüm icon'lar şeffaf arka plana sahip
- [ ] Coin görseli merkezde ve net görünüyor
