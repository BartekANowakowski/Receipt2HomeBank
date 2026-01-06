
import React, { useState, useEffect } from 'react';
import { AppSettings, ReceiptData } from './types';
import { DEFAULT_SETTINGS } from './data/defaultData';
import SettingsView from './components/SettingsView';
import ProcessingView from './components/ProcessingView';
import ReceiptReviewView from './components/ReceiptReviewView';
import BatchSummaryView from './components/BatchSummaryView';
import { CameraIcon, SettingsIcon } from './components/Icon';
import { parseReceiptImage } from './services/geminiService';

enum AppView {
  HOME,
  SETTINGS,
  PROCESSING,
  REVIEW,
  BATCH_SUMMARY
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [processingStatus, setProcessingStatus] = useState<string>("Przygotowywanie...");
  const [settingsInitialTab, setSettingsInitialTab] = useState<'accounts' | 'categories' | 'shops'>('accounts');
  
  // State for the single receipt currently being processed/edited
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData | null>(null);
  
  // State for the batch of confirmed receipts
  const [confirmedReceipts, setConfirmedReceipts] = useState<ReceiptData[]>([]);

  const [error, setError] = useState<string | null>(null);
  
  // New state for pre-selection
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Load settings from local storage on mount
  useEffect(() => {
    // Version bumped to v3 to load new default categories
    const saved = localStorage.getItem('receipt2homebank_settings_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.accounts && typeof parsed.accounts[0] === 'string') {
            setSettings(DEFAULT_SETTINGS);
        } else {
            const { accountMappings, ...cleanSettings } = parsed;
            setSettings(cleanSettings);
        }
      } catch (e) {
        console.error("Failed to parse settings", e);
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
        setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  useEffect(() => {
      if (settings.accounts.length > 0 && !selectedAccountId) {
          setSelectedAccountId(settings.accounts[0].name);
      }
  }, [settings.accounts]);

  const handleSettingsSave = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('receipt2homebank_settings_v3', JSON.stringify(newSettings));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setProcessingStatus("Wgrywanie zdjęcia...");
      setCurrentView(AppView.PROCESSING);
      setError(null);

      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
          const data = await parseReceiptImage(base64String, settings, (status) => {
            setProcessingStatus(status);
          });
          setCurrentReceipt(data);
          setCurrentView(AppView.REVIEW);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
          setCurrentView(AppView.HOME);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReceiptApproval = (approvedReceipt: ReceiptData, action: 'add_more' | 'finish') => {
      const newBatch = [...confirmedReceipts, approvedReceipt];
      setConfirmedReceipts(newBatch);
      setCurrentReceipt(null);

      if (action === 'add_more') {
          setCurrentView(AppView.HOME);
      } else {
          setCurrentView(AppView.BATCH_SUMMARY);
      }
  };

  const handleEditReceiptFromBatch = (index: number) => {
    const receiptToEdit = confirmedReceipts[index];
    // Remove it from the batch while editing to prevent duplicates
    const updatedBatch = confirmedReceipts.filter((_, i) => i !== index);
    setConfirmedReceipts(updatedBatch);
    setCurrentReceipt(receiptToEdit);
    setCurrentView(AppView.REVIEW);
  };

  const openSettings = (tab: 'accounts' | 'categories' | 'shops' = 'accounts') => {
    setSettingsInitialTab(tab);
    setCurrentView(AppView.SETTINGS);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.SETTINGS:
        return (
          <SettingsView 
            settings={settings} 
            onSave={handleSettingsSave} 
            onClose={() => setCurrentView(AppView.HOME)} 
            initialTab={settingsInitialTab}
          />
        );
      
      case AppView.PROCESSING:
        return <ProcessingView status={processingStatus} />;
      
      case AppView.REVIEW:
        if (!currentReceipt) return null;
        return (
          <ReceiptReviewView 
            receipt={currentReceipt}
            settings={settings}
            preselectedAccountName={selectedAccountId}
            onBack={() => setCurrentView(confirmedReceipts.length > 0 ? AppView.BATCH_SUMMARY : AppView.HOME)}
            onApprove={handleReceiptApproval}
          />
        );
      
      case AppView.BATCH_SUMMARY:
          return (
              <BatchSummaryView 
                  receipts={confirmedReceipts}
                  onEditReceipt={handleEditReceiptFromBatch}
                  onAddMore={() => setCurrentView(AppView.HOME)}
                  onRestart={() => {
                      setConfirmedReceipts([]);
                      setCurrentView(AppView.HOME);
                  }}
                  onRemoveReceipt={(index) => {
                      const newBatch = confirmedReceipts.filter((_, i) => i !== index);
                      setConfirmedReceipts(newBatch);
                      if (newBatch.length === 0) {
                          setCurrentView(AppView.HOME);
                      }
                  }}
              />
          );

      case AppView.HOME:
      default:
        return (
          <div className="flex flex-col h-full bg-white overflow-hidden">
            <header className="flex justify-between items-center p-6 pt-10 flex-shrink-0">
              <div className="flex flex-col">
                  <span className="text-gray-400 text-sm font-semibold tracking-wider uppercase">Wersja 1.0</span>
                  <h1 className="text-2xl font-bold text-gray-800">HomeBank Skaner</h1>
              </div>
              <button 
                onClick={() => openSettings('accounts')}
                className="p-3 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <SettingsIcon />
              </button>
            </header>

            <main className="flex-1 flex flex-col items-center px-6 pb-2 min-h-0">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center text-sm w-full max-w-sm flex-shrink-0">
                  {error}
                </div>
              )}

              {confirmedReceipts.length > 0 && (
                  <button 
                    onClick={() => setCurrentView(AppView.BATCH_SUMMARY)}
                    className="mb-4 w-full max-w-sm bg-indigo-50 border border-indigo-200 text-indigo-700 py-3 px-4 rounded-xl flex items-center justify-between shadow-sm animate-pulse flex-shrink-0"
                  >
                      <span className="font-bold text-sm">Sesja w toku ({confirmedReceipts.length})</span>
                      <span className="text-xs bg-indigo-200 px-2 py-1 rounded font-bold">ZOBACZ</span>
                  </button>
              )}

              {/* Account Pre-Selection */}
              <div className="w-full max-w-sm mb-4 flex-shrink-0">
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5 pl-1 tracking-wider">
                    Wybierz Konto dla Paragonu
                </label>
                <div className="relative">
                    <select
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 font-semibold text-base shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {settings.accounts.map(acc => (
                            <option key={acc.name} value={acc.name}>
                                {acc.name} ({acc.currency})
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
              </div>

              {/* Upload Area - Now dynamic */}
              <div className="w-full max-w-sm flex-1 mb-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-indigo-400 transition-colors min-h-[180px]">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                  <CameraIcon />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Skanuj Paragon</h3>
                <p className="text-gray-400 text-center px-8 text-xs leading-relaxed">
                  Zrób zdjęcie lub wgraj plik. <br/>
                  Zostanie przypisany do: <span className="text-indigo-600 font-bold">{selectedAccountId}</span>.
                </p>
              </div>
            </main>

            {/* Footer with Stats */}
            <div className="bg-gray-50 py-4 border-t border-gray-100 flex-shrink-0">
                  <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">Baza Danych</p>
                  <div className="flex gap-2 px-4 justify-center">
                      <button 
                        onClick={() => openSettings('accounts')}
                        className="bg-white flex-1 py-2.5 rounded-xl border border-gray-200 shadow-sm text-center active:scale-95 transition-transform"
                      >
                          <span className="block text-xl font-bold text-gray-800">{settings.accounts.length}</span>
                          <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wide">Konta</span>
                      </button>
                      <button 
                        onClick={() => openSettings('categories')}
                        className="bg-white flex-1 py-2.5 rounded-xl border border-gray-200 shadow-sm text-center active:scale-95 transition-transform"
                      >
                          <span className="block text-xl font-bold text-gray-800">{settings.categories.length}</span>
                          <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wide">Kategorie</span>
                      </button>
                      <button 
                        onClick={() => openSettings('shops')}
                        className="bg-white flex-1 py-2.5 rounded-xl border border-gray-200 shadow-sm text-center active:scale-95 transition-transform"
                      >
                          <span className="block text-xl font-bold text-gray-800">{settings.shopMappings.length}</span>
                          <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wide">Sklepy</span>
                      </button>
                  </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-gray-50 sm:flex sm:items-center sm:justify-center">
      <div className="w-full h-full sm:h-[800px] sm:w-[400px] sm:rounded-[3rem] sm:border-8 sm:border-gray-900 sm:overflow-hidden bg-white shadow-2xl relative">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
