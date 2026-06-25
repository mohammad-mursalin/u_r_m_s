import { useEffect } from 'react';
import { X } from 'lucide-react';
import useToastStore from '../../store/toastStore';
import Toast from './Toast';

function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      toasts.forEach(toast => {
        if (toast.timer) {
          clearTimeout(toast.timer);
        }
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [toasts]);

  const handleClose = (id) => {
    removeToast(id);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-80">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => handleClose(toast.id)}
        />
      ))}
    </div>
  );
}

export default ToastContainer;
