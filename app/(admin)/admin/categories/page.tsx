'use client';

import { useState, useEffect } from 'react';
import type { QuizCategory } from '@/types/database.types';
import { AdminSidebar } from '@/components/organisms/AdminSidebar';
import { AdminGuard } from '@/components/organisms/AdminGuard';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<QuizCategory | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon_url: '',
    display_order: '',
    is_all_categories: false,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/categories');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Kategoriler yüklenemedi');
      }
      
      setCategories(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        icon_url: formData.icon_url || undefined,
        display_order: formData.display_order ? parseInt(formData.display_order) : undefined,
        is_all_categories: formData.is_all_categories,
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

      await fetchCategories();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handleEdit = (category: QuizCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon_url: category.icon_url || '',
      display_order: category.display_order.toString(),
      is_all_categories: category.is_all_categories || false,
    });
    setShowForm(true);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Durum değiştirilemedi');
      }

      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handleToggleQuizActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_quiz_active: !currentStatus }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Quiz durumu değiştirilemedi');
      }

      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Silme işlemi başarısız');
      }

      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', icon_url: '', display_order: '', is_all_categories: false });
    setEditingCategory(null);
    setShowForm(false);
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
        <h1 className="text-3xl font-bold">Quiz Kategorileri</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'İptal' : 'Yeni Kategori'}
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
            {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Kategori Adı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded"
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
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">İkon URL</label>
                <input
                  type="url"
                  value={formData.icon_url}
                  onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_all_categories}
                    onChange={(e) => setFormData({ ...formData, is_all_categories: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-bold">
                    Tüm Kategoriler (Bu kategori tüm aktif kategorilerden soru çeker)
                  </span>
                </label>
                <p className="text-xs text-gray-600 mt-1 ml-6">
                  Bu seçenek işaretlenirse, bu kategoride oyun başlatıldığında tüm aktif kategorilerden sorular sorulur.
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingCategory ? 'Güncelle' : 'Kaydet'}
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

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white shadow-md rounded overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Sıra</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Kategori Adı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Açıklama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tüm Sorularda</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Oynanabilir</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">{category.display_order}</td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {category.name}
                  {category.is_all_categories && (
                    <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                      Tüm Kategoriler
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">{category.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {!category.is_all_categories ? (
                    <button
                      onClick={() => handleToggleActive(category.id, category.is_active)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        category.is_active
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      {category.is_active ? '✓ Dahil' : '✕ Hariç'}
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleQuizActive(category.id, category.is_quiz_active)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      category.is_quiz_active
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                    disabled={category.is_all_categories}
                  >
                    {category.is_quiz_active ? '✓ Açık' : '✕ Kapalı'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Henüz kategori eklenmemiş
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white shadow-md rounded-lg p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">Sıra: {category.display_order}</span>
                  {category.is_all_categories && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                      Tüm Kategoriler
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                )}
              </div>
            </div>

            {/* Status Toggles */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-gray-600 block mb-2">Tüm Sorularda</label>
                {!category.is_all_categories ? (
                  <button
                    onClick={() => handleToggleActive(category.id, category.is_active)}
                    className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      category.is_active
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {category.is_active ? '✓ Dahil' : '✕ Hariç'}
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">-</span>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-2">Oynanabilir</label>
                <button
                  onClick={() => handleToggleQuizActive(category.id, category.is_quiz_active)}
                  className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    category.is_quiz_active
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}
                  disabled={category.is_all_categories}
                >
                  {category.is_quiz_active ? '✓ Açık' : '✕ Kapalı'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <button
                onClick={() => handleEdit(category)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Düzenle
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
            Henüz kategori eklenmemiş
          </div>
        )}
      </div>
      </div>
    </AdminGuard>
  );
}
