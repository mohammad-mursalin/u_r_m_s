import useToastStore from '../../store/toastStore';
import Toast from './Toast';

function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

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
          duration={toast.duration}
          onClose={() => handleClose(toast.id)}
        />
      ))}
    </div>
  );
}

export default ToastContainer;