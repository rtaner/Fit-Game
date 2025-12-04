'use client';

import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-slate-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          İnternet Bağlantısı Yok
        </h1>
        
        <p className="text-slate-600 mb-6">
          Şu anda çevrimdışısınız. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.
        </p>
        
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Tekrar Dene
        </button>
        
        <p className="text-sm text-slate-500 mt-6">
          Bazı önceden yüklenmiş içerikler çevrimdışı kullanılabilir olabilir.
        </p>
      </div>
    </div>
  );
}
