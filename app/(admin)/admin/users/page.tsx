'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { AdminSidebar } from '@/components/organisms/AdminSidebar';
import { AdminGuard } from '@/components/organisms/AdminGuard';
import { PasswordResetModal } from '@/components/admin/PasswordResetModal';
import { DeleteConfirmationModal } from '@/components/admin/DeleteConfirmationModal';
import { Key, Ticket, Trash2, Edit } from 'lucide-react';

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  store_code: number;
  role: 'employee' | 'admin' | 'store_manager';
  created_at: string;
}

interface Store {
  store_code: number;
  store_name: string;
}

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [storeSearchQuery, setStoreSearchQuery] = useState<string>('');
  const [showStoreDropdown, setShowStoreDropdown] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Password Reset Modal State
  const [resetModal, setResetModal] = useState<{
    isOpen: boolean;
    type: 'password' | 'token';
    value: string;
    expiresAt?: string;
    username: string;
  }>({
    isOpen: false,
    type: 'password',
    value: '',
    username: '',
  });

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    userId: string;
    username: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    userId: '',
    username: '',
    isDeleting: false,
  });

  // Edit User Modal State
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    user: User | null;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    user: null,
    isSubmitting: false,
  });

  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    store_code: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchStores();
  }, []);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle reset password
  const handleResetPassword = async (userId: string, username: string) => {
    try {
      const userStr = localStorage.getItem('current-user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch(`/api/admin/users/${userId}/reset-password?userId=${user.id}`, {
        method: 'POST',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Geçici şifre oluşturulamadı');
      }

      setResetModal({
        isOpen: true,
        type: 'password',
        value: result.data.temporaryPassword,
        username: result.data.username,
      });

      showToast('Geçici şifre oluşturuldu', 'success');
      fetchUsers();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handle generate token
  const handleGenerateToken = async (userId: string, username: string) => {
    try {
      const userStr = localStorage.getItem('current-user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch(`/api/admin/users/${userId}/generate-token?userId=${user.id}`, {
        method: 'POST',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Reset kodu oluşturulamadı');
      }

      setResetModal({
        isOpen: true,
        type: 'token',
        value: result.data.resetToken,
        expiresAt: result.data.expiresAt,
        username: result.data.username,
      });

      showToast('Reset kodu oluşturuldu', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      store_code: user.store_code.toString(),
    });
    setEditModal({
      isOpen: true,
      user,
      isSubmitting: false,
    });
  };

  // Submit edit user
  const handleSubmitEdit = async () => {
    if (!editModal.user) return;

    setEditModal(prev => ({ ...prev, isSubmitting: true }));

    try {
      const userStr = localStorage.getItem('current-user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch(`/api/admin/users/${editModal.user.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': user.id,
        },
        body: JSON.stringify({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          username: editForm.username,
          store_code: parseInt(editForm.store_code),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Kullanıcı güncellenemedi');
      }

      showToast('Kullanıcı başarıyla güncellendi', 'success');
      setEditModal({ isOpen: false, user: null, isSubmitting: false });
      fetchUsers();
    } catch (err: any) {
      showToast(err.message, 'error');
      setEditModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // Handle delete user
  const handleDeleteUser = (userId: string, username: string) => {
    setDeleteModal({
      isOpen: true,
      userId,
      username,
      isDeleting: false,
    });
  };

  // Confirm delete user
  const confirmDeleteUser = async () => {
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      const userStr = localStorage.getItem('current-user');
      if (!userStr) return;
      const user = JSON.parse(userStr);

      const response = await fetch(`/api/admin/users/${deleteModal.userId}?userId=${user.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Kullanıcı silinemedi');
      }

      showToast('Kullanıcı başarıyla silindi', 'success');
      setDeleteModal({ isOpen: false, userId: '', username: '', isDeleting: false });
      fetchUsers();
    } catch (err: any) {
      showToast(err.message, 'error');
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/admin/stores');
      const result = await response.json();
      if (response.ok) {
        setStores(result.data);
      }
    } catch (err) {
      console.error('Mağazalar yüklenemedi:', err);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get current user ID from localStorage
      const userStr = localStorage.getItem('current-user');
      if (!userStr) {
        setError('Oturum bulunamadı');
        setIsLoading(false);
        return;
      }
      const user = JSON.parse(userStr);
      console.log('Current user:', user.username, 'Role:', user.role, 'Store:', user.store_code);

      const response = await fetch(`/api/admin/users?userId=${user.id}`);
      const result = await response.json();
      console.log('API Response:', response.status, result);

      if (response.ok) {
        setUsers(result.data.users || result.data);
        
        // If store_manager, auto-select their store
        if (user.role === 'store_manager' && user.store_code) {
          setSelectedStore(user.store_code.toString());
        }
      } else {
        setError(result.error?.message || 'Kullanıcılar yüklenemedi');
      }
    } catch (err) {
      setError('Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter stores by search query
  const filteredStores = stores.filter(store => 
    store.store_name.toLowerCase().includes(storeSearchQuery.toLowerCase()) ||
    store.store_code.toString().includes(storeSearchQuery)
  );

  // Get selected store name for display
  const selectedStoreName = selectedStore === 'all' 
    ? 'Tüm Mağazalar' 
    : stores.find(s => s.store_code.toString() === selectedStore)?.store_name || selectedStore;

  // Filter users by selected store
  const filteredUsers = selectedStore === 'all' 
    ? users 
    : users.filter(user => user.store_code.toString() === selectedStore);

  const handleRoleChange = async (userId: string, newRole: 'employee' | 'admin' | 'store_manager') => {
    if (!currentUser) {
      showToast('Oturum bilgisi bulunamadı', 'error');
      return;
    }

    // Confirm role change
    const roleNames = {
      employee: 'Çalışan',
      admin: 'Admin',
      store_manager: 'Mağaza Yöneticisi',
    };

    if (!confirm(`Bu kullanıcının rolünü "${roleNames[newRole]}" olarak değiştirmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole, currentUserId: currentUser.id }),
      });

      if (response.ok) {
        await fetchUsers();
        showToast(`Rol başarıyla "${roleNames[newRole]}" olarak güncellendi!`, 'success');
      } else {
        const result = await response.json();
        showToast(result.error?.message || 'Rol güncellenemedi', 'error');
      }
    } catch (err) {
      showToast('Bir hata oluştu', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <AdminGuard>
      <AdminSidebar />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Kullanıcı Yönetimi</h1>
          
          {/* Store Filter with Search */}
          {currentUser?.role === 'admin' && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mağaza Filtresi:</label>
              <div className="relative">
                <input
                  type="text"
                  value={storeSearchQuery}
                  onChange={(e) => {
                    setStoreSearchQuery(e.target.value);
                    setShowStoreDropdown(true);
                  }}
                  onFocus={() => setShowStoreDropdown(true)}
                  placeholder={selectedStoreName}
                  className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {selectedStore !== 'all' && (
                  <button
                    onClick={() => {
                      setSelectedStore('all');
                      setStoreSearchQuery('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {/* Dropdown */}
              {showStoreDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowStoreDropdown(false)}
                  />
                  <div className="absolute z-20 w-full md:w-80 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedStore('all');
                        setStoreSearchQuery('');
                        setShowStoreDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 border-b border-gray-100"
                    >
                      <span className="font-medium">Tüm Mağazalar</span>
                    </button>
                    {filteredStores.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Mağaza bulunamadı
                      </div>
                    ) : (
                      filteredStores.map((store) => (
                        <button
                          key={store.store_code}
                          onClick={() => {
                            setSelectedStore(store.store_code.toString());
                            setStoreSearchQuery('');
                            setShowStoreDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-blue-50 ${
                            selectedStore === store.store_code.toString() ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{store.store_name}</span>
                            <span className="text-sm text-gray-500">{store.store_code}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Role Info Card */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold mb-2 text-blue-900 text-sm">💡 Rol Açıklamaları:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-blue-800">
            <div>
              <span className="font-semibold">Çalışan:</span> Oyun oynayabilir, kendi istatistiklerini görebilir
            </div>
            <div>
              <span className="font-semibold">Mağaza Yöneticisi:</span> Kendi mağazasının analitik ve eğitim ihtiyacı verilerini görebilir
            </div>
            <div>
              <span className="font-semibold">Admin:</span> Tüm yönetim paneline erişebilir, tüm mağazaları görebilir
            </div>
          </div>
        </div>

        {/* User Count */}
        <div className="mb-4 text-sm text-gray-600">
          Toplam {filteredUsers.length} kullanıcı
        </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı Adı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ad Soyad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mağaza
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.first_name} {user.last_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.store_code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as 'employee' | 'admin' | 'store_manager')}
                    disabled={currentUser?.role === 'store_manager'}
                    className={`px-3 py-1 text-xs font-semibold rounded-full border-2 cursor-pointer transition-colors ${
                      user.role === 'admin'
                        ? 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
                        : user.role === 'store_manager'
                        ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
                        : 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                    } ${currentUser?.role === 'store_manager' ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <option value="employee">Çalışan</option>
                    <option value="store_manager">Mağaza Yöneticisi</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded"
                      title="Kullanıcıyı Düzenle"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleResetPassword(user.id, user.username)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Geçici Şifre Oluştur"
                    >
                      <Key className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleGenerateToken(user.id, user.username)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                      title="Reset Kodu Oluştur"
                    >
                      <Ticket className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Kullanıcıyı Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
            Kullanıcı bulunamadı
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    @{user.username}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Mağaza: {user.store_code}
                  </div>
                </div>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as 'employee' | 'admin' | 'store_manager')}
                  disabled={currentUser?.role === 'store_manager'}
                  className={`px-2 py-1 text-xs font-semibold rounded-full border-2 ${
                    user.role === 'admin'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : user.role === 'store_manager'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-green-100 text-green-800 border-green-300'
                  } ${currentUser?.role === 'store_manager' ? 'opacity-60' : ''}`}
                >
                  <option value="employee">Çalışan</option>
                  <option value="store_manager">Yönetici</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleEditUser(user)}
                  className="px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 flex items-center justify-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Düzenle
                </button>
                <button
                  onClick={() => handleResetPassword(user.id, user.username)}
                  className="px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1"
                >
                  <Key className="h-4 w-4" />
                  Şifre
                </button>
                <button
                  onClick={() => handleGenerateToken(user.id, user.username)}
                  className="px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center justify-center gap-1"
                >
                  <Ticket className="h-4 w-4" />
                  Token
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id, user.username)}
                  className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">💡 Bilgi:</h3>
        <p className="text-sm text-gray-700">
          Kullanıcıları admin yaparak yönetim paneline erişim verebilirsiniz. Admin kullanıcılar
          mağaza, kategori ve soru yönetimi yapabilir.
        </p>
      </div>
      </div>

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={resetModal.isOpen}
        onClose={() => setResetModal((prev) => ({ ...prev, isOpen: false }))}
        type={resetModal.type}
        value={resetModal.value}
        expiresAt={resetModal.expiresAt}
        username={resetModal.username}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, userId: '', username: '', isDeleting: false })}
        onConfirm={confirmDeleteUser}
        username={deleteModal.username}
        isDeleting={deleteModal.isDeleting}
      />

      {/* Edit User Modal */}
      {editModal.isOpen && editModal.user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Kullanıcı Düzenle</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad *
                </label>
                <input
                  type="text"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Soyad *
                </label>
                <input
                  type="text"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kullanıcı Adı *
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mağaza *
                </label>
                <select
                  value={editForm.store_code}
                  onChange={(e) => setEditForm({ ...editForm, store_code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={currentUser?.role === 'store_manager'}
                >
                  {stores.map((store) => (
                    <option key={store.store_code} value={store.store_code}>
                      {store.store_code} - {store.store_name}
                    </option>
                  ))}
                </select>
                {currentUser?.role === 'store_manager' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Mağaza yöneticileri mağaza değiştiremez
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditModal({ isOpen: false, user: null, isSubmitting: false })}
                disabled={editModal.isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleSubmitEdit}
                disabled={editModal.isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {editModal.isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg z-50 ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </AdminGuard>
  );
}
