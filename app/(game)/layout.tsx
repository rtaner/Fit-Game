'use client';

import { usePathname } from 'next/navigation';
import { BottomNavigation } from '@/components/organisms/BottomNavigation';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Oyun sayfasında bottom navigation gösterme
  const isPlayPage = pathname?.startsWith('/play/');
  
  return (
    <div className={`min-h-screen bg-background ${!isPlayPage ? 'pb-16' : ''}`}>
      {children}
      {!isPlayPage && <BottomNavigation />}
    </div>
  );
}
