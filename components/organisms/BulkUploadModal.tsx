'use client';

import { useState } from 'react';
import type { QuizCategory } from '@/types/database.types';

interface BulkUploadModalProps {
  categories: QuizCategory[];
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkUploadModal({ categories, onClose, onSuccess }: BulkUploadModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/bulk-upload');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Şablon indirilemedi');
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedCategory) {
      setError('Lütfen kategori seçin ve dosya yükleyin');
      return;
    }

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category_id', selectedCategory);

      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Yükleme başarısız');
      }

      setResult(data.data);
      
      if (data.data.success > 0) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Toplu Soru Yükleme</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {result && (
          <div className="mb-4 p-4 bg-blue-50 rounded">
            <h3 className="font-bold mb-2">Yükleme Sonucu:</h3>
            <p>Toplam: {result.total}</p>
            <p className="text-green-600">Başarılı: {result.success}</p>
            <p className="text-red-600">Hatalı: {result.errors}</p>
            
            {result.errorDetails && result.errorDetails.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold mb-2">Hatalar:</h4>
                <div className="max-h-40 overflow-y-auto">
                  {result.errorDetails.map((err: any, idx: number) => (
                    <p key={idx} className="text-sm text-red-600">
                      Satır {err.row}: {err.error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Kategori Seçin *</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              disabled={isUploading}
            >
              <option value="">Seçiniz</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">CSV Dosyası *</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isUploading}
              className="w-full px-3 py-2 border rounded"
            />
            {file && (
              <p className="text-sm text-gray-600 mt-1">
                Seçilen dosya: {file.name}
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold mb-2">CSV Formatı:</h3>
            <p className="text-sm text-gray-600 mb-2">
              CSV dosyanız şu sütunları içermelidir:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside mb-2">
              <li>name (Soru adı) *</li>
              <li>image_url (Resim URL'si) *</li>
              <li>description (Açıklama) *</li>
              <li>explanation (Detaylı açıklama - opsiyonel)</li>
              <li>tags (Etiketler, noktalı virgülle ayrılmış - opsiyonel)</li>
              <li>gender (Cinsiyet: Kadın veya Erkek) *</li>
              <li>fit_category (Fit kategorisi: STRAIGHT, SKINNY, MOM, vb.) *</li>
            </ul>
            <p className="text-xs text-gray-500 mb-2">
              * Zorunlu alanlar
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 text-sm border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
            >
              Örnek Şablon İndir
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleUpload}
            disabled={!file || !selectedCategory || isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Yükleniyor...' : 'Yükle'}
          </button>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 disabled:opacity-50"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}
