
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ReceiptData, ReceiptItem, AppSettings, formatCurrency } from '../types';
import { ArrowLeftIcon, EditIcon, PlusIcon, TrashIcon, CheckIcon } from './Icon';

interface ReceiptReviewViewProps {
  receipt: ReceiptData;
  settings: AppSettings;
  preselectedAccountName: string;
  onBack: () => void;
  onApprove: (approvedReceipt: ReceiptData, action: 'add_more' | 'finish') => void;
}

const ReceiptReviewView: React.FC<ReceiptReviewViewProps> = ({ receipt, settings, preselectedAccountName, onBack, onApprove }) => {
  const [items, setItems] = useState<ReceiptItem[]>(receipt.items);
  const [selectedAccountName, setSelectedAccountName] = useState<string>(preselectedAccountName || settings.accounts[0]?.name || "Gotówka");
  const [receiptDate, setReceiptDate] = useState(receipt.date);
  const [storeName, setStoreName] = useState(receipt.storeName);
  const [receiptTotal, setReceiptTotal] = useState(receipt.total);
  
  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);
  const storeInputRef = useRef<HTMLDivElement>(null);

  const currentAccount = settings.accounts.find(a => a.name === selectedAccountName) || settings.accounts[0];
  const currencyCode = currentAccount?.currency || 'PLN';

  const [editingItem, setEditingItem] = useState<ReceiptItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");

  useEffect(() => {
      if (editingItem) {
          setEditName(editingItem.name);
          setEditPrice(editingItem.price.toString());
          setEditCategory(editingItem.category);
          setCategorySearchTerm("");
      }
  }, [editingItem]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (storeInputRef.current && !storeInputRef.current.contains(event.target as Node)) {
        setShowStoreSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const aggregatedData = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach(item => {
      const current = map.get(item.category) || 0;
      map.set(item.category, current + item.price);
    });
    return Array.from(map.entries()).map(([category, total]) => ({ category, total }));
  }, [items]);

  // Hierarchical categories for selection
  const selectableCategories = useMemo(() => {
      return settings.categories
          .map(c => {
              const fullName = c.parent ? `${c.parent}: ${c.name}` : c.name;
              // Find parent for coloring
              const parentObj = c.parent ? settings.categories.find(p => p.name === c.parent && !p.parent) : c;
              return {
                  ...c,
                  fullName,
                  color: parentObj?.color || '#cbd5e1'
              };
          })
          .filter(c => c.fullName.toLowerCase().includes(categorySearchTerm.toLowerCase()))
          .sort((a, b) => {
              // Group by parent, then child
              const pA = a.parent || a.name;
              const pB = b.parent || b.name;
              if (pA !== pB) return pA.localeCompare(pB);
              if (!a.parent) return -1;
              if (!b.parent) return 1;
              return a.name.localeCompare(b.name);
          });
  }, [settings.categories, categorySearchTerm]);

  // Color lookup for tags in the list
  const getCategoryColor = (catName: string) => {
      // Logic: if format is "Parent: Child", find color of "Parent"
      const parts = catName.split(': ');
      const searchName = parts[0];
      const rootCat = settings.categories.find(c => c.name === searchName && !c.parent);
      return rootCat?.color || '#cbd5e1';
  };

  const storeSuggestions = useMemo(() => {
    if (!storeName.trim() || !showStoreSuggestions) return [];
    const term = storeName.toLowerCase();
    const names = new Set<string>();
    settings.shopMappings.forEach(m => { names.add(m.cleanName); names.add(m.rawName); });
    return Array.from(names).filter(n => n.toLowerCase().includes(term) && n.toLowerCase() !== term).slice(0, 5);
  }, [storeName, settings.shopMappings, showStoreSuggestions]);

  const totalSum = items.reduce((sum, item) => sum + item.price, 0);
  const mathDiscrepancy = Math.abs(totalSum - receiptTotal);
  const isMathPerfect = mathDiscrepancy < 0.02;

  const evaluatePrice = (input: string, baseValue: number): number => {
    const cleaned = input.trim().replace(/,/g, '.');
    if (!cleaned) return 0;
    const isRelative = /^[+\-*/]/.test(cleaned);
    const expression = isRelative ? `(${baseValue})${cleaned}` : cleaned;
    const sanitizedExpression = expression.replace(/[^0-9+\-*/.()]/g, '');
    try {
      const result = new Function(`"use strict"; return (${sanitizedExpression})`)();
      const numResult = typeof result === 'number' && isFinite(result) ? result : baseValue;
      return Math.round(numResult * 100) / 100;
    } catch (e) { return baseValue; }
  };

  const previewPrice = useMemo(() => editingItem ? evaluatePrice(editPrice, editingItem.price) : 0, [editPrice, editingItem]);

  const handleSaveEdit = () => {
    if (!editingItem) return;
    const priceVal = previewPrice;
    const updated: ReceiptItem = { ...editingItem, name: editName, price: priceVal, originalPrice: priceVal, discount: 0, category: editCategory };
    setItems(items.map(i => i.id === editingItem.id ? updated : i));
    setEditingItem(null);
  };

  const handleApprove = (action: 'add_more' | 'finish') => {
      const approvedReceipt: ReceiptData = { ...receipt, storeName, date: receiptDate, total: receiptTotal, items };
      onApprove(approvedReceipt, action);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between mb-2">
            <button onClick={onBack} className="text-gray-600"><ArrowLeftIcon /></button>
            <h1 className="font-bold text-gray-800">Edycja i Przegląd</h1>
            <div className="w-6"></div> 
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="col-span-2 relative" ref={storeInputRef}>
                <label className="block text-xs text-gray-500 mb-1">Sklep</label>
                <input type="text" value={storeName} onFocus={() => setShowStoreSuggestions(true)} onChange={(e) => { setStoreName(e.target.value); setShowStoreSuggestions(true); }} className="w-full bg-gray-100 rounded px-2 py-1.5 font-semibold text-gray-800 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none transition-colors" placeholder="Sklep..." />
                {storeSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-30 overflow-hidden">
                        {storeSuggestions.map(s => <button key={s} onClick={() => { setStoreName(s); setShowStoreSuggestions(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 text-gray-700 font-medium border-b last:border-0 border-gray-100">{s}</button>)}
                    </div>
                )}
            </div>
            <div>
                <label className="block text-xs text-gray-500 mb-1">Data</label>
                <input 
                    type="date" 
                    value={receiptDate} 
                    onChange={(e) => setReceiptDate(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 font-semibold text-gray-800 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors [color-scheme:light]"
                />
            </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="bg-white m-4 p-4 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Przypisane Konto</label>
            <select value={selectedAccountName} onChange={(e) => setSelectedAccountName(e.target.value)} className="w-full p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-900 font-semibold">{settings.accounts.map(acc => <option key={acc.name} value={acc.name}>{acc.name} ({acc.currency})</option>)}</select>
        </div>

        <div className="mx-4 mb-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Podsumowanie ({currencyCode})</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {aggregatedData.map(group => (
                    <div key={group.category} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0 text-sm">
                        <div className="flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full" style={{backgroundColor: getCategoryColor(group.category)}}></span>
                             <span className="font-medium text-gray-700">{group.category}</span>
                        </div>
                        <span className="font-bold text-gray-900">{formatCurrency(group.total, currencyCode)}</span>
                    </div>
                ))}
                <div className="flex flex-col p-3 bg-gray-50 border-t border-gray-200 gap-3">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col"><span className="text-xs text-gray-500 uppercase">Obliczono</span><span className={`font-bold text-lg ${isMathPerfect ? 'text-indigo-600' : 'text-amber-600'}`}>{formatCurrency(totalSum, currencyCode)}</span></div>
                        <div className="flex flex-col items-end"><span className="text-xs text-gray-500 uppercase">Suma Paragonu</span><div className="flex items-center"><span className="text-xs text-gray-400 mr-1">{currencyCode}</span><input type="number" value={receiptTotal} onChange={(e) => setReceiptTotal(parseFloat(e.target.value) || 0)} className={`w-24 text-right bg-transparent border-b font-bold text-lg outline-none ${isMathPerfect ? 'border-gray-300 text-gray-800' : 'border-amber-400 text-amber-700'}`} step="0.01" /></div></div>
                    </div>
                </div>
            </div>
        </div>

        <div className="mx-4">
            <div className="flex justify-between items-center mb-2 px-1"><h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pozycje</h3><button onClick={() => {
                const diff = Math.round((receiptTotal - totalSum) * 100) / 100;
                const price = Math.abs(diff) > 0.005 ? diff : 0;
                const firstCat = settings.categories[0];
                const newItem = { id: Math.random().toString(36).substr(2, 9), name: "Nowa Pozycja", price, originalPrice: price, discount: 0, category: firstCat ? (firstCat.parent ? `${firstCat.parent}: ${firstCat.name}` : firstCat.name) : "Inne" };
                setItems([...items, newItem]);
                setEditingItem(newItem);
            }} className="text-indigo-600 text-xs font-bold flex items-center gap-1"><PlusIcon /> Dodaj</button></div>
            <div className="space-y-2">
                {items.map(item => (
                    <div key={item.id} onClick={() => setEditingItem(item)} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between active:scale-[0.99] transition-transform">
                        <div className="flex-1 min-w-0 pr-2">
                            <div className="flex justify-between items-baseline mb-1">
                                <span className={`text-sm font-medium truncate ${item.id === 'adjustment-auto' ? 'text-indigo-600 italic' : 'text-gray-900'}`}>{item.name}</span>
                                <span className="text-sm font-bold ml-2">{formatCurrency(item.price, currencyCode)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm uppercase tracking-wide" style={{backgroundColor: getCategoryColor(item.category)}}>
                                    {item.category}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex gap-3">
             <button onClick={() => handleApprove('add_more')} className="flex-1 bg-white border-2 border-indigo-600 text-indigo-700 font-bold py-3 px-2 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"><PlusIcon /><span>Dodaj kolejny</span></button>
             <button onClick={() => handleApprove('finish')} className="flex-1 bg-indigo-600 text-white font-bold py-3 px-2 rounded-xl shadow-lg flex items-center justify-center gap-2 active:bg-indigo-700 transition-colors"><CheckIcon /><span>Podsumowanie</span></button>
        </div>
      </div>

      {editingItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-xl text-gray-800">Edytuj Pozycję</h3><button onClick={() => setEditingItem(null)} className="text-gray-500 hover:text-gray-800 font-medium">Anuluj</button></div>
                <div className="space-y-4 mb-6 overflow-y-auto">
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nazwa</label><input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Cena ({currencyCode})</label>
                            {editPrice && editPrice !== editingItem.price.toString() && (
                                <span className="text-[11px] font-bold text-indigo-600 animate-pulse bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                    Wynik: {formatCurrency(previewPrice, currencyCode)}
                                </span>
                            )}
                        </div>
                        <input type="text" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-900 font-bold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00 lub np. +5" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategoria</label>
                        <input type="text" value={categorySearchTerm} onChange={(e) => setCategorySearchTerm(e.target.value)} placeholder="Szukaj..." className="w-full mb-2 bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-indigo-500" />
                        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                            {selectableCategories.map(cat => (
                                <button key={cat.fullName} onClick={() => setEditCategory(cat.fullName)} className={`p-3 rounded-lg text-xs font-bold border text-left transition-all ${editCategory === cat.fullName ? 'border-gray-900 shadow-md ring-2 ring-indigo-200' : 'border-gray-200 hover:bg-gray-50'}`} style={{backgroundColor: editCategory === cat.fullName ? cat.color : '#ffffff'}}>
                                    <span className={`block opacity-80 text-[9px] uppercase tracking-wider ${editCategory === cat.fullName ? 'text-white' : 'text-gray-400'}`}>{cat.parent || 'Główna'}</span>
                                    <span className={editCategory === cat.fullName ? 'text-white' : 'text-gray-800'}>{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 mt-auto"><button onClick={() => { setItems(items.filter(i => i.id !== editingItem.id)); setEditingItem(null); }} className="flex-1 bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors flex justify-center items-center gap-2"><TrashIcon /> Usuń</button><button onClick={handleSaveEdit} className="flex-[2] bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2"><CheckIcon /> Zapisz</button></div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptReviewView;
