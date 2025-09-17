import React from 'react';

interface Props {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<Props> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4 text-center">
      <h2 className="text-2xl font-bold text-red-700 mb-4">Something went wrong.</h2>
      <pre className="bg-white p-4 rounded-lg text-left text-sm text-red-600 overflow-auto max-w-full">
        {error.message}
      </pre>
      <button 
        onClick={resetErrorBoundary}
        className="mt-6 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorFallback;
