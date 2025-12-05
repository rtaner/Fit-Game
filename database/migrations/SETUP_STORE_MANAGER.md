# Store Manager Rolü Kurulumu

## Adım 1: Migration'ı Çalıştır

Supabase Dashboard'a git:
1. https://supabase.com → Projenizi açın
2. Sol menüden **SQL Editor**'ü seçin
3. **New Query** butonuna tıklayın
4. Aşağıdaki SQL kodunu yapıştırın ve **Run** butonuna tıklayın:

```sql
-- Add store_manager role to users table
DO $$ 
BEGIN
    -- Drop the existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    END IF;
    
    -- Add new constraint with store_manager role
    ALTER TABLE users ADD CONSTRAINT users_role_check 
        CHECK (role IN ('employee', 'admin', 'store_manager'));
END $$;

COMMENT ON COLUMN users.role IS 'User role: employee (regular user), admin (full access), store_manager (analytics access for their store)';
```

## Adım 2: Bir Kullanıcıyı Store Manager Yap

### Seçenek 1: Username ile

```sql
-- Kullanıcı adını biliyorsanız
UPDATE users 
SET role = 'store_manager' 
WHERE username = 'KULLANICI_ADI_BURAYA';
```

### Seçenek 2: Tüm Kullanıcıları Listele ve Seç

```sql
-- Önce kullanıcıları listeleyin
SELECT id, username, first_name, last_name, store_code, role 
FROM users 
ORDER BY created_at DESC;

-- Sonra ID ile güncelleyin
UPDATE users 
SET role = 'store_manager' 
WHERE id = 'USER_ID_BURAYA';
```

### Seçenek 3: Belirli Bir Mağazanın İlk Kullanıcısını Store Manager Yap

```sql
-- Örnek: Mağaza 101'in ilk kullanıcısını store manager yap
UPDATE users 
SET role = 'store_manager' 
WHERE id = (
    SELECT id 
    FROM users 
    WHERE store_code = 101 
    ORDER BY created_at ASC 
    LIMIT 1
);
```

## Adım 3: Kontrol Et

```sql
-- Store manager'ları listele
SELECT username, first_name, last_name, store_code, role 
FROM users 
WHERE role = 'store_manager';
```

## Test

1. Store manager olarak giriş yap
2. Dashboard'da sadece "Analitik" ve "Eğitim İhtiyacı" menülerini göreceksin
3. Analitik sayfasında sadece kendi mağazanın verilerini göreceksin

## Sorun Giderme

### "Kullanıcı adı veya şifre hatalı" Hatası

Eğer giriş yapamıyorsanız:

1. Migration'ın çalıştığını kontrol edin:
```sql
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'users_role_check';
```

Beklenen sonuç:
```
constraint_name: users_role_check
check_clause: (role = ANY (ARRAY['employee'::text, 'admin'::text, 'store_manager'::text]))
```

2. Kullanıcının rolünü kontrol edin:
```sql
SELECT username, role FROM users WHERE username = 'KULLANICI_ADI';
```

3. Eğer rol 'store_manager' ise ama giriş yapamıyorsanız, şifreyi sıfırlayın:
```sql
-- Admin panelden veya SQL ile geçici şifre oluşturun
```

### "Bu sayfaya erişim yetkiniz yok" Hatası

Eğer giriş yaptıktan sonra bu hatayı alıyorsanız:

1. Browser'ı yenileyin (Ctrl+F5 veya Cmd+Shift+R)
2. LocalStorage'ı temizleyin:
   - Browser Console'u açın (F12)
   - `localStorage.clear()` yazın
   - Tekrar giriş yapın

3. Session'ı kontrol edin:
```javascript
// Browser Console'da
JSON.parse(localStorage.getItem('current-user'))
```

Role'ün 'store_manager' olduğundan emin olun.
