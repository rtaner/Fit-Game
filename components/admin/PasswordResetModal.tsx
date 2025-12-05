'use client';

import { useState } from 'react';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'password' | 'token';
  value: string;
  expiresAt?: string;
  username: string;
}

export function PasswordResetModal({
  isOpen,
  onClose,
  type,
  value,
  expiresAt,
  username,
}: PasswordResetModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const formatExpiration = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {type === 'password' ? '🔑 Geçici Şifre' : '🎫 Reset Kodu'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kullanıcı Adı
              </label>
              <div className="px-4 py-2 bg-gray-100 rounded-md text-gray-900 font-mono">
                {username}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {type === 'password' ? 'Geçici Şifre' : 'Reset Kodu'}
              </label>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-md text-blue-900 font-mono text-lg font-bold">
                  {value}
                </div>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {copied ? '✓' : '📋'}
                </button>
              </div>
            </div>

            {expiresAt && (
              <div className="text-sm text-gray-600">
                <strong>Geçerlilik:</strong> {formatExpiration(expiresAt)}
                <br />
                <span className="text-yellow-600">
                  (24 saat içinde kullanılmalıdır)
                </span>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Önemli:</strong>
                <br />
                {type === 'password'
                  ? 'Bu şifre sadece bir kez gösterilmektedir. Personele iletin ve ilk girişte değiştirmesini söyleyin.'
                  : 'Bu kodu personele iletin. Kod 24 saat geçerlidir ve tek kullanımlıktır.'}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
