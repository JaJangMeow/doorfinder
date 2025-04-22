
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onClose: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
      <div className="bg-background p-4 rounded-lg shadow-lg max-w-md">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center text-amber-500">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Error</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;
