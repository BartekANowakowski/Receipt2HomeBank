import React from 'react';
import { ReceiptData, formatCurrency } from '../types';
import { DownloadIcon, PlusIcon, TrashIcon, EditIcon } from './Icon';

interface BatchSummaryViewProps {
  receipts: ReceiptData[];
  onAddMore: () => void;
  onRestart: () => void;
  onRemoveReceipt: (index: number) => void;
  onEditReceipt: (index: number) => void;
}

const BatchSummaryView: React.FC<BatchSummaryViewProps> = ({ receipts, onAddMore, onRemoveReceipt, onEditReceipt }) => {
  
  const totalSum = receipts.reduce((sum, r) => sum + r.total, 0);

  const getHomeBankMode = (method: string): string => {
      const lower = method.toLowerCase();
      if (lower.includes('gotówka') || lower.includes('cash')) return "3"; 
      if (lower.includes('karta') || lower.includes('card') || lower.includes('visa') || lower.includes('master')) return "1"; 
      return "8"; 
  };

  const generateBatchCSV = () => {
    let csvContent = "";

    receipts.forEach(receipt => {
        // Group items by category and store names + prices for the memo
        const categoryData = new Map<string, { total: number, items: { name: string, price: number }[] }>();
        
        receipt.items.forEach(item => {
            const current = categoryData.get(item.category) || { total: 0, items: [] };
            current.total += item.price;
            current.items.push({ name: item.name, price: item.price });
            categoryData.set(item.category, current);
        });

        const mode = getHomeBankMode(receipt.detectedPaymentMethod);

        Array.from(categoryData.entries()).forEach(([category, data]) => {
            // Sort items by price descending for the memo logic
            const sortedItems = [...data.items].sort((a, b) => b.price - a.price);
            
            let memo = "";
            if (sortedItems.length === 1) {
                // 1 item: use description
                memo = sortedItems[0].name;
            } else if (sortedItems.length <= 3) {
                // 2-3 items: list all, sorted by price
                memo = sortedItems.map(i => i.name).join(", ");
            } else {
                // >3 items: largest + count
                memo = `${sortedItems[0].name} + ${sortedItems.length - 1} innych`;
            }

            const row = [
                receipt.date,
                mode,
                "", // info
                `"${receipt.storeName}"`,
                `"${memo}"`,
                `-${data.total.toFixed(2)}`,
                `"${category}"`,
                "" // tags
            ].join(";");
            csvContent += row + "\n";
        });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `homebank_import_batch_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Podsumowanie Sesji</h1>
        <p className="text-sm text-gray-500">Zeskanowano: {receipts.length} paragon(y)</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {receipts.map((r, idx) => (
            <div 
              key={idx} 
              className="group bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center active:scale-[0.98] transition-all cursor-pointer hover:border-indigo-200 hover:shadow-md"
              onClick={() => onEditReceipt(idx)}
            >
                <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800 text-base truncate">{r.storeName}</span>
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono flex-shrink-0">{r.date}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-400 gap-2">
                        <span>{r.items.length} pozycji</span>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <span className="flex items-center gap-1 text-indigo-500 font-medium">
                           <EditIcon /> Edytuj
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 text-base">
                        {formatCurrency(r.total)}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Don't trigger edit
                        onRemoveReceipt(idx);
                      }} 
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <TrashIcon />
                    </button>
                </div>
            </div>
        ))}
        
        {/* Action: Add More (Moved here between list and total) */}
        <button 
            onClick={onAddMore}
            className="w-full bg-emerald-600 text-white font-bold text-base py-4 px-6 rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-3 active:scale-[0.98] transition-all mt-4 mb-2"
        >
            <PlusIcon />
            <span>Dodaj kolejny paragon</span>
        </button>

        <div className="bg-indigo-600 p-4 rounded-xl shadow-lg flex justify-between items-center">
            <span className="text-indigo-100 font-bold uppercase tracking-wider text-[10px]">Suma Całkowita</span>
            <span className="text-xl font-bold text-white">{formatCurrency(totalSum)}</span>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 p-4 pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {/* Final Action: Download CSV (Now Indigo/Blue to distinguish from green Add button) */}
        <button 
            onClick={generateBatchCSV}
            className="w-full bg-indigo-50 border-2 border-indigo-600 text-indigo-700 font-bold text-lg py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all active:scale-[0.99]"
        >
            <DownloadIcon />
            <span>Pobierz Zbiorczy CSV</span>
        </button>
      </div>
    </div>
  );
};

export default BatchSummaryView;