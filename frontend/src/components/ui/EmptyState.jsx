import PropTypes from 'prop-types';
import { Inbox } from 'lucide-react';

/**
 * EmptyState — shared empty state display component
 * @param {Object} props
 * @param {string} props.message - message to display
 * @param {string} props.actionLabel - optional button label
 * @param {Function} props.onAction - optional button click handler
 */
function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="h-16 w-16 text-gray-400 mb-4" />
      <p className="text-gray-600 text-lg">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  message: PropTypes.string.isRequired,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func
};

export default EmptyState;
