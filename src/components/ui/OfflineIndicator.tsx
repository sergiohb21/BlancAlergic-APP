import React, { useState, useEffect } from 'react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus && isOnline) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 ${
      isOnline
        ? 'bg-green-500 text-white'
        : 'bg-red-500 text-white'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        isOnline ? 'bg-white' : 'bg-white animate-pulse'
      }`}></div>
      <span className="text-sm font-medium">
        {isOnline ? '🟢 Conectado' : '🔴 Sin conexión'}
      </span>
      {!isOnline && (
        <span className="text-xs opacity-90 ml-1">
          (Modo offline activado)
        </span>
      )}
    </div>
  );
};

export const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${
        isOnline ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      <span className="text-xs text-gray-600">
        {isOnline ? 'En línea' : 'Sin conexión'}
      </span>
    </div>
  );
};