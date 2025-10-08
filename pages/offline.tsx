import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          {isOnline ? (
            <Wifi className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : (
            <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          )}
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isOnline ? 'Connection Restored!' : 'You\'re Offline'}
          </h1>
          
          <p className="text-gray-600">
            {isOnline 
              ? 'Your internet connection has been restored. You can now access all features.'
              : 'It looks like you\'re not connected to the internet. Some features may be limited.'
            }
          </p>
        </div>

        <div className="space-y-4">
          {isOnline ? (
            <Button 
              onClick={handleGoHome}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Return to AgroTrack+
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleRetry}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again {retryCount > 0 && `(${retryCount})`}
              </Button>
              
              <div className="text-sm text-gray-500">
                <p className="mb-2">While offline, you can still:</p>
                <ul className="text-left space-y-1">
                  <li>• View cached product information</li>
                  <li>• Fill out QC forms (will sync when online)</li>
                  <li>• Browse your dashboard</li>
                  <li>• View order history</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            AgroTrack+ works offline to keep you productive
          </p>
        </div>
      </div>
    </div>
  );
}