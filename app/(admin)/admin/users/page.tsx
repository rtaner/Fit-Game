'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { AdminSidebar } from '@/components/organisms/AdminSidebar';
import { AdminGuard } from '@/components/organisms/AdminGuard';
import { PasswordResetModal } from '@/components/admin/PasswordResetModal';
import { DeleteConfirmationModal } from '@/components/admin/DeleteConfirmationModal';
import { Key, Ticket, Trash2 } from 'lucide-react';

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  store_code: number;
  role: 'employee' | 'admin';
  created_at: string;
}

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
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

  useEffect(() => {
    fetchUsers();
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

      const response = await fetch(`/api/admin/users?userId=${user.id}`);
      const result = await response.json();

      if (response.ok) {
        setUsers(result.data.users || result.data);
      } else {
        setError(result.error?.message || 'Kullanıcılar yüklenemedi');
      }
    } catch (err) {
      setError('Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'employee' | 'admin') => {
    if (!currentUser) {
      alert('Oturum bilgisi bulunamadı');
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
        alert('Rol başarıyla güncellendi!');
      } else {
        const result = await response.json();
        alert(result.error?.message || 'Rol güncellenemedi');
      }
    } catch (err) {
      alert('Bir hata oluştu');
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
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
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
            {users.map((user) => (
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
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {user.role === 'admin' ? 'Admin' : 'Çalışan'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    {/* Role Change Button */}
                    {user.role === 'employee' ? (
                      <button
                        onClick={() => handleRoleChange(user.id, 'admin')}
                        className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                      >
                        Admin Yap
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRoleChange(user.id, 'employee')}
                        className="text-orange-600 hover:text-orange-900 px-2 py-1 rounded hover:bg-orange-50"
                      >
                        Çalışan Yap
                      </button>
                    )}
                    
                    {/* Password Reset Button */}
                    <button
                      onClick={() => handleResetPassword(user.id, user.username)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Geçici Şifre Oluştur"
                    >
                      <Key className="h-4 w-4" />
                    </button>
                    
                    {/* Generate Token Button */}
                    <button
                      onClick={() => handleGenerateToken(user.id, user.username)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                      title="Reset Kodu Oluştur"
                    >
                      <Ticket className="h-4 w-4" />
                    </button>
                    
                    {/* Delete User Button */}
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
