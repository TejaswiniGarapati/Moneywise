import React, { useState } from 'react';
import {
  Wifi,
  Battery,
  Smartphone,
  Monitor,
  Sparkles,
  Code2,
  BookOpen,
  FileSpreadsheet,
  FileText,
  Plus,
} from 'lucide-react';

interface AndroidSimulatorFrameProps {
  children: React.ReactNode;
  activeAppTab: string;
  onSelectAppTab: (tab: string) => void;
  activeNavTab: string;
  onSelectNavTab: (tab: string) => void;
  onOpenAiAdvisor: () => void;
  onOpenCsvImport: () => void;
  onOpenPdfImport: () => void;
  onOpenAddModal: () => void;
}

export const AndroidSimulatorFrame: React.FC<AndroidSimulatorFrameProps> = ({
  children,
  activeAppTab,
  onSelectAppTab,
  activeNavTab,
  onSelectNavTab,
  onOpenAiAdvisor,
  onOpenCsvImport,
  onOpenPdfImport,
  onOpenAddModal,
}) => {
  // Toggle between Responsive Web Full Layout (Default) and Mobile Simulator Frame
  const [viewMode, setViewMode] = useState<'responsive' | 'phone'>('responsive');
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'transactions', label: 'Transactions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'budgets', label: 'Budgets', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { id: 'goals', label: 'Savings Goals', icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9' },
    { id: 'reports', label: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
  ];

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Clean White Professional Navigation Header */}
      <header className="w-full bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-base tracking-tight">MoneyWise</h1>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  INDIA (INR - ₹)
                </span>
                <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-full hidden sm:inline-flex">
                  CSE Engineering Project
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Personal Finance, Bank Statement Analytics &amp; Wealth Management System
              </p>
            </div>
          </div>

          {/* Center Tabs: App Views */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onSelectAppTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeAppTab === 'simulator'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Application Portal</span>
            </button>

            <button
              onClick={() => onSelectAppTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeAppTab === 'code'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Android Studio Code (Kotlin)</span>
            </button>

            <button
              onClick={() => onSelectAppTab('docs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeAppTab === 'docs'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Project Guide &amp; Viva</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPdfImport}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition"
              title="Upload & Extract Bank Statement PDF"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Upload Bank PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>

            <button
              onClick={onOpenCsvImport}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition"
              title="Import Indian Bank Statement CSV (HDFC/SBI/ICICI)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">CSV Import</span>
              <span className="sm:hidden">CSV</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record ₹</span>
            </button>

            <button
              onClick={onOpenAiAdvisor}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Gemini AI Audit</span>
            </button>

            {/* Layout switch: Responsive Web vs Mobile Phone Frame */}
            {activeAppTab === 'simulator' && (
              <button
                onClick={() => setViewMode(viewMode === 'responsive' ? 'phone' : 'responsive')}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 text-xs transition"
                title={viewMode === 'responsive' ? 'Switch to Mobile Phone Simulator' : 'Switch to Responsive Web Layout'}
              >
                {viewMode === 'responsive' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="w-full flex-1 flex justify-center p-3 sm:p-6 overflow-x-hidden">
        {activeAppTab === 'simulator' ? (
          viewMode === 'phone' ? (
            /* Phone Simulator Frame with Clean White Exterior */
            <div className="relative w-[400px] max-w-[95vw] h-[840px] max-h-[92vh] bg-white rounded-[44px] p-3 shadow-xl border-4 border-slate-300 flex flex-col ring-1 ring-slate-200">
              {/* Phone Speaker Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-200 rounded-full border border-slate-300 flex items-center justify-center z-40 pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
              </div>

              {/* Status Bar */}
              <div className="w-full h-8 px-6 pt-1 flex items-center justify-between text-slate-700 text-xs font-medium z-30 select-none bg-white rounded-t-[34px]">
                <span>{currentTime}</span>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="text-[10px] font-bold">5G</span>
                  <Wifi className="w-3.5 h-3.5" />
                  <Battery className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Phone App Body */}
              <div className="relative flex-1 w-full bg-white text-slate-900 flex flex-col overflow-hidden border-t border-slate-100">
                <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
                  {children}
                </div>

                {/* Bottom Navigation */}
                <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around px-1 z-30 shadow-sm">
                  {navItems.map((tab) => {
                    const isActive = activeNavTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => onSelectNavTab(tab.id)}
                        className="flex flex-col items-center justify-center flex-1 py-1 transition group"
                      >
                        <div
                          className={`px-3 py-1 rounded-full transition flex items-center justify-center ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={isActive ? 2.3 : 1.8}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                          </svg>
                        </div>
                        <span
                          className={`text-[10px] mt-0.5 ${
                            isActive ? 'text-emerald-800 font-bold' : 'text-slate-500'
                          }`}
                        >
                          {tab.label}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Gesture Bar */}
              <div className="w-full h-4 bg-white rounded-b-[34px] flex items-center justify-center">
                <div className="w-32 h-1 bg-slate-300 rounded-full"></div>
              </div>
            </div>
          ) : (
            /* Responsive Wide Layout: Clean White Professional Theme */
            <div className="w-full max-w-6xl bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              {/* Desktop Sub-Nav Tab Header */}
              <div className="border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {navItems.map((tab) => {
                    const isActive = activeNavTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => onSelectNavTab(tab.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                        </svg>
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  Locale: <span className="text-slate-800 font-semibold">en-IN (₹ Indian Rupee)</span>
                </div>
              </div>

              {/* Content Canvas */}
              <div className="p-4 sm:p-6 bg-white min-h-[640px]">
                {children}
              </div>
            </div>
          )
        ) : (
          <div className="w-full max-w-6xl">{children}</div>
        )}
      </main>
    </div>
  );
};
