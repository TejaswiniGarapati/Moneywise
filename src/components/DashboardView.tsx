import React from 'react';
import {
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  ShieldAlert,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Transaction, Budget } from '../types';
import { CATEGORIES } from '../types';
import { formatINR, formatDate } from '../demoData';

interface DashboardViewProps {
  transactions: Transaction[];
  budgets: Budget[];
  isBalanceVisible: boolean;
  onToggleBalanceVisibility: () => void;
  onNavigateToTransactions: () => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => Promise<void>;
  onClearDemoData: () => void;
  onRestoreDemoData: () => void;
  onOpenCsvImport: () => void;
  onOpenPdfImport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  budgets,
  isBalanceVisible,
  onToggleBalanceVisibility,
  onNavigateToTransactions,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteTransaction,
  onClearDemoData,
  onRestoreDemoData,
  onOpenCsvImport,
  onOpenPdfImport,
}) => {
  // Safe math calculations
  const incomeTotal = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseTotal = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = incomeTotal - expenseTotal;
  const savingsRate = incomeTotal > 0 ? Math.max(0, (netSavings / incomeTotal) * 100) : 0;

  // Category breakdown calculation
  const expenseTransactions = transactions.filter((t) => t.type === 'EXPENSE');
  const categoryExpenses: Record<string, number> = {};
  expenseTransactions.forEach((t) => {
    categoryExpenses[t.categoryId] = (categoryExpenses[t.categoryId] || 0) + t.amount;
  });

  const categoryBreakdown = Object.entries(categoryExpenses)
    .map(([catId, amount]) => {
      const cat = CATEGORIES[catId] || {
        displayName: catId.replace('_', ' '),
        colorHex: '#64748B',
      };
      const percentage = expenseTotal > 0 ? (amount / expenseTotal) * 100 : 0;
      return {
        catId,
        name: cat.displayName,
        amount,
        percentage,
        color: cat.colorHex,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Budget progress calculation
  const budgetProgress = budgets.map((b) => {
    const spent = categoryExpenses[b.categoryId] || 0;
    const cat = CATEGORIES[b.categoryId] || { displayName: b.categoryId.replace('_', ' '), colorHex: '#64748B' };
    const percentage = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
    const isOver = spent > b.monthlyLimit;
    const isWarning = percentage >= b.alertThresholdPercent && !isOver;

    return {
      categoryId: b.categoryId,
      name: cat.displayName,
      limit: b.monthlyLimit,
      spent,
      percentage,
      isOver,
      isWarning,
      color: cat.colorHex,
    };
  });

  const hasDemo = transactions.some((t) => t.isDemo);
  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="flex flex-col gap-5 text-slate-800">
      {/* Top Banner Notice: Demonstration Data Mode */}
      {hasDemo ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Demonstration Data Mode Active
              </p>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Loaded sample Indian Rupee records for academic evaluation. Click "Clear Demo Data" to wipe demo rows and start fresh with your own records.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={onClearDemoData}
              className="text-xs font-bold text-amber-900 hover:text-black bg-amber-200/60 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition"
            >
              Clear Demo Data
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 px-4 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Clean Database Mode (User Entries Only)</span>
          <button
            onClick={onRestoreDemoData}
            className="flex items-center gap-1 text-emerald-700 font-bold hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load Sample Indian Data</span>
          </button>
        </div>
      )}

      {/* 1. Total Net Balance Card — Clean White Professional Card with Emerald Accents */}
      <div className="bg-white border-2 border-emerald-600/30 rounded-3xl p-6 shadow-sm flex flex-col gap-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Total Net Balance
              </span>
              <p className="text-[11px] text-slate-500">
                Real-time calculated surplus from {transactions.length} database records
              </p>
            </div>
          </div>

          {/* Balance Visibility Toggle Button */}
          <button
            onClick={onToggleBalanceVisibility}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
            title={isBalanceVisible ? 'Hide Balance' : 'Show Balance'}
          >
            {isBalanceVisible ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Mask Balance</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Reveal Balance</span>
              </>
            )}
          </button>
        </div>

        {/* Display Amount in Indian Numbering System */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-1">
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {isBalanceVisible ? formatINR(netSavings) : '₹ ••••••••'}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                netSavings >= 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {savingsRate.toFixed(1)}% Savings Rate ({netSavings >= 0 ? 'Surplus' : 'Deficit'})
            </span>
          </div>
        </div>
      </div>

      {/* 2. Monthly Income, Monthly Expense, Net Savings Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Monthly Inflow
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-700">
              {isBalanceVisible ? formatINR(incomeTotal) : '₹ ••••••'}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Gross income received
            </span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Monthly Outflow
            </span>
            <div className="w-7 h-7 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-700">
              {isBalanceVisible ? formatINR(expenseTotal) : '₹ ••••••'}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Total expenditure across categories
            </span>
          </div>
        </div>

        {/* Net Savings Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Net Savings
            </span>
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-bold ${
                netSavings >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {isBalanceVisible ? formatINR(netSavings) : '₹ ••••••'}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {netSavings >= 0 ? 'Retained cash surplus' : 'Expenditure exceeding income'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Spending Category Chart & Breakdown (White Card with Subtle Grey Border) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Spending by Category (INR - ₹)
            </h3>
            <p className="text-xs text-slate-500">
              Expense distribution across Indian household categories
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
            Total Spent: {isBalanceVisible ? formatINR(expenseTotal) : '₹ •••••'}
          </span>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No expense records logged in the database yet. Click Record ₹ to add one.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Visual Color Distribution Bar */}
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
              {categoryBreakdown.map((cat) => (
                <div
                  key={cat.catId}
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color,
                  }}
                  className="h-full transition-all duration-500 hover:opacity-90 cursor-pointer"
                  title={`${cat.name}: ${formatINR(cat.amount)} (${cat.percentage.toFixed(1)}%)`}
                />
              ))}
            </div>

            {/* Category breakdown item list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mt-2">
              {categoryBreakdown.slice(0, 6).map((cat) => (
                <div
                  key={cat.catId}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-semibold text-slate-800 truncate">
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {cat.percentage.toFixed(0)}%
                    </span>
                    <strong className="text-slate-900">
                      {isBalanceVisible ? formatINR(cat.amount) : '₹ ••••'}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Active Monthly Budget Envelopes with Threshold Warnings */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Monthly Budget Envelopes
            </h3>
            <p className="text-xs text-slate-500">
              Calculated dynamically from real stored transactions (Warning at 80%)
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            {budgetProgress.length} Categories Monitored
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {budgetProgress.slice(0, 4).map((item) => (
            <div
              key={item.categoryId}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{item.name}</span>
                  {item.isOver && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                      <ShieldAlert className="w-3 h-3" /> Over Budget
                    </span>
                  )}
                  {item.isWarning && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      80% Warning
                    </span>
                  )}
                </div>

                <div className="text-[11px]">
                  <strong className={item.isOver ? 'text-rose-700' : 'text-slate-900'}>
                    {formatINR(item.spent)}
                  </strong>
                  <span className="text-slate-400"> / {formatINR(item.limit)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.isOver ? 'bg-rose-600' : item.isWarning ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, item.percentage)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{item.percentage.toFixed(0)}% consumed</span>
                <span>
                  {item.isOver
                    ? `Over by ${formatINR(item.spent - item.limit)}`
                    : `${formatINR(item.limit - item.spent)} remaining`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Recent Transactions Section (Real CRUD: Edit, Delete, View All) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500">
              Real-time records stored in database
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPdfImport}
              className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl transition"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>Upload Bank PDF</span>
            </button>

            <button
              onClick={onOpenCsvImport}
              className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
              <span>CSV</span>
            </button>

            <button
              onClick={onNavigateToTransactions}
              className="flex items-center gap-0.5 text-xs font-bold text-slate-700 hover:text-black bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
            >
              <span>View All ({transactions.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No transactions found. Record your first transaction or import a bank statement CSV.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {recentTransactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              const cat = CATEGORIES[tx.categoryId] || { displayName: tx.categoryId.replace('_', ' ') };

              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/80 px-2 rounded-2xl transition group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate">
                          {tx.title}
                        </span>
                        {tx.isDemo && (
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded">
                            DEMO
                          </span>
                        )}
                        {tx.paymentMode && (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {tx.paymentMode.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {cat.displayName} • {formatDate(tx.timestamp)}
                        {tx.notes && <span className="italic ml-1">({tx.notes})</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div
                      className={`font-bold text-sm ${
                        isIncome ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatINR(tx.amount)}
                    </div>

                    {/* Edit and Delete Actions */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => onOpenEditModal(tx)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
                        title="Edit Transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
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
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
