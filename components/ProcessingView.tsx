import React from 'react';

interface ProcessingViewProps {
  status: string;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ status }) => {
  return (
    <div className="flex flex-col h-full items-center justify-center p-8 bg-white">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-gray-100 rounded-full animate-ping opacity-75"></div>
        <div className="absolute inset-0 border-4 border-t-indigo-600 border-gray-100 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🧾</span>
        </div>
      </div>
      
      <div className="text-center h-16">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {status}
        </h2>
        <p className="text-gray-500 text-center max-w-xs text-sm">
          Analiza paragonu, automatyczne przypisywanie kategorii, liczenie wartości...
        </p>
      </div>
    </div>
  );
};

export default ProcessingView;