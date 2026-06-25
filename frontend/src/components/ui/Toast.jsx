import PropTypes from 'prop-types';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * Toast — individual toast notification component
 * @param {Object} props
 * @param {string} props.id - unique toast identifier
 * @param {string} props.message - toast message text
 * @param {string} props.type - 'success' | 'error' | 'warning' | 'info'
 * @param {Function} props.onClose - callback to remove this toast
 */
function Toast({ id, message, type, onClose }) {
  const typeStyles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      textColor: 'text-green-800'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      textColor: 'text-red-800'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
      textColor: 'text-yellow-800'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: <Info className="h-5 w-5 text-blue-600" />,
      textColor: 'text-blue-800'
    }
  };

  const styles = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`${styles.bg} border ${styles.textColor.replace('text', 'border')} rounded-lg p-4 shadow-lg flex items-start gap-3 animate-slide-in`}
      role="alert"
    >
      <span className="mt-0.5">{styles.icon}</span>
      <p className={`flex-1 font-medium ${styles.textColor}`}>{message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

Toast.propTypes = {
  id: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  onClose: PropTypes.func.isRequired
};

export default Toast;
