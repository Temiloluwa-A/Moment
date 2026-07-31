import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);
let toastCounter = 0;
const TOAST_DURATION = 4200;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(({ type = 'info', title = '', description = '' }) => {
    const id = ++toastCounter;
    const toast = { id, type, title, description };

    setToasts((prev) => [...prev, toast]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, TOAST_DURATION);

    return id;
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-3 px-4 sm:items-end sm:px-6">
        {toasts.map((toast) => {
          const toneClasses =
            toast.type === 'success'
              ? 'border-success/25 bg-surface/95 text-success'
              : toast.type === 'error'
              ? 'border-error/25 bg-surface/95 text-error'
              : toast.type === 'warning'
              ? 'border-primary/25 bg-surface/95 text-primary'
              : 'border-primary/25 bg-surface/95 text-sky-100';

          const icon =
            toast.type === 'success'
              ? 'check_circle'
              : toast.type === 'error'
              ? 'error'
              : toast.type === 'warning'
              ? 'report'
              : 'info';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-3xl border px-4 py-4 shadow-2xl shadow-black/30 backdrop-blur-xl transition duration-300 ${toneClasses}`}
            >
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-xl opacity-90">{icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-5">{toast.title}</p>
                  {toast.description && <p className="mt-1 text-xs leading-5 text-white/70">{toast.description}</p>}
                </div>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="rounded-full p-1 text-white/60 transition hover:text-white"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
