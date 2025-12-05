'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/organisms/AdminSidebar';
import { AnalyticsGuard } from '@/components/organisms/AnalyticsGuard';
import { useAuthStore } from '@/stores/useAuthStore';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const adminMenuItems = [
    { href: '/admin/stores', label: 'Mağazalar', icon: '🏪', description: 'Mağaza yönetimi ve ayarları', roles: ['admin'] },
    { href: '/admin/categories', label: 'Kategoriler', icon: '📁', description: 'Soru kategorilerini yönet', roles: ['admin'] },
    { href: '/admin/questions', label: 'Sorular', icon: '❓', description: 'Soru bankası yönetimi', roles: ['admin'] },
    { href: '/admin/badges', label: 'Rozetler', icon: '🏆', description: 'Rozet sistemi ayarları', roles: ['admin'] },
    { href: '/admin/users', label: 'Kullanıcılar', icon: '👥', description: 'Kullanıcı yönetimi ve roller', roles: ['admin'] },
    { href: '/admin/error-reports', label: 'Hata Raporları', icon: '⚠️', description: 'Kullanıcı hata bildirimleri', roles: ['admin'] },
    { href: '/admin/analytics', label: 'Analitik', icon: '📊', description: 'Performans ve istatistikler', roles: ['admin', 'store_manager'] },
    { href: '/admin/training-needs', label: 'Eğitim İhtiyacı', icon: '🎯', description: 'Eğitim ihtiyaç analizi', roles: ['admin', 'store_manager'] },
    { href: '/admin/ai-insights', label: 'AI Eğitim Analizi', icon: '✨', description: 'Yapay zeka destekli eğitim önerileri', roles: ['admin', 'store_manager'] },
  ];

  // Filter menu items based on user role
  const menuItems = adminMenuItems.filter((item) => 
    user && item.roles.includes(user.role)
  );

  const getPanelInfo = () => {
    if (user?.role === 'store_manager') {
      return {
        title: 'Mağaza Yönetimi',
        subtitle: `Mağaza ${user.store_code}`,
        welcome: `Hoş geldiniz, ${user.first_name}!`,
      };
    }
    return {
      title: 'Yönetim Paneli',
      subtitle: 'Admin Dashboard',
      welcome: `Hoş geldiniz, ${user?.first_name}!`,
    };
  };

  const panelInfo = getPanelInfo();

  return (
    <AnalyticsGuard>
      <AdminSidebar />
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{panelInfo.welcome}</h1>
          <p className="text-lg text-gray-600 mt-2">{panelInfo.subtitle}</p>
        </div>

        {/* Info Card */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            📋 Aşağıdaki menüden erişmek istediğiniz sayfayı seçin. Sol üstteki menü butonundan da tüm sayfalara ulaşabilirsiniz.
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6 text-left border-2 border-transparent hover:border-blue-500 group"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Back to Game */}
        <div className="mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full md:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium flex items-center justify-center gap-2"
          >
            <span>🏠</span>
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </AnalyticsGuard>
  );
}
