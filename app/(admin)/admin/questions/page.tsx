'use client';

import { useState, useEffect } from 'react';
import { BulkUploadModal } from '@/components/organisms/BulkUploadModal';
import { AdminSidebar } from '@/components/organisms/AdminSidebar';
import { AdminGuard } from '@/components/organisms/AdminGuard';
import type { QuestionItem, QuizCategory } from '@/types/database.types';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    image_url: '',
    cloudinary_public_id: '',
    images: [] as Array<{ url: string; color: string; isPrimary: boolean }>,
    gender: 'Kadın' as 'Kadın' | 'Erkek',
    fit_category: '',
    description: '',
    explanation: '',
    tags: '',
  });
  const [showCustomFitInput, setShowCustomFitInput] = useState(false);
  const [customFitCategory, setCustomFitCategory] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchQuestions(selectedCategory);
    } else {
      fetchQuestions();
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const result = await response.json();
      if (response.ok) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchQuestions = async (categoryId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = categoryId 
        ? `/api/admin/questions?category_id=${categoryId}`
        : '/api/admin/questions';
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Sorular yüklenemedi');
      }
      
      setQuestions(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      // Soru adını slug olarak gönder (varsa)
      if (formData.name) {
        const slug = formData.name
          .toLowerCase()
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        const variantNumber = formData.images.length + 1;
        const filename = variantNumber > 1 ? `${slug}-${variantNumber}` : slug;
        uploadFormData.append('filename', filename);
      }

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Resim yüklenemedi');
      }

      // Yeni images array'ine ekle - otomatik index kullan
      const newImage = {
        url: result.data.url,
        color: `variant-${formData.images.length + 1}`, // Otomatik: variant-1, variant-2, ...
        isPrimary: formData.images.length === 0, // İlk görsel primary olsun
      };

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage],
        // Backward compatibility için ilk görseli image_url'e de kaydet
        image_url: prev.images.length === 0 ? result.data.url : prev.image_url,
        cloudinary_public_id: prev.images.length === 0 ? result.data.public_id : prev.cloudinary_public_id,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resim yüklenemedi');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        // İlk görseli image_url'e kaydet
        image_url: newImages.length > 0 ? newImages[0].url : '',
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // En az 1 görsel zorunlu
    if (formData.images.length === 0 && !formData.image_url) {
      setError('En az bir görsel yüklemelisiniz');
      return;
    }

    try {
      const url = editingQuestion 
        ? `/api/admin/questions/${editingQuestion.id}`
        : '/api/admin/questions';
      
      const method = editingQuestion ? 'PUT' : 'POST';
      
      // Determine final fit_category value
      const finalFitCategory = formData.fit_category === '__custom__' 
        ? customFitCategory.trim().toUpperCase()
        : formData.fit_category;

      const payload: any = {
        name: formData.name,
        image_url: formData.image_url,
        cloudinary_public_id: formData.cloudinary_public_id || undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        gender: formData.gender,
        fit_category: finalFitCategory || undefined,
        description: formData.description,
        explanation: formData.explanation || undefined,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      // category_id sadece yeni soru eklerken gerekli
      if (!editingQuestion) {
        payload.category_id = formData.category_id;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'İşlem başarısız');
      }

      await fetchQuestions(selectedCategory);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const handleEdit = (question: QuestionItem) => {
    setEditingQuestion(question);
    const fitCat = (question as any).fit_category || '';
    
    // Check if fit category is in predefined list
    const predefinedCategories = [
      'SUPER SKINNY', 'SKINNY', 'MOM', 'BOYFRIEND', 'STRAIGHT', 'SLIM STRAIGHT',
      'FLARE', 'WIDE LEG', 'BAGGY', 'REGULAR STRAIGHT', 'TAPERED', 'LOOSE', 'COMFORT'
    ];
    
    const isCustom = fitCat && !predefinedCategories.includes(fitCat);
    
    setFormData({
      category_id: question.category_id,
      name: question.name,
      image_url: question.image_url,
      cloudinary_public_id: question.cloudinary_public_id || '',
      images: (question as any).images || [],
      gender: (question as any).gender || 'Kadın',
      fit_category: isCustom ? '__custom__' : fitCat,
      description: question.description,
      explanation: question.explanation || '',
      tags: question.tags.join(', '),
    });
    setShowCustomFitInput(isCustom);
    setCustomFitCategory(isCustom ? fitCat : '');
    setShowForm(true);
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu soruyu silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Silme işlemi başarısız');
      }

      await fetchQuestions(selectedCategory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      name: '',
      image_url: '',
      cloudinary_public_id: '',
      images: [],
      gender: 'Kadın',
      fit_category: '',
      description: '',
      explanation: '',
      tags: '',
    });
    setEditingQuestion(null);
    setShowForm(false);
    setShowCustomFitInput(false);
    setCustomFitCategory('');
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
        <h1 className="text-3xl font-bold">Soru Yönetimi</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkUpload(true)}
            className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white"
          >
            Toplu Yükle
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'İptal' : 'Yeni Soru'}
          </button>
        </div>
      </div>

      {showBulkUpload && (
        <BulkUploadModal
          categories={categories}
          onClose={() => setShowBulkUpload(false)}
          onSuccess={() => fetchQuestions(selectedCategory)}
        />
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-bold mb-2">Kategori Filtrele</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingQuestion ? 'Soru Düzenle' : 'Yeni Soru Ekle'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Kategori *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seçiniz</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Soru Adı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Cinsiyet *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => {
                    const newGender = e.target.value as 'Kadın' | 'Erkek';
                    setFormData({ ...formData, gender: newGender, fit_category: '' });
                    setShowCustomFitInput(false);
                    setCustomFitCategory('');
                  }}
                  required
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Kadın">Kadın</option>
                  <option value="Erkek">Erkek</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Fit Kategorisi</label>
                <select
                  value={formData.fit_category}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, fit_category: value });
                    setShowCustomFitInput(value === '__custom__');
                    if (value !== '__custom__') {
                      setCustomFitCategory('');
                    }
                  }}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">Seçiniz</option>
                  {formData.gender === 'Erkek' ? (
                    <>
                      <option value="SKINNY">SKINNY</option>
                      <option value="SLIM STRAIGHT">SLIM STRAIGHT</option>
                      <option value="REGULAR STRAIGHT">REGULAR STRAIGHT</option>
                      <option value="TAPERED">TAPERED</option>
                      <option value="LOOSE">LOOSE</option>
                      <option value="BAGGY">BAGGY</option>
                      <option value="FLARE">FLARE</option>
                      <option value="COMFORT">COMFORT</option>
                      <option value="__custom__">➕ Yeni Kategori Ekle</option>
                    </>
                  ) : (
                    <>
                      <option value="SUPER SKINNY">SUPER SKINNY</option>
                      <option value="SKINNY">SKINNY</option>
                      <option value="MOM">MOM</option>
                      <option value="BOYFRIEND">BOYFRIEND</option>
                      <option value="STRAIGHT">STRAIGHT</option>
                      <option value="SLIM STRAIGHT">SLIM STRAIGHT</option>
                      <option value="FLARE">FLARE</option>
                      <option value="WIDE LEG">WIDE LEG</option>
                      <option value="BAGGY">BAGGY</option>
                      <option value="__custom__">➕ Yeni Kategori Ekle</option>
                    </>
                  )}
                </select>
                
                {/* Custom fit category input */}
                {showCustomFitInput && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={customFitCategory}
                      onChange={(e) => setCustomFitCategory(e.target.value)}
                      placeholder="Yeni fit kategorisi adını yazın (örn: LOOSE FIT)"
                      className="w-full px-3 py-2 border border-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Kategori adı otomatik olarak büyük harfe çevrilecektir
                    </p>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Görseller *</label>
                <p className="text-sm text-gray-600 mb-2">
                  Aynı fit için farklı renk/varyasyonlar ekleyebilirsiniz. İlk görsel ana görsel olacaktır.
                </p>
                
                {/* Mevcut görseller */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative border rounded-lg p-2">
                        <img src={img.url} alt={`Görsel ${index + 1}`} className="w-full h-32 object-cover rounded" />
                        <div className="mt-2 text-xs text-center">
                          {img.isPrimary && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Ana Görsel</span>}
                          {!img.isPrimary && <span className="text-gray-600">Varyasyon {index}</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Yeni görsel ekle */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full px-3 py-2 border rounded"
                  />
                  {uploadingImage && <p className="text-sm text-gray-500 mt-2">Yükleniyor...</p>}
                  <p className="text-xs text-gray-500 mt-2">
                    Birden fazla görsel eklemek için tekrar seçin
                  </p>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Açıklama *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Detaylı Açıklama</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Etiketler (virgülle ayırın)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Örn: Slim, Erkek, Denim"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                disabled={uploadingImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {editingQuestion ? 'Güncelle' : 'Kaydet'}
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

      <div className="bg-white shadow-md rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Resim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Soru Adı</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Açıklama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Etiketler</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {questions.map((question) => (
                <tr key={question.id}>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {(question as any).images && (question as any).images.length > 0 ? (
                        <>
                          <img 
                            src={(question as any).images[0].url} 
                            alt={question.name} 
                            className="h-16 w-16 object-cover rounded" 
                          />
                          {(question as any).images.length > 1 && (
                            <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">
                              +{(question as any).images.length - 1}
                            </div>
                          )}
                        </>
                      ) : (
                        <img src={question.image_url} alt={question.name} className="h-16 w-16 object-cover rounded" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{question.name}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{question.description}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {question.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${
                      question.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {question.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(question)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {questions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Henüz soru eklenmemiş
          </div>
        )}
      </div>
      </div>
    </AdminGuard>
  );
}
