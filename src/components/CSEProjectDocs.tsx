import React from 'react';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  Layers,
  Terminal,
  HelpCircle,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';

export const CSEProjectDocs: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 text-slate-800">
      {/* Intro Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
            Computer Science Engineering Project Report
          </span>
          <span className="text-xs text-slate-500 font-medium">MoneyWise Architecture &amp; Specification</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Personal Finance &amp; Bank Statement Analytics System
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          Comprehensive project documentation covering the India-specific currency implementation (en-IN / INR - ₹), persistent local database architecture, CSV bank statement parsing engine with duplicate detection, and academic Viva Voce defense preparation.
        </p>
      </div>

      {/* Feature Delivery Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Core Delivered */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              DELIVERED &amp; VERIFIED
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">White UI &amp; INR Currency</h4>
          <ul className="text-slate-600 flex flex-col gap-1.5 list-disc pl-4">
            <li>Clean white theme with subtle grey borders and emerald accents</li>
            <li>Indian Rupee (₹) with Indian number grouping (₹1,00,000.00)</li>
            <li>Balance visibility toggle (masking/unmasking)</li>
            <li>Full CRUD: Add, Edit, Delete transactions</li>
            <li>Dynamic Category Envelopes with 80% warning triggers</li>
            <li>Savings goals with direct deposit contribution logging</li>
          </ul>
        </div>

        {/* Database & Storage */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              LOCAL PERSISTENCE
            </span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Working Offline Database</h4>
          <ul className="text-slate-600 flex flex-col gap-1.5 list-disc pl-4">
            <li>IndexedDB storage engine (with LocalStorage fallback)</li>
            <li>Object stores for transactions, budgets, goals, contributions</li>
            <li>Survives page refreshes and browser restarts</li>
            <li>Room SQLite database schemas in native Kotlin project</li>
            <li>Demonstration data clearly labeled with instant wipe option</li>
          </ul>
        </div>

        {/* Bank Import & AI */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              STATEMENT ANALYTICS
            </span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">CSV Import &amp; Gemini AI</h4>
          <ul className="text-slate-600 flex flex-col gap-1.5 list-disc pl-4">
            <li>Indian bank CSV statement parser (HDFC, SBI, ICICI, etc.)</li>
            <li>Auto column detection (Debit/Credit, Narration, Date)</li>
            <li>Likely duplicate transaction detection</li>
            <li>Interactive preview table with individual row selection</li>
            <li>Gemini 2.5 AI wealth advisor with privacy consent gate</li>
          </ul>
        </div>
      </div>

      {/* How to Run in Android Studio */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-base text-slate-900">How to Open &amp; Run in Android Studio</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
            <span className="font-bold text-emerald-800">1. Download ZIP Archive</span>
            <p className="text-slate-600 leading-relaxed">
              In the <strong>Android Studio Code</strong> tab, click <strong>"Download Android Project (.ZIP)"</strong>. Extract the archive into your preferred workspace (e.g. <code>~/AndroidProjects/MoneyWise</code>).
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
            <span className="font-bold text-emerald-800">2. Open in Android Studio</span>
            <p className="text-slate-600 leading-relaxed">
              Launch Android Studio (Hedgehog 2023.1.1 or newer). Choose <strong>Open</strong> and navigate to the extracted root folder where <code>settings.gradle.kts</code> resides.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
            <span className="font-bold text-emerald-800">3. Gradle Sync &amp; Java 17</span>
            <p className="text-slate-600 leading-relaxed">
              Ensure the Gradle JDK is set to <strong>Java 17</strong> in <em>Settings &gt; Build Tools &gt; Gradle</em>. Click <strong>Sync Project with Gradle Files</strong>. All dependencies will download automatically.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
            <span className="font-bold text-emerald-800">4. Run on Device / Emulator</span>
            <p className="text-slate-600 leading-relaxed">
              Select an Android emulator (Pixel 7/8 API 26+) or connect your physical phone via USB debugging, then press <strong>Shift + F10 (Run)</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Indian Currency Formatting Logic */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-3">
        <h3 className="font-bold text-base text-slate-900">Indian Numbering System &amp; Currency Standard (₹)</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Unlike the Western thousands system (where commas occur every 3 digits), the Indian numbering system groups the last 3 digits first (hundreds), and then groups every 2 digits subsequently (thousands, lakhs, crores):
        </p>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono text-slate-800 overflow-x-auto">
          <pre>{`₹1,000.00         -> One Thousand Rupees
₹25,000.00        -> Twenty-Five Thousand Rupees
₹1,00,000.00      -> One Lakh Rupees (100 Thousand)
₹10,50,000.00     -> Ten Lakh Fifty Thousand Rupees
₹1,00,00,000.00   -> One Crore Rupees (10 Million)`}</pre>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          The application implements <code>{"Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })"}</code> with decimal rounding to 2 places to prevent floating-point representation artifacts.
        </p>
      </div>

      {/* Viva Voce Defense Prep */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-700" />
          <h3 className="font-bold text-base text-slate-900">CSE Viva Voce Defense Guide</h3>
        </div>

        <div className="flex flex-col gap-3">
          {[
            {
              q: 'Q1: What database architecture was selected and why?',
              a: 'In the web deployment, we chose IndexedDB (with LocalStorage fallback) because it provides asynchronous transactional storage capable of persisting hundreds of thousands of structured records without blocking the UI thread. In the native Android project, we implemented Room with SQLite and reactive Coroutines Flow.',
            },
            {
              q: 'Q2: How does the CSV Bank Statement import engine handle duplicates?',
              a: 'The parser calculates normalized dates, parses numeric amounts, and compares every candidate row against existing transactions in the database. If a record has an identical timestamp/date, identical amount, and matching merchant tokens, it is flagged as a likely duplicate and deselected by default in the preview table.',
            },
            {
              q: 'Q3: How is user privacy ensured when integrating the Gemini AI API?',
              a: 'We implement an explicit Consent Gate. Raw transactions, account numbers, and personal identifiers are never transmitted. Only anonymized aggregated monthly sums (total income, total expense, and category totals in INR) are evaluated by Gemini for financial health recommendations.',
            },
            {
              q: 'Q4: How do budgets prevent overspending in real time?',
              a: 'Budgets are dynamic envelopes. Whenever a transaction is added, updated, or deleted, the system recomputes the sum of expenses for that category in the current month. If the consumption reaches 80% of the limit, a warning alert badge is displayed; if it exceeds 100%, an over-budget status is triggered.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h5 className="font-bold text-xs text-emerald-800 mb-1">{item.q}</h5>
              <p className="text-xs text-slate-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
