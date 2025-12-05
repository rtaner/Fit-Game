# AI Eğitim Önerileri Kurulumu

## Özellik

Eğitim İhtiyacı Analizi sayfasında, Google Gemini AI kullanarak analiz verilerini yorumlayan ve somut eğitim önerileri sunan bir özellik.

## Kurulum

### 1. Gemini API Key Alma

1. [Google AI Studio](https://makersuite.google.com/app/apikey) adresine gidin
2. Google hesabınızla giriş yapın
3. "Create API Key" butonuna tıklayın
4. API key'inizi kopyalayın

### 2. Environment Variable Ekleme

`.env.local` dosyanıza şu satırı ekleyin:

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Paket Kurulumu

```bash
npm install @google/generative-ai
```

## Kullanım

1. Admin veya Mağaza Yöneticisi olarak giriş yapın
2. "Eğitim İhtiyacı Analizi" sayfasına gidin
3. İstediğiniz filtreleri uygulayın (personel, zaman aralığı)
4. "AI ile Analiz Et" butonuna tıklayın
5. AI, verileri analiz edip şu başlıklar altında öneriler sunar:
   - Genel Durum Değerlendirmesi
   - Öncelikli Eğitim Alanları
   - Karıştırılan Fitler İçin Öneriler
   - Mağaza Bazlı Öneriler
   - Aksiyon Planı

## Özellikler

- ✅ Kategori bazlı performans analizi
- ✅ Karıştırılan fit çiftleri tespiti
- ✅ En çok yanlış yapılan fitler analizi
- ✅ Mağaza karşılaştırması
- ✅ Somut ve uygulanabilir öneriler
- ✅ Türkçe yanıtlar
- ✅ Markdown formatında düzenli çıktı

## API Limitleri

Gemini API ücretsiz tier:
- 60 istek/dakika
- 1500 istek/gün
- Yeterli veri için ideal

## Güvenlik

- API key sadece server-side kullanılır
- Client-side'a asla expose edilmez
- Sadece admin ve store_manager erişebilir
- Her istek authentication kontrolünden geçer

## Dosya Yapısı

```
services/gemini.service.ts          # Gemini AI servisi
app/api/analytics/ai-insights/      # AI analiz endpoint
app/(admin)/admin/training-needs/   # UI entegrasyonu
```

## Sorun Giderme

### API Key Hatası
- `.env.local` dosyasında `GEMINI_API_KEY` olduğundan emin olun
- Sunucuyu yeniden başlatın: `npm run dev`

### Rate Limit Hatası
- Çok fazla istek gönderiyorsanız, birkaç dakika bekleyin
- Ücretsiz tier limitleri: 60 req/min, 1500 req/day

### Yanıt Gelmiyorsa
- Console'da hata mesajlarını kontrol edin
- Network tab'de API çağrısını inceleyin
- Gemini API key'in geçerli olduğundan emin olun

## Geliştirme Notları

- AI yanıtları cache'lenebilir (aynı veriler için tekrar istek atmamak için)
- Prompt engineering ile yanıt kalitesi artırılabilir
- Farklı AI modelleri denenebilir (gemini-pro, gemini-pro-vision)
