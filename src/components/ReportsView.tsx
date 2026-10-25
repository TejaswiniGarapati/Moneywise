import React, { useState } from 'react';
import {
  TrendingUp,
  FileText,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
} from 'lucide-react';
import { Transaction } from '../types';
import { CATEGORIES } from '../types';
import { formatINR } from '../demoData';

interface ReportsViewProps {
  transactions: Transaction[];
  onOpenAiAdvisor: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  onOpenAiAdvisor,
}) => {
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'THIS_MONTH' | 'LAST_30_DAYS'>('ALL');

  const now = Date.now();
  const DAY_MS = 86_400_000;

  const filteredTransactions = transactions.filter((t) => {
    if (timeFilter === 'LAST_30_DAYS') {
      return now - t.timestamp <= DAY_MS * 30;
    }
    if (timeFilter === 'THIS_MONTH') {
      const d = new Date(t.timestamp);
      const curr = new Date();
      return d.getMonth() === curr.getMonth() && d.getFullYear() === curr.getFullYear();
    }
    return true;
  });

  const incomeTotal = filteredTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseTotal = filteredTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = incomeTotal - expenseTotal;
  const savingsRate = incomeTotal > 0 ? (netSavings / incomeTotal) * 100 : 0;

  // Breakdown
  const categoryExpenses: Record<string, number> = {};
  filteredTransactions
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      categoryExpenses[t.categoryId] = (categoryExpenses[t.categoryId] || 0) + t.amount;
    });

  const sortedCategories = Object.entries(categoryExpenses)
    .map(([catId, amount]) => ({
      catId,
      name: CATEGORIES[catId]?.displayName || catId.replace('_', ' '),
      amount,
      percentage: expenseTotal > 0 ? (amount / expenseTotal) * 100 : 0,
      color: CATEGORIES[catId]?.colorHex || '#64748B',
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="flex flex-col gap-5 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Financial Intelligence
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Analytics &amp; Cashflow Reports (INR - ₹)
          </h2>
          <p className="text-xs text-slate-500">
            Real calculations derived directly from active database records
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setTimeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                timeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter('THIS_MONTH')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                timeFilter === 'THIS_MONTH'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeFilter('LAST_30_DAYS')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                timeFilter === 'LAST_30_DAYS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 30 Days
            </button>
          </div>

          <button
            onClick={onOpenAiAdvisor}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini AI Audit</span>
          </button>
        </div>
      </div>

      {/* Cashflow Summary Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
            Net Cashflow Distribution
          </h3>
          <span className="text-xs text-slate-500">
            Based on {filteredTransactions.length} transaction entries
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold uppercase">
              <span>Gross Inflow</span>
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-2">
              +{formatINR(incomeTotal)}
            </div>
            <span className="text-[11px] text-emerald-700 mt-1">Total revenue recorded</span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-rose-800 font-semibold uppercase">
              <span>Gross Outflow</span>
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold text-rose-700 mt-2">
              -{formatINR(expenseTotal)}
            </div>
            <span className="text-[11px] text-rose-700 mt-1">Total expenditure debited</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold uppercase">
              <span>Net Surplus</span>
              <TrendingUp className="w-4 h-4 text-slate-600" />
            </div>
            <div
              className={`text-2xl font-bold mt-2 ${
                netSavings >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {formatINR(netSavings)}
            </div>
            <span className="text-[11px] text-slate-600 mt-1">
              {savingsRate.toFixed(1)}% savings retention rate
            </span>
          </div>
        </div>
      </div>

      {/* Category Expenditure Ranking */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
        <h3 className="font-bold text-sm text-slate-900">
          Expenditure Ranking by Category
        </h3>

        {sortedCategories.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No expenses found for the selected time range.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedCategories.map((c) => (
              <div key={c.catId} className="flex flex-col gap-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="font-semibold text-slate-800">{c.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {formatINR(c.amount)}{' '}
                    <span className="text-slate-400 font-normal">
                      ({c.percentage.toFixed(1)}%)
                    </span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit & Compliance Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 text-xs text-slate-600 flex items-start gap-3">
        <FileText className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
        <div>
          <h4 className="font-bold text-slate-800">Security &amp; Data Integrity Note</h4>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
            All analytics and metrics shown above are computed in-memory directly from your local IndexedDB storage. No financial data is sent to external servers without your explicit opt-in confirmation.
          </p>
        </div>
      </div>
    </div>
  );
};
