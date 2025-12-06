'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ForceTermsModalProps {
  userId: string;
  onAccept: () => void;
}

export function ForceTermsModal({ userId, onAccept }: ForceTermsModalProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    
    try {
      const response = await fetch('/api/users/accept-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        onAccept();
      } else {
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Error accepting terms:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header - Fixed */}
        <div className="p-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Kullanım Şartlarımız Güncellendi</h2>
              <p className="text-sm text-gray-600">Devam etmek için lütfen okuyup onaylayın</p>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div 
          className="flex-1 overflow-y-auto p-6"
          onScroll={handleScroll}
        >
          <div className="space-y-6 text-sm text-gray-700">
            {/* Section 1 */}
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-base">1. UYGULAMA HAKKINDA</h3>
              <ul className="space-y-1 ml-4">
                <li>• Bu uygulama resmi bir şirket ürünü DEĞİLDİR.</li>
                <li>• Kâr amacı gütmeyen, kişisel gelişim ve eğitim amaçlı deneysel bir prototiptir.</li>
                <li>• Şirket yönetimi tarafından talep edilmemiş veya onaylanmamıştır.</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-base">2. İÇERİK DOĞRULUĞU VE SORUMLULUK</h3>
              <ul className="space-y-1 ml-4">
                <li>• Uygulama içerisindeki sorular, yanıtlar, model isimleri ve koleksiyon bilgileri; halka açık veriler ve yapay zeka modelleri kullanılarak derlenmiştir; hata veya güncellik sorunu olabilir.</li>
                <li>• Müşteriyle iletişimde ve satış süreçlerinde doğabilecek hatalı bilgilendirmelerden geliştirici sorumlu tutulamaz.</li>
                <li>• Kesin bilgi için daima resmi şirket kataloglarını ve ürün etiketlerini esas alınız.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-base">3. KİŞİSEL VERİLER</h3>
              <p className="font-semibold mb-1">Toplanan veriler:</p>
              <ul className="space-y-1 ml-4 mb-3">
                <li>• Ad, soyad, kullanıcı adı, mağaza bilgisi.</li>
                <li>• Oyun performans verileri (puanlar, doğru/yanlış cevaplar).</li>
              </ul>
              <p className="font-semibold mb-1">Kullanım amacı:</p>
              <ul className="space-y-1 ml-4">
                <li>• Sadece eğitim takibi, performans analizi ve deneyimi kişiselleştirmek içindir.</li>
                <li>• Veriler ticari amaçla kullanılmaz veya satılmaz.</li>
              </ul>
            </div>

            {/* Section 4 - Warning */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
              <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2 text-base">
                <span className="text-xl">⚠️</span>
                4. ÖNEMLİ GÜVENLİK UYARISI
              </h3>
              <ul className="space-y-2 ml-4 text-red-800">
                <li className="font-semibold">• Bu uygulamada ASLA şirket hesaplarınızda (e-posta, ERP) veya bankacılık işlemlerinizde kullandığınız sicil kodu ve şifreleri KULLANMAYINIZ.</li>
                <li>• Sadece bu uygulama için basit ve önemsiz bir şifre (örn: 123456) belirleyiniz.</li>
                <li>• Uygulama "deneme sürümü" olduğundan üst düzey veri güvenliği taahhüt etmez.</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-base">5. FİKRİ MÜLKİYET</h3>
              <ul className="space-y-1 ml-4">
                <li>• Marka adları, koleksiyon isimleri ve görseller ilgili hak sahiplerinin mülkiyetindedir.</li>
                <li>• Ticari bir amaç gütmeksizin, sadece eğitim amaçlı "adil kullanım" çerçevesinde yer almaktadır.</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
              <h3 className="font-bold text-blue-900 mb-2 text-base">6. KABUL BEYANI</h3>
              <p className="text-blue-800 ml-4">
                "Kabul Et ve Devam Et" butonuna tıklayarak:
              </p>
              <ul className="space-y-1 ml-8 mt-2 text-blue-800">
                <li>• Uygulamanın resmi olmadığını, hatalı bilgi içerebileceğini,</li>
                <li>• Güvenlik uyarılarını okuduğunuzu ve</li>
                <li>• Bu şartları kabul ettiğinizi beyan edersiniz.</li>
              </ul>
            </div>

            {/* Scroll indicator */}
            {!hasScrolledToBottom && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 animate-pulse">
                  ↓ Lütfen aşağı kaydırarak tüm şartları okuyun ↓
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 pt-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
              hasScrolledToBottom ? 'bg-green-100' : 'bg-gray-200'
            }`}>
              {hasScrolledToBottom && <CheckCircle className="w-4 h-4 text-green-600" />}
            </div>
            <p className="text-sm text-gray-700">
              Yukarıdaki kullanım şartlarını ve sorumluluk reddini okudum, anladım ve kabul ediyorum.
              <span className="block text-xs text-gray-500 mt-1">(Güncelleme: 06.12.2024)</span>
            </p>
          </div>
          
          <button
            onClick={handleAccept}
            disabled={!hasScrolledToBottom || isAccepting}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg disabled:shadow-none"
          >
            {isAccepting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Kaydediliyor...</span>
              </div>
            ) : (
              'Kabul Et ve Devam Et'
            )}
          </button>
          
          {!hasScrolledToBottom && (
            <p className="text-xs text-center text-gray-500 mt-3">
              Devam etmek için lütfen tüm şartları okuyun
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
