import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  FileSpreadsheet,
  Edit2,
  Filter,
} from 'lucide-react';
import { Transaction, TransactionType, PaymentMode, CATEGORIES } from '../types';
import { formatINR, formatDate } from '../demoData';

interface TransactionsViewProps {
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onOpenEditModal: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => Promise<void>;
  onOpenCsvImport: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteTransaction,
  onOpenCsvImport,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>('ALL');

  const filteredTransactions = transactions.filter((tx) => {
    // Tab filter
    if (activeTab === 'INCOME' && tx.type !== 'INCOME') return false;
    if (activeTab === 'EXPENSE' && tx.type !== 'EXPENSE') return false;

    // Category filter
    if (selectedCategory !== 'ALL' && tx.categoryId !== selectedCategory) return false;

    // Payment mode filter
    if (selectedPaymentMode !== 'ALL' && tx.paymentMode !== selectedPaymentMode) return false;

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const cat = CATEGORIES[tx.categoryId]?.displayName.toLowerCase() || '';
      return (
        tx.title.toLowerCase().includes(q) ||
        cat.includes(q) ||
        (tx.notes && tx.notes.toLowerCase().includes(q))
      );
    }

    return true;
  });

  const totalFilteredAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="flex flex-col gap-5 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Account Ledger
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Transactions (INR - ₹)
          </h2>
          <p className="text-xs text-slate-500">
            Full record history with UPI, Net Banking, and Bank Statement support
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCsvImport}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Statement</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Income / Expense / All Segmented Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
        {(['ALL', 'INCOME', 'EXPENSE'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const label =
            tab === 'ALL'
              ? `All (${transactions.length})`
              : tab === 'INCOME'
              ? 'Income Credits (+)'
              : 'Expense Debits (-)';
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                isActive
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Filters: Search Bar, Category Filter, Payment Mode */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by payee, merchant, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="ALL">All Categories</option>
              {Object.values(CATEGORIES).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Mode Filter */}
          <div>
            <select
              value={selectedPaymentMode}
              onChange={(e) => setSelectedPaymentMode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="ALL">All Payment Modes</option>
              <option value="UPI">UPI</option>
              <option value="NET_BANKING">Net Banking / NEFT</option>
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>
        </div>

        {/* Filter subtotal summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>{filteredTransactions.length} transaction entries matched</span>
          <span>
            Filtered Total:{' '}
            <strong className="text-slate-900 font-bold">
              {formatINR(totalFilteredAmount)}
            </strong>
          </span>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">No transactions match your criteria</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust your search keywords, clear category filters, or record a new transaction.
            </p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="mt-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-100 transition"
          >
            Add Transaction
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'INCOME';
            const cat =
              CATEGORIES[tx.categoryId] || {
                displayName: tx.categoryId.replace('_', ' '),
                colorHex: '#64748B',
              };

            return (
              <div
                key={tx.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition group"
              >
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isIncome
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {tx.title}
                      </span>
                      {tx.isDemo && (
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                          DEMO
                        </span>
                      )}
                      {tx.paymentMode && (
                        <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {tx.paymentMode.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.colorHex }}
                      />
                      <span>{cat.displayName}</span>
                      <span>•</span>
                      <span>{formatDate(tx.timestamp)}</span>
                    </div>
                    {tx.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5 truncate">
                        "{tx.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div
                    className={`text-base font-bold text-right ${
                      isIncome ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {formatINR(tx.amount)}
                  </div>

                  {/* Edit and Delete Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditModal(tx)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Transaction"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete transaction "${tx.title}"?`)) {
                          await onDeleteTransaction(tx.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
