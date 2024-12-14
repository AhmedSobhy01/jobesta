import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface GlobalErrorPopupProps {
  errorMessage?: string;
  onClose: () => void;
}

const GlobalErrorPopup: React.FC<GlobalErrorPopupProps> = ({
  errorMessage,
  onClose,
}) => {
  if (!errorMessage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-11/12 max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium text-red-600">Error</h3>
          <button
            onClick={onClose}
            className="rounded-full bg-red-50 text-red-500 hover:bg-red-100 focus:outline-none w-8 h-8 flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-800">
            {errorMessage ? errorMessage : 'Error happened'}
          </p>
        </div>
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalErrorPopup;
