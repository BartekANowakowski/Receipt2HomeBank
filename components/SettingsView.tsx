
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppSettings, CategoryDef, AccountDef, ShopMap } from '../types';
import { ArrowLeftIcon, PlusIcon, TrashIcon, EditIcon, CheckIcon } from './Icon';
import { PRESET_COLORS } from '../data/defaultData';

interface SettingsViewProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
  onClose: () => void;
  initialTab?: 'accounts' | 'categories' | 'shops';
}

type Tab = 'accounts' | 'categories' | 'shops';

const ColorPicker: React.FC<{
    color: string;
    onChange: (color: string) => void;
}> = ({ color, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={popoverRef}>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm ring-2 ring-gray-100 transition-transform active:scale-95"
                    style={{ backgroundColor: color }}
                />
                <span className="text-xs font-mono text-gray-400 uppercase">{color}</span>
            </div>

            {isOpen && (
                <div className="absolute left-0 top-full mt-2 z-50 bg-white p-3 rounded-2xl shadow-2xl border border-gray-100 min-w-[200px] animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Wybierz kolor</p>
                    <div className="grid grid-cols-5 gap-3">
                        {PRESET_COLORS.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => { onChange(c); setIsOpen(false); }}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-gray-900 shadow-md' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                        <div className="relative w-8 h-8 group">
                            <input 
                                type="color" 
                                value={color} 
                                onChange={(e) => { onChange(e.target.value); }} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                            />
                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600 transition-colors">
                                <PlusIcon />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave, onClose, initialTab = 'accounts' }) => {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [categories, setCategories] = useState<CategoryDef[]>(settings.categories);
  const [accounts, setAccounts] = useState<AccountDef[]>(settings.accounts);
  const [shopMappings, setShopMappings] = useState<ShopMap[]>(settings.shopMappings || []);

  const [newCatParent, setNewCatParent] = useState<string>('__ROOT__');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);

  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountCurrency, setNewAccountCurrency] = useState('PLN');

  const [newShopRaw, setNewShopRaw] = useState('');
  const [newShopClean, setNewShopClean] = useState('');

  const [editingAccount, setEditingAccount] = useState<{original: AccountDef, data: AccountDef} | null>(null);
  const [editingCategory, setEditingCategory] = useState<{original: CategoryDef, data: CategoryDef} | null>(null);
  const [editingShop, setEditingShop] = useState<{original: ShopMap, data: ShopMap} | null>(null);
  
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setIsDeleting(false);
  }, [editingAccount, editingCategory, editingShop]);

  const filteredAccounts = useMemo(() => {
    return accounts
      .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [accounts, searchTerm]);

  const groupedCategories = useMemo(() => {
    const groups: Record<string, CategoryDef[]> = {};
    const topLevelNames = categories.filter(c => !c.parent).map(c => c.name);
    
    topLevelNames.forEach(name => {
        groups[name] = categories.filter(c => c.parent === name).sort((a, b) => a.name.localeCompare(b.name));
    });

    return Object.keys(groups).sort().map(parentName => ({
        parent: categories.find(c => c.name === parentName && !c.parent),
        children: groups[parentName]
    })).filter(g => g.parent);
  }, [categories]);

  const filteredShops = useMemo(() => {
    return shopMappings
      .filter(s => s.rawName.toLowerCase().includes(searchTerm.toLowerCase()) || s.cleanName.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.cleanName.localeCompare(b.cleanName));
  }, [shopMappings, searchTerm]);

  const handleSave = () => {
    onSave({ categories, accounts, shopMappings });
    onClose();
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  const addCategory = () => {
    if (newCatName.trim()) {
      const isRoot = newCatParent === '__ROOT__';
      const parent = isRoot ? undefined : newCatParent;
      setCategories([...categories, { 
          name: newCatName.trim(), 
          description: newCatDesc.trim(),
          parent,
          color: isRoot ? newCatColor : undefined
      }]);
      setNewCatName('');
      setNewCatDesc('');
    }
  };

  const addAccount = () => {
    if (newAccountName.trim()) {
      setAccounts([...accounts, { name: newAccountName.trim(), currency: newAccountCurrency }]);
      setNewAccountName('');
      setNewAccountCurrency('PLN');
    }
  };

  const addShop = () => {
      if (newShopRaw.trim() && newShopClean.trim()) {
          setShopMappings([...shopMappings, { rawName: newShopRaw.trim(), cleanName: newShopClean.trim() }]);
          setNewShopRaw('');
          setNewShopClean('');
      }
  };

  const saveAccountEdit = () => {
    if (editingAccount) {
        setAccounts(prev => prev.map(a => a === editingAccount.original ? editingAccount.data : a));
        setEditingAccount(null);
    }
  };

  const saveCategoryEdit = () => {
    if (editingCategory) {
        setCategories(prev => prev.map(c => c === editingCategory.original ? editingCategory.data : c));
        setEditingCategory(null);
    }
  };

  const saveShopEdit = () => {
    if (editingShop) {
        setShopMappings(prev => prev.map(s => s === editingShop.original ? editingShop.data : s));
        setEditingShop(null);
    }
  };

  const deleteAccount = () => {
    if (editingAccount) {
        setAccounts(prev => prev.filter(a => a !== editingAccount.original));
        setEditingAccount(null);
    }
  };

  const deleteCategory = () => {
    if (editingCategory) {
        setCategories(prev => prev.filter(c => c !== editingCategory.original));
        setEditingCategory(null);
    }
  };

  const deleteShop = () => {
    if (editingShop) {
        setShopMappings(prev => prev.filter(s => s !== editingShop.original));
        setEditingShop(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button 
            onClick={handleSave} 
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            title="Wróć i zapisz"
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Ustawienia</h1>
        <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm">
          Zapisz
        </button>
      </header>

      <div className="flex bg-white border-b border-gray-200 flex-shrink-0">
          <button onClick={() => handleTabChange('accounts')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'accounts' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}>Konta</button>
          <button onClick={() => handleTabChange('categories')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'categories' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}>Kategorie</button>
          <button onClick={() => handleTabChange('shops')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'shops' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}>Sklepy</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="relative flex-shrink-0">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Szukaj..." className="w-full bg-white border border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" />
        </div>

        {activeTab === 'accounts' && (
            <div className="space-y-4">
                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 shadow-sm flex flex-wrap gap-2">
                    <input value={newAccountName} onChange={e => setNewAccountName(e.target.value)} placeholder="Nowa Nazwa Konta" className="flex-[2] min-w-[150px] bg-white text-gray-900 border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <select value={newAccountCurrency} onChange={e => setNewAccountCurrency(e.target.value)} className="flex-1 min-w-[80px] bg-white text-gray-900 border border-gray-300 rounded-lg p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="PLN">PLN</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                    </select>
                    <button onClick={addAccount} className="p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm active:scale-95 transition-transform"><PlusIcon/></button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {filteredAccounts.map((acc, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-3"><span className="font-semibold text-gray-700">{acc.name}</span><span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">{acc.currency}</span></div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setEditingAccount({original: acc, data: {...acc}})} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"><EditIcon /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'categories' && (
            <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-1">
                            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 ml-1">Kategoria</label>
                            <select value={newCatParent} onChange={e => setNewCatParent(e.target.value)} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900">
                                <option value="__ROOT__">(Nowa Główna)</option>
                                {categories.filter(c => !c.parent).sort((a,b)=>a.name.localeCompare(b.name)).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 ml-1">{newCatParent === '__ROOT__' ? 'Nazwa' : 'Podkategoria'}</label>
                            <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Wpisz nazwę..." className="w-full p-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                        </div>
                    </div>
                    {newCatParent === '__ROOT__' && (
                        <div>
                            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 ml-1">Kolor Kategorii</label>
                            <ColorPicker color={newCatColor} onChange={setNewCatColor} />
                        </div>
                    )}
                    <div>
                        <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 ml-1">Opis (Kontekst dla AI)</label>
                        <input value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} placeholder="np. Wydatki na paliwo..." className="w-full p-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                    </div>
                    <button onClick={addCategory} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm flex justify-center items-center gap-2 hover:bg-indigo-700 shadow-sm active:scale-95 transition-transform"><PlusIcon/> Dodaj</button>
                </div>

                <div className="space-y-6">
                    {groupedCategories.map((group) => (
                        <div key={group.parent!.name} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200 flex justify-between items-center group">
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: group.parent!.color || '#cbd5e1'}}></span>
                                        {group.parent!.name}
                                    </h3>
                                    {group.parent!.description && <p className="text-[10px] text-gray-400 italic">{group.parent!.description}</p>}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setEditingCategory({original: group.parent!, data: {...group.parent!}})} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"><EditIcon /></button>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {group.children.map(child => (
                                    <div key={child.name} className="flex justify-between items-center p-4 pl-8 hover:bg-gray-50 transition-colors group">
                                        <div className="flex-1">
                                            <span className="text-sm font-medium text-gray-700">{child.name}</span>
                                            {child.description && <p className="text-[10px] text-gray-400 mt-0.5">{child.description}</p>}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setEditingCategory({original: child, data: {...child}})} className="p-1.5 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"><EditIcon /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'shops' && (
            <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm space-y-3">
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest pl-1">Nowe mapowanie sklepu</p>
                    <input value={newShopRaw} onChange={e => setNewShopRaw(e.target.value)} placeholder="Nazwa z paragonu (np. CARREFOUR POLSKA)" className="w-full p-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                    <input value={newShopClean} onChange={e => setNewShopClean(e.target.value)} placeholder="Czysta Nazwa (np. Carrefour)" className="w-full p-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900" />
                    <button onClick={addShop} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm flex justify-center items-center gap-2 hover:bg-indigo-700 shadow-sm active:scale-95 transition-transform"><PlusIcon/> Dodaj</button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {filteredShops.map((map, idx) => (
                        <div key={idx} className="flex flex-col p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group">
                             <div className="flex justify-between items-start">
                                <div className="space-y-2 flex-1">
                                    <div><span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-0.5">Nazwa na paragonie (OCR)</span><div className="text-sm font-mono text-gray-600 bg-gray-50 p-1.5 rounded border border-gray-100">{map.rawName}</div></div>
                                    <div><span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest block mb-0.5">Twoja nazwa w aplikacji</span><div className="font-bold text-gray-800">{map.cleanName}</div></div>
                                </div>
                                <div className="flex flex-col gap-1 items-end">
                                    <button onClick={() => setEditingShop({original: map, data: {...map}})} className="p-1.5 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"><EditIcon /></button>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {editingAccount && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg text-gray-800">Edytuj Konto</h3>
                    {!isDeleting && (
                        <button type="button" onClick={() => setIsDeleting(true)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><TrashIcon /></button>
                    )}
                </div>
                <div className="space-y-4">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nazwa Konta</label><input value={editingAccount.data.name} onChange={e => setEditingAccount({...editingAccount, data: {...editingAccount.data, name: e.target.value}})} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Waluta</label><select value={editingAccount.data.currency} onChange={e => setEditingAccount({...editingAccount, data: {...editingAccount.data, currency: e.target.value}})} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900"><option value="PLN">PLN</option><option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option></select></div>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                    {isDeleting ? (
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-xs font-bold text-red-600 text-center">Czy na pewno usunąć to konto?</p>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setIsDeleting(false)} className="flex-1 py-2.5 font-bold text-gray-500 bg-white border border-gray-200 rounded-lg text-sm">Anuluj</button>
                                <button type="button" onClick={deleteAccount} className="flex-1 py-2.5 font-bold text-white bg-red-600 rounded-lg text-sm">TAK, USUŃ</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setEditingAccount(null)} className="flex-1 py-3 font-bold text-gray-500 bg-gray-100 rounded-xl">Anuluj</button>
                            <button type="button" onClick={saveAccountEdit} className="flex-1 py-3 font-bold text-white bg-indigo-600 rounded-xl flex items-center justify-center gap-2"><CheckIcon /> Zapisz</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {editingCategory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg text-gray-800">Edytuj Kategorię</h3>
                    {!isDeleting && (
                        <button type="button" onClick={() => setIsDeleting(true)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><TrashIcon /></button>
                    )}
                </div>
                <div className="space-y-4">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kategoria Nadrzędna</label><select value={editingCategory.data.parent || '__ROOT__'} onChange={e => setEditingCategory({...editingCategory, data: {...editingCategory.data, parent: e.target.value === '__ROOT__' ? undefined : e.target.value}})} className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900"><option value="__ROOT__">(Główna)</option>{categories.filter(c => !c.parent && c.name !== editingCategory.data.name).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nazwa</label><input value={editingCategory.data.name} onChange={e => setEditingCategory({...editingCategory, data: {...editingCategory.data, name: e.target.value}})} className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900" /></div>
                    {!editingCategory.data.parent && (
                        <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kolor</label><ColorPicker color={editingCategory.data.color || PRESET_COLORS[0]} onChange={(c) => setEditingCategory({...editingCategory, data: {...editingCategory.data, color: c}})} /></div>
                    )}
                    <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Opis</label><input value={editingCategory.data.description} onChange={e => setEditingCategory({...editingCategory, data: {...editingCategory.data, description: e.target.value}})} className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900" /></div>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                    {isDeleting ? (
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-xs font-bold text-red-600 text-center">Usunąć kategorię "{editingCategory.data.name}"?</p>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setIsDeleting(false)} className="flex-1 py-2.5 font-bold text-gray-500 bg-white border border-gray-200 rounded-lg text-sm">Anuluj</button>
                                <button type="button" onClick={deleteCategory} className="flex-1 py-2.5 font-bold text-white bg-red-600 rounded-lg text-sm">USUŃ</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setEditingCategory(null)} className="flex-1 py-3 font-bold text-gray-500 bg-gray-100 rounded-xl">Anuluj</button>
                            <button type="button" onClick={saveCategoryEdit} className="flex-1 py-3 font-bold text-white bg-indigo-600 rounded-xl flex items-center justify-center gap-2"><CheckIcon /> Zapisz</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {editingShop && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg text-gray-800">Edytuj Sklep</h3>
                    {!isDeleting && (
                        <button type="button" onClick={() => setIsDeleting(true)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><TrashIcon /></button>
                    )}
                </div>
                <div className="space-y-4">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nazwa na paragonie</label><input value={editingShop.data.rawName} onChange={e => setEditingShop({...editingShop, data: {...editingShop.data, rawName: e.target.value}})} className="w-full p-3 rounded-xl border border-gray-300 font-mono bg-white text-gray-900" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Twoja nazwa</label><input value={editingShop.data.cleanName} onChange={e => setEditingShop({...editingShop, data: {...editingShop.data, cleanName: e.target.value}})} className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-900" /></div>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                    {isDeleting ? (
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-xs font-bold text-red-600 text-center">Usunąć mapowanie sklepu?</p>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setIsDeleting(false)} className="flex-1 py-2.5 font-bold text-gray-500 bg-white border border-gray-200 rounded-lg text-sm">Anuluj</button>
                                <button type="button" onClick={deleteShop} className="flex-1 py-2.5 font-bold text-white bg-red-600 rounded-lg text-sm">USUŃ</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setEditingShop(null)} className="flex-1 py-3 font-bold text-gray-500 bg-gray-100 rounded-xl">Anuluj</button>
                            <button type="button" onClick={saveShopEdit} className="flex-1 py-3 font-bold text-white bg-indigo-600 rounded-xl flex items-center justify-center gap-2"><CheckIcon /> Zapisz</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
