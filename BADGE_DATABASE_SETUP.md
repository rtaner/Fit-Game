# Badge Database Setup

## 🗄️ Veritabanı Güncelleme

### Adım 1: Supabase SQL Editor'ü Aç

1. Supabase Dashboard'a git: https://supabase.com
2. Projenizi seçin
3. Sol menüden **SQL Editor** seçeneğine tıklayın
4. **New Query** butonuna tıklayın

### Adım 2: SQL Sorgusunu Çalıştır

Aşağıdaki SQL sorgusunu kopyalayıp SQL Editor'e yapıştırın ve **Run** butonuna tıklayın:

```sql
-- ============================================
-- Badge Definitions Table - Add image_url Column
-- ============================================

-- 1. Add image_url column to badge_definitions table
ALTER TABLE badge_definitions 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Add updated_at column if it doesn't exist (for tracking changes)
ALTER TABLE badge_definitions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Add created_at column if it doesn't exist
ALTER TABLE badge_definitions 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_badge_definitions_updated_at ON badge_definitions;
CREATE TRIGGER update_badge_definitions_updated_at
    BEFORE UPDATE ON badge_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Add comments to explain the columns
COMMENT ON COLUMN badge_definitions.image_url IS 
'Cloudinary URL for badge image. Optional field - if null, emoji will be displayed instead.';

COMMENT ON COLUMN badge_definitions.updated_at IS 
'Timestamp of last update (auto-updated by trigger)';

COMMENT ON COLUMN badge_definitions.created_at IS 
'Timestamp of creation';

-- 6. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_badge_definitions_image_url 
ON badge_definitions(image_url) 
WHERE image_url IS NOT NULL;

-- 7. Verify the columns were added successfully
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'badge_definitions'
AND column_name IN ('image_url', 'created_at', 'updated_at')
ORDER BY column_name;
```

### Adım 3: Sonucu Kontrol Et

Sorgu başarılı olursa şu sonucu görmelisiniz:

```
column_name | data_type | is_nullable | column_default
------------|-----------|-------------|---------------
image_url   | text      | YES         | NULL
```

### Adım 4: Mevcut Rozetleri Kontrol Et

Tüm rozetleri ve image_url durumlarını görmek için:

```sql
SELECT 
    id,
    code,
    name,
    emoji,
    image_url,
    tier,
    category
FROM badge_definitions
ORDER BY category, display_order;
```

## 🔧 Alternatif: Supabase CLI ile Migration

Eğer Supabase CLI kullanıyorsanız:

### 1. Migration Dosyası Oluştur

```bash
supabase migration new add_image_url_to_badges
```

### 2. Migration Dosyasını Düzenle

Oluşturulan dosyaya şu içeriği ekle:

```sql
-- Add image_url column to badge_definitions
ALTER TABLE badge_definitions 
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN badge_definitions.image_url IS 
'Cloudinary URL for badge image';

CREATE INDEX IF NOT EXISTS idx_badge_definitions_image_url 
ON badge_definitions(image_url) 
WHERE image_url IS NOT NULL;
```

### 3. Migration'ı Uygula

```bash
supabase db push
```

## 📊 Tablo Yapısı (Güncellenmiş)

Migration sonrası `badge_definitions` tablosu şu kolonlara sahip olacak:

| Kolon | Tip | Nullable | Açıklama |
|-------|-----|----------|----------|
| id | uuid | NO | Primary key |
| code | text | NO | Unique badge code |
| name | text | NO | Badge name |
| description | text | NO | Badge description |
| category | text | NO | Badge category |
| tier | text | YES | Badge tier (bronze/silver/gold) |
| emoji | text | NO | Emoji fallback |
| **image_url** | **text** | **YES** | **Cloudinary URL (NEW)** |
| is_hidden | boolean | NO | Hidden badge flag |
| unlock_type | text | NO | Unlock condition type |
| unlock_value | integer | NO | Unlock threshold value |
| unlock_metadata | jsonb | YES | Additional unlock data |
| display_order | integer | NO | Display order |
| created_at | timestamp | NO | Creation timestamp |
| updated_at | timestamp | NO | Update timestamp |

## ✅ Doğrulama

### Test 1: Kolon Var mı?

```sql
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'badge_definitions' 
    AND column_name = 'image_url'
) AS image_url_exists;
```

Sonuç: `true` olmalı

### Test 2: Rozet Güncelleme

```sql
-- Test için bir rozete görsel URL'i ekle
UPDATE badge_definitions
SET image_url = 'https://res.cloudinary.com/xxx/image/upload/v123/badges/test.png'
WHERE code = 'veteran_bronze'
RETURNING id, code, name, image_url;
```

### Test 3: API'den Kontrol

Admin panelinden:
1. http://localhost:3000/admin/badges
2. Bir rozeti düzenle
3. Görsel yükle
4. Güncelle butonuna tıkla
5. Supabase'de kontrol et:

```sql
SELECT code, name, image_url 
FROM badge_definitions 
WHERE image_url IS NOT NULL;
```

## 🚨 Sorun Giderme

### Hata: "column already exists"

Eğer kolon zaten varsa:

```sql
-- Kolon tipini kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'badge_definitions' 
AND column_name = 'image_url';

-- Eğer yanlış tipte ise, düzelt
ALTER TABLE badge_definitions 
ALTER COLUMN image_url TYPE TEXT;
```

### Hata: "permission denied"

RLS (Row Level Security) politikalarını kontrol et:

```sql
-- Admin kullanıcıları için UPDATE izni ver
CREATE POLICY IF NOT EXISTS "Admins can update badges"
ON badge_definitions
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);
```

## 📝 Notlar

- `image_url` kolonu **opsiyonel** (NULL olabilir)
- Eğer `image_url` NULL ise, `emoji` gösterilir
- Cloudinary URL'leri otomatik ölçeklendirme ile kullanılır
- Index sayesinde sorgular daha hızlı çalışır

## 🎯 Sonraki Adımlar

1. ✅ SQL sorgusunu çalıştır
2. ✅ Kolonun eklendiğini doğrula
3. ✅ Admin panelinden rozet görseli yükle
4. ✅ Kullanıcı tarafında görselin göründüğünü kontrol et

---

**Not:** Migration'ı çalıştırdıktan sonra uygulama yeniden başlatmaya gerek yok. Değişiklikler anında aktif olur.
