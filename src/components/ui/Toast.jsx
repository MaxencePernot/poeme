import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

// Fournit une fonction toast() partout dans l'application.
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-fade-up rounded-full px-5 py-2.5 text-sm shadow-lift backdrop-blur ${
              t.type === 'error'
                ? 'bg-rose-50/95 text-rose-700 border border-rose-200'
                : t.type === 'success'
                  ? 'bg-sage-50/95 text-sage-500 border border-sage-200'
                  : 'bg-white/95 text-ink border border-lilac-200'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans un ToastProvider');
  return ctx;
}
