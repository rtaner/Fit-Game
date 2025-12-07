'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Admin sees all menu items
  const adminNavItems = [
    { href: '/admin/stores', label: 'Mağazalar', icon: '🏪', roles: ['admin'] },
    { href: '/admin/categories', label: 'Kategoriler', icon: '📁', roles: ['admin'] },
    { href: '/admin/questions', label: 'Sorular', icon: '❓', roles: ['admin'] },
    { href: '/admin/badges', label: 'Rozetler', icon: '🏆', roles: ['admin'] },
    { href: '/admin/users', label: 'Kullanıcılar', icon: '👥', roles: ['admin', 'store_manager'] },
    { href: '/admin/error-reports', label: 'Hata Raporları', icon: '⚠️', roles: ['admin'] },
    { href: '/admin/analytics', label: 'Analitik', icon: '📊', roles: ['admin', 'store_manager'] },
    { href: '/admin/training-needs', label: 'Eğitim İhtiyacı', icon: '🎯', roles: ['admin', 'store_manager'] },
    { href: '/admin/ai-insights', label: 'AI Eğitim Analizi', icon: '✨', roles: ['admin', 'store_manager'] },
  ];

  // Filter nav items based on user role
  const navItems = adminNavItems.filter((item) => 
    user && item.roles.includes(user.role)
  );

  // Get panel title based on role
  const getPanelTitle = () => {
    if (user?.role === 'store_manager') {
      return {
        title: 'Mağaza Yönetimi',
        subtitle: `Mağaza ${user.store_code}`,
      };
    }
    return {
      title: 'Yönetim Paneli',
      subtitle: 'Admin Dashboard',
    };
  };

  const panelInfo = getPanelTitle();

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 p-3 bg-white text-gray-800 rounded-xl hover:bg-gray-50 shadow-lg border border-gray-200 transition-all"
        aria-label="Menü"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="mb-6 mt-16">
            <h2 className="text-2xl font-bold text-gray-800">{panelInfo.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{panelInfo.subtitle}</p>
          </div>

          {/* Dashboard Link - Top */}
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-2xl">🏠</span>
            <span className="font-medium">Ana Sayfa</span>
          </a>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
