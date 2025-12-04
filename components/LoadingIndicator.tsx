import React, { useEffect, useState } from 'react';

export const LoadingIndicator: React.FC = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="flex space-x-2">
        {/* Animated pixel boxes */}
        <div className="w-4 h-4 bg-black animate-bounce delay-75"></div>
        <div className="w-4 h-4 bg-black animate-bounce delay-150"></div>
        <div className="w-4 h-4 bg-black animate-bounce delay-300"></div>
      </div>
      <p className="font-pixel text-2xl uppercase">Processing Audio{dots}</p>
      <p className="font-pixel text-sm text-gray-600">This may take a moment...</p>
    </div>
  );
};
