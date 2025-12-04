# 🎯 Yeni Sistem Özeti

## ✅ Yapılan Değişiklikler

### 1. Veritabanı Güncellemeleri

**question_items tablosuna eklenenler:**
- `gender` (Kadın/Erkek) - Cinsiyet ayrımı için
- `fit_category` (STRAIGHT, SKINNY, MOM, vb.) - Fit kategorisi için

**quiz_categories tablosuna eklenenler:**
- `is_quiz_active` (boolean) - Kategoriyi quiz'de aktif/pasif yapma

**game_sessions tablosuna eklenenler:**
- `asked_questions` (JSONB array) - Sorulan soruları takip etme

### 2. Soru Oluşturma Algoritması

**Yeni Mantık:**
```
1. Aktif kategorilerden TÜM soruları çek
2. Daha önce sorulmuş soruları hariç tut
3. Rastgele bir doğru cevap seç (örn: Rockstar - Kadın, STRAIGHT)
4. Şık 1: Doğru cevap
5. Şık 2: Aynı cinsiyet + Aynı fit_category (örn: Barcelona - Kadın, STRAIGHT)
6. Şık 3: Aynı cinsiyet + Farklı fit_category (örn: Serenay - Kadın, SUPER SKINNY)
7. Şıkları karıştır
```

**Özellikler:**
- ✅ Kadın sorusuna erkek şık gelmez
- ✅ Aynı soru tekrar sorulmaz
- ✅ Aynı fit kategorisinden yanıltıcı şık
- ✅ Farklı fit kategorisinden yanıltıcı şık

### 3. Kategori Yönetimi

**Admin Panelde:**
- Kategorileri aktif/pasif yapabilme
- `is_quiz_active` toggle ile quiz'de göster/gizle
- Örnek: "Denim Fit" aktif, "Koleksiyonlar" pasif

### 4. CSV Formatı Güncellendi

**Yeni Sütunlar:**
```csv
name,image_url,description,explanation,tags,gender,fit_category
Serenay,https://...,Yüksek bel süper skinny,Çok dar kesim,SUPER SKINNY;Yüksek Bel,Kadın,SUPER SKINNY
```

## 📋 Yapılacaklar

### 1. Migration'ı Çalıştır

```bash
# Supabase Dashboard'a git
# SQL Editor'ı aç
# database/migrations/add_gender_and_fit_category.sql dosyasını çalıştır
```

### 2. Mevcut Verileri Güncelle

Eğer veritabanında zaten sorular varsa:

```sql
-- Örnek: Mevcut soruları güncelle
UPDATE question_items 
SET gender = 'Erkek', fit_category = 'SLIM' 
WHERE name = 'Marcus Fit';

UPDATE question_items 
SET gender = 'Kadın', fit_category = 'SUPER SKINNY' 
WHERE name = 'Serenay';
```

### 3. Kategorileri Aktif Yap

```sql
-- Denim Fit kategorisini quiz'de aktif yap
UPDATE quiz_categories 
SET is_quiz_active = TRUE 
WHERE name = 'Denim Fit';

-- Diğer kategorileri pasif yap
UPDATE quiz_categories 
SET is_quiz_active = FALSE 
WHERE name != 'Denim Fit';
```

### 4. CSV Hazırla

Kadın denim listeni şu formatta hazırla:

```csv
name,image_url,description,explanation,tags,gender,fit_category
Serenay,https://cloudinary.com/.../serenay.webp,Yüksek bel süper skinny dar paça,Çok dar kesim modern görünüm,SUPER SKINNY;Yüksek Bel;Dar Paça,Kadın,SUPER SKINNY
Tess,https://cloudinary.com/.../tess.webp,Normal bel skinny dar paça,Dar kesim klasik stil,SKINNY;Normal Bel;Dar Paça,Kadın,SKINNY
Cindy,https://cloudinary.com/.../cindy.webp,Yüksek bel mom jean dar paça,Rahat kesim vintage stil,MOM;Yüksek Bel;Dar Paça,Kadın,MOM
Star,https://cloudinary.com/.../star.webp,Süper yüksek bel mom jean dar paça,Çok yüksek bel rahat kesim,MOM;Süper Yüksek Bel;Dar Paça,Kadın,MOM
Ada,https://cloudinary.com/.../ada.webp,Normal bel boyfriend yarı dar paça,Rahat kesim boyfriend stil,BOYFRIEND;Normal Bel;Yarı Dar Paça,Kadın,BOYFRIEND
Rockstar,https://cloudinary.com/.../rockstar.webp,Normal bel düz kesim düz paça,Klasik düz kesim,STRAIGHT;Normal Bel;Düz Paça,Kadın,STRAIGHT
Barcelona,https://cloudinary.com/.../barcelona.webp,Yüksek bel düz rahat kesim düz paça,Rahat ve şık,STRAIGHT;Yüksek Bel;Düz Paça,Kadın,STRAIGHT
New York,https://cloudinary.com/.../new_york.webp,Yüksek bel düz kesim düz paça,Modern düz kesim,STRAIGHT;Yüksek Bel;Düz Paça,Kadın,STRAIGHT
Sky,https://cloudinary.com/.../sky.webp,Yüksek bel mom kesim düz paça,Mom stil düz paça,STRAIGHT;Yüksek Bel;Düz Paça,Kadın,STRAIGHT
Ibiza,https://cloudinary.com/.../ibiza.webp,Düşük bel düz rahat kesim düz paça,Rahat ve serbest,STRAIGHT;Düşük Bel;Düz Paça,Kadın,STRAIGHT
Jane,https://cloudinary.com/.../jane.webp,Normal bel düz kesim düz paça,Klasik ve rahat,STRAIGHT;Normal Bel;Düz Paça,Kadın,STRAIGHT
Taylor,https://cloudinary.com/.../taylor.webp,Yüksek bel düz kesim düz paça,Şık ve modern,STRAIGHT;Yüksek Bel;Düz Paça,Kadın,STRAIGHT
Margot,https://cloudinary.com/.../margot.webp,Yüksek bel düz rahat kesim düz paça,Rahat ve şık,STRAIGHT;Yüksek Bel;Düz Paça,Kadın,STRAIGHT
Lisette,https://cloudinary.com/.../lisette.webp,Normal bel düz rahat kesim düz paça,Günlük rahat,STRAIGHT;Normal Bel;Düz Paça,Kadın,STRAIGHT
Windy Extra Loose,https://cloudinary.com/.../windyex.webp,Normal bel düz rahat kesim düz paça,Çok rahat kesim,STRAIGHT;Normal Bel;Düz Paça,Kadın,STRAIGHT
```

### 5. Toplu Yükle

1. Admin panele git: `http://localhost:3000/admin/questions`
2. "Toplu Yükle" butonuna tıkla
3. "Denim Fit" kategorisini seç
4. CSV dosyasını yükle

## 🎮 Test Senaryosu

### Senaryo 1: Kadın Sorusu
```
Doğru Cevap: Rockstar (Kadın, STRAIGHT)
Şık 1: Rockstar ✅
Şık 2: Barcelona (Kadın, STRAIGHT) - Aynı fit
Şık 3: Serenay (Kadın, SUPER SKINNY) - Farklı fit
```

### Senaryo 2: Erkek Sorusu
```
Doğru Cevap: Marcus (Erkek, SLIM)
Şık 1: Marcus ✅
Şık 2: James (Erkek, SLIM) - Aynı fit
Şık 3: Jake (Erkek, REGULAR) - Farklı fit
```

### Senaryo 3: Tekrar Sorulma
```
Oyun başladı
Soru 1: Rockstar → Doğru cevap
Soru 2: Serenay → Doğru cevap
Soru 3: Cindy → Doğru cevap
Soru 4: Rockstar ❌ SORULMAZ (zaten soruldu)
```

## 🏆 İleride Eklenecekler

### Kategori Bazlı Rozetler

```typescript
// Badge service'e eklenecek
{
  type: 'straight_expert',
  name: 'STRAIGHT Uzmanı',
  description: 'STRAIGHT kategorisinde 10 doğru cevap',
  criteria: (stats) => stats.categoryStats['STRAIGHT'] >= 10,
  icon: '🎯',
}
```

### Admin Panel Toggle

```typescript
// Categories sayfasına eklenecek
<Toggle
  checked={category.is_quiz_active}
  onChange={() => toggleQuizActive(category.id)}
  label="Quiz'de Göster"
/>
```

## 📊 Veritabanı Şeması

```sql
question_items
├── id (uuid)
├── category_id (uuid) → quiz_categories.id
├── name (varchar)
├── image_url (text)
├── description (text)
├── explanation (text)
├── tags (text[])
├── gender (varchar) ← YENİ
├── fit_category (varchar) ← YENİ
└── is_active (boolean)

quiz_categories
├── id (uuid)
├── name (varchar)
├── is_active (boolean)
└── is_quiz_active (boolean) ← YENİ

game_sessions
├── id (uuid)
├── user_id (uuid)
├── category_id (uuid)
├── score (integer)
├── asked_questions (jsonb) ← YENİ
└── ...
```

## 🚀 Sonraki Adımlar

1. ✅ Migration'ı çalıştır
2. ✅ Kategorileri aktif/pasif yap
3. ✅ CSV hazırla (gender ve fit_category ekle)
4. ✅ Görselleri Cloudinary'ye yükle
5. ✅ Toplu yükleme yap
6. ✅ Oyunu test et
7. ⏳ Admin panele toggle ekle (opsiyonel)
8. ⏳ Kategori bazlı rozetler ekle (ileride)

Hazır! 🎉
