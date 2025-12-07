'use client';

import { useState, useEffect } from 'react';
import type { Store } from '@/types/database.types';
import { AdminSidebar } from '@/components/organisms/AdminSidebar';
import { AdminGuard } from '@/components/organisms/AdminGuard';

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);
  const [bulkUploadResult, setBulkUploadResult] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    store_code: '',
    store_name: '',
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/stores');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Mağazalar yüklenemedi');
      }
      
      setStores(result.data);
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
      const url = editingStore 
        ? `/api/admin/stores/${editingStore.id}`
        : '/api/admin/stores';
      
      const method = editingStore ? 'PUT' : 'POST';
      
      const payload = editingStore
        ? {
            store_name: formData.store_name,
          }
        : {
            store_code: parseInt(formData.store_code),
            store_name: formData.store_name,
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

      await fetchStores();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setFormData({
      store_code: store.store_code.toString(),
      store_name: store.store_name,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu mağazayı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/stores/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Silme işlemi başarısız');
      }

      await fetchStores();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const resetForm = () => {
    setFormData({ store_code: '', store_name: '' });
    setEditingStore(null);
    setShowForm(false);
  };

  const handleBulkUpload = async () => {
    if (!bulkUploadFile) return;

    setError(null);
    setBulkUploadResult(null);
    setIsLoading(true);

    try {
      const text = await bulkUploadFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV dosyası boş veya geçersiz');
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim());
      const stores = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const store: any = {};
        
        headers.forEach((header, index) => {
          store[header] = values[index] || '';
        });

        stores.push(store);
      }

      // Upload to API
      const response = await fetch('/api/admin/stores/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stores }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Toplu yükleme başarısız');
      }

      setBulkUploadResult(result.data);
      await fetchStores();
      
      // Reset after 3 seconds
      setTimeout(() => {
        setShowBulkUpload(false);
        setBulkUploadFile(null);
        setBulkUploadResult(null);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="text-3xl font-bold">Mağaza Yönetimi</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            📤 Toplu Ekle
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'İptal' : 'Yeni Mağaza'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingStore ? 'Mağaza Düzenle' : 'Yeni Mağaza Ekle'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Mağaza Kodu *
                </label>
                <input
                  type="number"
                  value={formData.store_code}
                  onChange={(e) => setFormData({ ...formData, store_code: e.target.value })}
                  disabled={!!editingStore}
                  min="1500"
                  max="1950"
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  Mağaza Adı *
                </label>
                <input
                  type="text"
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingStore ? 'Güncelle' : 'Kaydet'}
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

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Toplu Mağaza Ekleme</h2>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">📋 Nasıl Kullanılır?</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Örnek şablonu indirin</li>
                <li>CSV dosyasını düzenleyin (Excel veya metin editörü ile)</li>
                <li>Dosyayı yükleyin ve "Yükle" butonuna tıklayın</li>
              </ol>
            </div>

            <div className="mb-4">
              <a
                href="/templates/stores_template.csv"
                download
                className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                📥 Örnek Şablon İndir
              </a>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                CSV Dosyası Seçin
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setBulkUploadFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              />
              {bulkUploadFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Seçilen dosya: {bulkUploadFile.name}
                </p>
              )}
            </div>

            {bulkUploadResult && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">✅ Başarılı!</h3>
                <p className="text-sm">
                  {bulkUploadResult.inserted} / {bulkUploadResult.total} mağaza eklendi
                </p>
                {bulkUploadResult.errors && bulkUploadResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-red-600">Hatalar:</p>
                    <ul className="text-xs text-red-600 list-disc list-inside">
                      {bulkUploadResult.errors.map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleBulkUpload}
                disabled={!bulkUploadFile || isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Yükleniyor...' : '📤 Yükle'}
              </button>
              <button
                onClick={() => {
                  setShowBulkUpload(false);
                  setBulkUploadFile(null);
                  setBulkUploadResult(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white shadow-md rounded overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Kod
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Mağaza Adı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stores.map((store) => (
              <tr key={store.id}>
                <td className="px-6 py-4 whitespace-nowrap">{store.store_code}</td>
                <td className="px-6 py-4 whitespace-nowrap">{store.store_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      store.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {store.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(store)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(store.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stores.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Henüz mağaza eklenmemiş
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {stores.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
            Henüz mağaza eklenmemiş
          </div>
        ) : (
          stores.map((store) => (
            <div key={store.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {store.store_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Kod: {store.store_code}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    store.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {store.is_active ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(store)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(store.id)}
                  className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </AdminGuard>
  );
}
