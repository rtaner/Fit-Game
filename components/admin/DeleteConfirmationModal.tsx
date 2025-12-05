'use client';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username: string;
  isDeleting?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  username,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            ⚠️ Kullanıcı Silme
          </h2>

          <div className="space-y-4">
            <p className="text-gray-700">
              <strong>{username}</strong> kullanıcısını silmek istediğinizden
              emin misiniz?
            </p>

            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">
                <strong>Bu işlem geri alınamaz!</strong>
                <br />
                Kullanıcının tüm verileri (oyun geçmişi, rozetler, istatistikler)
                silinecektir.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              İptal
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
