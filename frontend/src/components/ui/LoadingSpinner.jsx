import PropTypes from 'prop-types';
import { RotateCw } from 'lucide-react';

/**
 * LoadingSpinner — shared loading indicator component
 * @param {Object} props
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {string} props.message - optional text below spinner
 */
function LoadingSpinner({ size = 'md', message }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`${sizeClasses[size]} border-blue-500 border-t-transparent rounded-full animate-spin`} />
      {message && <p className="mt-4 text-gray-600 text-sm">{message}</p>}
    </div>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  message: PropTypes.string
};

export default LoadingSpinner;
