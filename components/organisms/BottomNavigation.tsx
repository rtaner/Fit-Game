'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Trophy, User, BookOpen, Play } from 'lucide-react';
import { Z_INDEX } from '@/constants/design-system';
import { useState, useEffect } from 'react';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const leftNavItems: NavItem[] = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Ana Sayfa',
  },
  {
    href: '/training',
    icon: BookOpen,
    label: 'Eğitim',
  },
];

const rightNavItems: NavItem[] = [
  {
    href: '/leaderboard',
    icon: Trophy,
    label: 'Sıralama',
  },
  {
    href: '/profile',
    icon: User,
    label: 'Profil',
  },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    // Kategorileri çek
    fetch('/api/categories')
      .then(res => res.json())
      .then(result => {
        if (result.data) {
          setCategories(result.data);
        }
      })
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  const handlePlayClick = () => {
    // Tüm kategoriler varsa onu başlat, yoksa ilk kategoriyi
    const allCategoriesId = categories.find(c => c.is_all_categories)?.id;
    if (allCategoriesId) {
      router.push(`/play/${allCategoriesId}`);
    } else if (categories.length > 0) {
      router.push(`/play/${categories[0].id}`);
    }
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/50 safe-area-inset-bottom"
      style={{ zIndex: Z_INDEX.bottomNav }}
    >
      <div className="flex items-center justify-between h-[72px] max-w-lg mx-auto px-6 relative">
        {/* Left Nav Items */}
        <div className="flex items-center gap-4">
          {leftNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-colors ${
                  isActive
                    ? 'text-mavi-navy'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Icon className="h-6 w-6 transition-colors" />
                </motion.div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Center Play Button */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handlePlayClick}
            className="w-16 h-16 bg-gradient-to-br from-[#002D66] to-[#0E487A] rounded-full shadow-xl shadow-[#002D66]/40 flex items-center justify-center mb-1"
          >
            <Play className="h-7 w-7 text-white fill-white" />
          </motion.button>
          <span className="text-[10px] font-medium text-mavi-navy">Oyna</span>
        </div>

        {/* Right Nav Items */}
        <div className="flex items-center gap-4">
          {rightNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-colors ${
                  isActive
                    ? 'text-mavi-navy'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Icon className="h-6 w-6 transition-colors" />
                </motion.div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
