
import React from 'react';
import { X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onClose: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
  return (
    <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-10">
      {message}
      <button 
        onClick={onClose}
        className="absolute right-2 top-2"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default ErrorMessage;
