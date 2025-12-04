'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/organisms/AdminSidebar';
import { AdminGuard } from '@/components/organisms/AdminGuard';

interface ErrorReport {
  id: string;
  user_id: string;
  question_id: string;
  report_text: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  admin_notes: string | null;
  created_at: string;
  user: { username: string };
  question: { name: string; image_url: string };
}

export default function ErrorReportsPage() {
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const url = filter === 'all' ? '/api/error-reports' : `/api/error-reports?status=${filter}`;
      const response = await fetch(url);
      const result = await response.json();
      if (response.ok) {
        setReports(result.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/error-reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status: newStatus }),
      });

      if (response.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminGuard>
      <AdminSidebar />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Hata Raporları</h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">Tümü</option>
            <option value="pending">Beklemede</option>
            <option value="reviewed">İncelendi</option>
            <option value="resolved">Çözüldü</option>
            <option value="dismissed">Reddedildi</option>
          </select>
        </div>

        {isLoading ? (
          <p>Yükleniyor...</p>
        ) : reports.length === 0 ? (
          <p className="text-gray-600">Rapor bulunamadı</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold">{report.question.name}</p>
                    <p className="text-sm text-gray-600">
                      Kullanıcı: {report.user.username} •{' '}
                      {new Date(report.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{report.report_text}</p>

                <div className="flex gap-2">
                  {report.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(report.id, 'reviewed')}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        İncele
                      </button>
                      <button
                        onClick={() => handleStatusChange(report.id, 'resolved')}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Çözüldü
                      </button>
                      <button
                        onClick={() => handleStatusChange(report.id, 'dismissed')}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                      >
                        Reddet
                      </button>
                    </>
                  )}
                  {report.status === 'reviewed' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(report.id, 'resolved')}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Çözüldü
                      </button>
                      <button
                        onClick={() => handleStatusChange(report.id, 'dismissed')}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                      >
                        Reddet
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
