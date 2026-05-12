/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Receipt, 
  TrendingUp, 
  Plus, 
  ArrowRight, 
  LayoutDashboard, 
  History,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Trash2,
  DollarSign
} from 'lucide-react';
import Dropzone from './components/Dropzone';
import { extractReceiptData } from './services/geminiService';
import { ReceiptRecord, Category } from './types';

// Helper to get category icons
const CATEGORY_ICONS: Record<Category, string> = {
  Food: '🍴',
  Transport: '🚗',
  Supplies: '📦',
  Utilities: '💡',
  Travel: '✈️',
  Other: '✨'
};

const CATEGORY_COLORS: Record<Category, string> = {
  Food: 'text-gold border border-gold/40 bg-gold/5',
  Transport: 'text-gold border border-gold/40 bg-gold/5',
  Supplies: 'text-gold border border-gold/40 bg-gold/5',
  Utilities: 'text-gold border border-gold/40 bg-gold/5',
  Travel: 'text-gold border border-gold/40 bg-gold/5',
  Other: 'text-gold border border-gold/40 bg-gold/5'
};

export default function App() {
  const [records, setRecords] = useState<ReceiptRecord[]>(() => {
    const saved = localStorage.getItem('fin-extract-records');
    return saved ? JSON.parse(saved) : [];
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('fin-extract-records', JSON.stringify(records));
  }, [records]);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      const base64 = await base64Promise;
      const imageUrl = URL.createObjectURL(file);
      
      const extraction = await extractReceiptData(base64, file.type);
      
      const newRecord: ReceiptRecord = {
        ...extraction,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        imageUrl
      };

      setRecords(prev => [newRecord, ...prev]);
    } catch (err) {
      console.error(err);
      setError('Failed to extract data. Please ensure the image is clear.');
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const totalSpent = records.reduce((acc, r) => acc + (r.total_amount || 0), 0);
  const recentRecords = records.slice(0, 5);

  return (
    <div className="min-h-screen bg-zinc-950 text-[#E0E0E0] font-sans selection:bg-gold/30 selection:text-white">
      {/* Sidebar / Navigation */}
      <nav className="fixed left-0 top-0 h-full w-20 md:w-64 bg-zinc-900 border-r border-zinc-800 z-50 transition-all duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gold rounded-sm flex items-center justify-center text-zinc-950">
            <Receipt className="w-6 h-6" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-light tracking-widest uppercase font-serif text-gold">FinExtract Pro</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted">Intelligence OCR</p>
          </div>
        </div>

        <div className="mt-8 px-4 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 p-3 rounded-sm transition-all border ${activeTab === 'dashboard' ? 'bg-gold/5 text-gold border-gold/40' : 'text-zinc-500 hover:bg-zinc-800 border-transparent'}`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span className="font-light text-xs uppercase tracking-widest hidden md:block">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-4 p-3 rounded-sm transition-all border ${activeTab === 'history' ? 'bg-gold/5 text-gold border-gold/40' : 'text-zinc-500 hover:bg-zinc-800 border-transparent'}`}
          >
            <History className="w-5 h-5 flex-shrink-0" />
            <span className="font-light text-xs uppercase tracking-widest hidden md:block">History</span>
          </button>
        </div>

        <div className="absolute bottom-8 px-4 w-full">
          <div className="bg-[#080809] border border-zinc-800 rounded-sm p-4 hidden md:block">
            <p className="text-muted text-[9px] uppercase tracking-widest mb-2 font-mono">System Liquid Liquidity</p>
            <p className="text-white text-xl font-mono">${totalSpent.toFixed(2)}</p>
            <div className="mt-4 bg-zinc-800 rounded-full h-[1px] w-full overflow-hidden">
              <div className="bg-gold h-full w-2/3 shadow-[0_0_8px_#C5A059]"></div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pl-20 md:pl-64 pt-6 pb-24 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 border-b border-zinc-800 pb-8">
            <div>
              <h2 className="text-2xl font-serif italic text-white tracking-wide">
                {activeTab === 'dashboard' ? 'Neural Document Intelligence' : 'Extraction Archives'}
              </h2>
              <p className="text-muted text-[10px] uppercase tracking-[0.3em] mt-2">
                {activeTab === 'dashboard' ? 'High Precision Financial Extraction' : 'Historical Data Processing Logs'}
              </p>
            </div>
            
            {activeTab === 'dashboard' && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => document.getElementById('dropzone-container')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-transparent border border-gold text-gold px-6 py-2 rounded-none text-xs uppercase tracking-[0.2em] hover:bg-gold hover:text-zinc-950 transition-all shadow-[0_0_15px_rgba(197,160,89,0.1)]"
                >
                  <Plus className="w-3 h-3 inline mr-2" /> Extract New
                </button>
              </div>
            )}
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Left Column: Dropzone & Recent */}
                <div className="lg:col-span-2 space-y-8">
                  <Dropzone onFileSelect={handleFileSelect} isProcessing={isProcessing} />

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-700"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm font-medium">{error}</p>
                    </motion.div>
                  )}

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs uppercase tracking-[0.3em] text-gold">Latest Intelligence Extractions</h3>
                      <button 
                        onClick={() => setActiveTab('history')}
                        className="text-muted text-[10px] uppercase tracking-widest flex items-center gap-1 hover:text-gold transition-all"
                      >
                        Review all Logs <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid gap-4">
                      {recentRecords.length === 0 ? (
                        <div className="bg-[#080809] border border-zinc-800 rounded-sm p-16 text-center">
                          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Receipt className="w-8 h-8 text-zinc-700" />
                          </div>
                          <p className="text-white font-serif italic text-lg">No archives detected</p>
                          <p className="text-muted text-[10px] uppercase tracking-[0.2em] mt-2">Initialize your first document scan</p>
                        </div>
                      ) : (
                        recentRecords.map(record => (
                          <motion.div
                            layout
                            key={record.id}
                            className="bg-[#0D0D0F] border border-zinc-800 p-5 rounded-sm flex items-center gap-6 group hover:border-gold/30 transition-all cursor-pointer"
                          >
                            <div className="w-16 h-20 rounded-none overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500">
                              <img src={record.imageUrl} alt="Receipt" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-2">
                                <label className="text-[9px] text-muted uppercase tracking-widest">Vendor Intelligence</label>
                                <div className="flex items-center gap-3">
                                  <h4 className="text-lg font-serif italic text-white truncate">{record.vendor_name || 'Anonymous Vendor'}</h4>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-tighter ${CATEGORY_COLORS[record.category]}`}>
                                    {CATEGORY_ICONS[record.category]} {record.category}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-3 flex gap-6 text-[10px] text-muted font-mono uppercase tracking-widest">
                                <span>{record.date || 'UNSPECIFIED'}</span>
                                <span className="text-emerald-500/80">CONFID: {(record.confidence_score * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <label className="text-[9px] text-muted uppercase tracking-widest block mb-1">Total Value</label>
                              <p className="font-mono font-light text-2xl text-white">
                                <span className="text-xs text-muted mr-1">{record.currency}</span>
                                {record.total_amount?.toFixed(2) || '0.00'}
                              </p>
                              <div className="flex justify-end gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 px-2 border border-zinc-800 text-[10px] uppercase text-muted hover:text-gold hover:border-gold/40 transition-all">
                                  Specs
                                </button>
                                <button 
                                  onClick={() => deleteRecord(record.id)}
                                  className="p-1 px-2 border border-zinc-800 text-[10px] uppercase text-muted hover:text-red-500 hover:border-red-500/40 transition-all"
                                >
                                  Purge
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Stats & Insights */}
                <div className="space-y-8">
                  <div className="bg-[#0D0D0F] border border-zinc-800 rounded-sm p-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                      <TrendingUp className="w-48 h-48" />
                    </div>
                    <div className="flex items-center gap-3 mb-10">
                      <h3 className="text-[10px] uppercase tracking-[0.4em] text-gold">System Analytics</h3>
                    </div>
                    
                    <div className="space-y-8">
                      <div>
                        <label className="block text-[9px] text-muted uppercase tracking-widest mb-1">OCR Precision</label>
                        <div className="flex items-end gap-3 font-mono">
                          <span className="text-4xl font-light text-white leading-none">99.8%</span>
                          <span className="text-emerald-500 text-xs font-bold mb-1">LVL: HI</span>
                        </div>
                      </div>

                      <div className="space-y-5">
                        {['Neural Parse', 'Logic Batch', 'Category AI'].map((step, i) => (
                          <div key={step} className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest">
                              <span className="text-zinc-500">{step}</span>
                              <span className="text-white font-mono">{94 + i}%</span>
                            </div>
                            <div className="w-full h-[2px] bg-zinc-800 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${94 + i}%` }}
                                className="h-full bg-gold shadow-[0_0_8px_#C5A059]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1A1A1D] border border-zinc-800 rounded-sm p-8 text-white relative">
                    <h3 className="text-[10px] uppercase tracking-[0.4em] text-gold mb-6">
                      AI Insights
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed font-serif italic text-lg">
                      "Financial variance detected in <span className="text-white not-italic font-sans font-bold">Food</span> procurement. Optimization of tax components on Supplies could yield <span className="text-gold not-italic">0.12%</span> margin improvement."
                    </p>
                    <button className="mt-8 w-full py-2 bg-transparent border border-zinc-700 text-zinc-400 rounded-none text-[10px] uppercase tracking-widest hover:border-gold hover:text-gold transition-all">
                      Generate PDF Report
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-[#0D0D0F] border border-zinc-800 rounded-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-950/50 border-b border-zinc-800">
                      <tr>
                        <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-[0.2em] text-muted font-mono italic">Vendor Node</th>
                        <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-[0.2em] text-muted font-mono italic">Time Signature</th>
                        <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-[0.2em] text-muted font-mono italic">Classification</th>
                        <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-[0.2em] text-muted font-mono italic text-right">Value (RAW)</th>
                        <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-[0.2em] text-muted font-mono italic text-center">Protocol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {records.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-24 text-center text-zinc-600 font-serif italic text-lg">
                            Archives are sanitized and empty...
                          </td>
                        </tr>
                      ) : (
                        records.map(r => (
                          <tr key={r.id} className="hover:bg-zinc-900/50 transition-colors group">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-12 rounded-none bg-zinc-900 border border-zinc-800 overflow-hidden grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                  <img src={r.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <span className="font-serif italic text-white text-lg">{r.vendor_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 font-mono text-xs text-muted tracking-tight">{r.date}</td>
                            <td className="px-6 py-5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-tighter ${CATEGORY_COLORS[r.category]}`}>
                                {r.category}
                              </span>
                            </td>
                            <td className="px-6 py-5 font-mono font-light text-right text-white">
                              <span className="text-muted text-[10px] mr-1">{r.currency}</span>
                              {r.total_amount?.toFixed(2)}
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-center gap-3">
                                <button className="text-muted hover:text-gold transition-colors">
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => deleteRecord(r.id)}
                                  className="text-muted hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Summary Bar for Mobile */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-zinc-900 border border-zinc-800 rounded-none p-5 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-between">
          <div>
            <p className="text-muted text-[8px] uppercase tracking-[0.3em] font-mono">Archive Value</p>
            <p className="text-white font-mono text-xl">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`p-2 transition-all ${activeTab === 'dashboard' ? 'text-gold' : 'text-zinc-600'}`}
            >
              <LayoutDashboard className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`p-2 transition-all ${activeTab === 'history' ? 'text-gold' : 'text-zinc-600'}`}
            >
              <History className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
