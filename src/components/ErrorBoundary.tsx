import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback';

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {

  const handleReset = () => {
    // This will reload the page. A more sophisticated implementation could
    // reset state and try again without a full reload.
    window.location.reload();
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={(props) => <ErrorFallback {...props} />}
      onReset={handleReset}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
