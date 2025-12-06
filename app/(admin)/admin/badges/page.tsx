'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/organisms/AdminSidebar';
import { AdminGuard } from '@/components/organisms/AdminGuard';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { getBadgeImageUrl } from '@/lib/cloudinary';

interface BadgeDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  tier: string | null;
  emoji: string;
  image_url: string | null;
  is_hidden: boolean;
  unlock_type: string;
  unlock_value: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export default function BadgesAdminPage() {
  const [badges, setBadges] = useState<BadgeDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeDefinition | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: 'education',
    tier: '',
    emoji: '🏆',
    image_url: '',
    is_hidden: false,
    unlock_type: 'games_played',
    unlock_value: '10',
    display_order: '0',
  });

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/badges');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Rozetler yüklenemedi');
      }
      
      setBadges(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Lütfen bir görsel dosyası seçin');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Görsel boyutu 5MB\'dan küçük olmalıdır');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Clean filename - remove Turkish characters and special chars
      const cleanFileName = file.name
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9.]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      // Create new file with cleaned name
      const cleanedFile = new File([file], cleanFileName, { type: file.type });

      const uploadFormData = new FormData();
      uploadFormData.append('file', cleanedFile);
      uploadFormData.append('folder', 'badges');

      let response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      let result = await response.json();

      // If parse error (hot reload issue), retry once
      if (!response.ok && result.error?.code === 'PARSE_ERROR') {
        console.log('Parse error detected, retrying upload...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
        
        // Recreate FormData for retry
        const retryFormData = new FormData();
        retryFormData.append('file', cleanedFile);
        retryFormData.append('folder', 'badges');
        
        response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: retryFormData,
        });
        
        result = await response.json();
      }

      if (!response.ok) {
        console.error('Upload error:', result);
        throw new Error(result.error?.message || 'Yükleme başarısız');
      }

      console.log('Upload success:', result);
      setFormData({ ...formData, image_url: result.data.url });
    } catch (err) {
      console.error('Upload exception:', err);
      setError(err instanceof Error ? err.message : 'Yükleme hatası');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const url = editingBadge 
        ? `/api/admin/badges/${editingBadge.id}`
        : '/api/admin/badges';
      
      const method = editingBadge ? 'PUT' : 'POST';
      
      const payload = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        tier: formData.tier || null,
        emoji: formData.emoji,
        image_url: formData.image_url || null,
        is_hidden: formData.is_hidden,
        unlock_type: formData.unlock_type,
        unlock_value: parseInt(formData.unlock_value),
        display_order: parseInt(formData.display_order),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'İşlem başarısız');
      }

      await fetchBadges();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handleEdit = (badge: BadgeDefinition) => {
    setEditingBadge(badge);
    setFormData({
      code: badge.code,
      name: badge.name,
      description: badge.description,
      category: badge.category,
      tier: badge.tier || '',
      emoji: badge.emoji,
      image_url: badge.image_url || '',
      is_hidden: badge.is_hidden,
      unlock_type: badge.unlock_type,
      unlock_value: badge.unlock_value.toString(),
      display_order: badge.display_order.toString(),
    });
    setShowForm(true);
    
    // Scroll to top after state update
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };



  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      category: 'education',
      tier: '',
      emoji: '🏆',
      image_url: '',
      is_hidden: false,
      unlock_type: 'games_played',
      unlock_value: '10',
      display_order: '0',
    });
    setEditingBadge(null);
    setShowForm(false);
  };

  const categoryNames: Record<string, string> = {
    education: '📚 Eğitim',
    performance: '⚡ Performans',
    consistency: '🔥 İstikrar',
    competition: '🏅 Rekabet',
    category_completion: '🎯 Kategori Tamamlama',
    secret: '🎭 Gizli',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <AdminGuard>
      <AdminSidebar />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Rozet Yönetimi</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'İptal' : 'Yeni Rozet'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingBadge ? 'Rozet Düzenle' : 'Yeni Rozet Ekle'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Rozet Kodu *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    disabled={!!editingBadge}
                    className="w-full px-3 py-2 border rounded disabled:bg-gray-100"
                    placeholder="emektar_bronze"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Rozet Adı *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Emektar - Bronz"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">Açıklama *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="10 oyun tamamla"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Kategori *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded"
                  >
                    {Object.entries(categoryNames).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Seviye</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">Seviye Yok</option>
                    <option value="bronze">Bronz</option>
                    <option value="silver">Gümüş</option>
                    <option value="gold">Altın</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Emoji</label>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="🏆"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Sıra</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    min="0"
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2">Rozet Görseli</label>
                  <div className="flex items-center gap-4">
                    {formData.image_url && (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                        <Image
                          src={formData.image_url}
                          alt="Badge preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: '' })}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <Upload className="w-5 h-5" />
                          <span className="text-sm">
                            {uploading ? 'Yükleniyor...' : 'Görsel Yükle (PNG, JPG, max 5MB)'}
                          </span>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Önerilen boyut: 400x400px, şeffaf arka plan
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Kazanma Türü *</label>
                  <select
                    value={formData.unlock_type}
                    onChange={(e) => setFormData({ ...formData, unlock_type: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="games_played">Oyun Sayısı</option>
                    <option value="correct_answers">Doğru Cevap Sayısı</option>
                    <option value="streak">Giriş Serisi</option>
                    <option value="perfect_games">Mükemmel Oyun</option>
                    <option value="category_master">Kategori Ustası</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Kazanma Değeri *</label>
                  <input
                    type="number"
                    value={formData.unlock_value}
                    onChange={(e) => setFormData({ ...formData, unlock_value: e.target.value })}
                    required
                    min="1"
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_hidden}
                      onChange={(e) => setFormData({ ...formData, is_hidden: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-bold">
                      Gizli Rozet (Kazanılana kadar açıklama gizli)
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingBadge ? 'Güncelle' : 'Kaydet'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Badges List */}
        <div className="space-y-6">
          {Object.entries(categoryNames).map(([category, categoryName]) => {
            const categoryBadges = badges.filter(b => b.category === category);
            if (categoryBadges.length === 0) return null;

            return (
              <div key={category} className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">{categoryName}</h2>
                <div className="space-y-3">
                  {categoryBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        {/* Badge Image/Emoji */}
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shrink-0 overflow-hidden ${
                          badge.image_url ? '' : 'bg-gradient-to-br from-amber-400 to-amber-500'
                        }`}>
                          {badge.image_url ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={getBadgeImageUrl(badge.image_url, 'small') || badge.image_url}
                                alt={badge.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            badge.emoji
                          )}
                        </div>

                        {/* Badge Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900">{badge.name}</h3>
                            {badge.tier && (
                              <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded">
                                {badge.tier === 'bronze' && '🥉 Bronz'}
                                {badge.tier === 'silver' && '🥈 Gümüş'}
                                {badge.tier === 'gold' && '🥇 Altın'}
                              </span>
                            )}
                            {badge.is_hidden && (
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                                🎭 Gizli
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Kod: {badge.code}</span>
                            <span>Sıra: {badge.display_order}</span>
                            <span>
                              Kazanma: {badge.unlock_type} = {badge.unlock_value}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(badge);
                            }}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                          >
                            Düzenle
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {badges.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">Henüz rozet eklenmemiş</p>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
