'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validatePasswordStrength } from '@/lib/utils/password-reset';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    resetToken: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean;
    error?: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate password strength on new password change
    if (name === 'newPassword') {
      const validation = validatePasswordStrength(value);
      setPasswordStrength(validation);
      if (!validation.isValid && validation.error) {
        setError(validation.error);
      } else {
        setError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate reset token format
    if (!/^\d{6}$/.test(formData.resetToken)) {
      setError('Reset kodu 6 haneli olmalıdır');
      return;
    }

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    // Validate password strength
    const validation = validatePasswordStrength(formData.newPassword);
    if (!validation.isValid) {
      setError(validation.error || 'Şifre gereksinimleri karşılanmıyor');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          resetToken: formData.resetToken,
          newPassword: formData.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Şifre sıfırlanamadı');
      }

      // Redirect to login page
      router.push('/login?message=Şifreniz başarıyla değiştirildi');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔑 Şifre Sıfırla
          </h1>
          <p className="text-gray-600">
            Admin tarafından verilen reset kodunu kullanarak şifrenizi sıfırlayın.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Kullanıcı Adı
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="resetToken"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reset Kodu (6 Haneli)
            </label>
            <input
              type="text"
              id="resetToken"
              name="resetToken"
              value={formData.resetToken}
              onChange={handleChange}
              required
              maxLength={6}
              pattern="\d{6}"
              placeholder="123456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg tracking-wider"
            />
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Yeni Şifre
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {passwordStrength && !passwordStrength.isValid && (
              <p className="mt-1 text-sm text-red-600">
                {passwordStrength.error}
              </p>
            )}
            {passwordStrength && passwordStrength.isValid && (
              <p className="mt-1 text-sm text-green-600">✓ Güçlü şifre</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Yeni Şifre (Tekrar)
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Şifre Gereksinimleri:</strong>
              <br />
              • En az 8 karakter
              <br />
              • En az bir büyük harf
              <br />
              • En az bir küçük harf
              <br />• En az bir rakam
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
          </button>

          <div className="text-center">
            <a
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Giriş sayfasına dön
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
