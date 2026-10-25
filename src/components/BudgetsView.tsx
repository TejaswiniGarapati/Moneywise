import React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Plus,
  Sliders,
  Trash2,
  Edit2,
  PieChart,
} from 'lucide-react';
import { Budget, Transaction } from '../types';
import { CATEGORIES } from '../types';
import { formatINR } from '../demoData';

interface BudgetsViewProps {
  budgets: Budget[];
  transactions: Transaction[];
  onOpenBudgetModal: (budgetToEdit?: Budget | null) => void;
  onDeleteBudget: (categoryId: string) => Promise<void>;
  onUpdateBudgetLimit: (categoryId: string, newLimit: number) => Promise<void>;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  transactions,
  onOpenBudgetModal,
  onDeleteBudget,
  onUpdateBudgetLimit,
}) => {
  // Calculate expenses per category from stored transactions
  const expenseTransactions = transactions.filter((t) => t.type === 'EXPENSE');
  const categoryExpenses: Record<string, number> = {};
  expenseTransactions.forEach((t) => {
    categoryExpenses[t.categoryId] = (categoryExpenses[t.categoryId] || 0) + t.amount;
  });

  const totalMonthlyBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpentAcrossBudgets = budgets.reduce(
    (sum, b) => sum + (categoryExpenses[b.categoryId] || 0),
    0
  );
  const overallPercentage =
    totalMonthlyBudget > 0 ? (totalSpentAcrossBudgets / totalMonthlyBudget) * 100 : 0;

  return (
    <div className="flex flex-col gap-5 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Category Envelopes
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Monthly Budgets (INR - ₹)
          </h2>
          <p className="text-xs text-slate-500">
            Set category limits with automated 80% warning alerts
          </p>
        </div>

        <button
          onClick={() => onOpenBudgetModal(null)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Budget Envelope</span>
        </button>
      </div>

      {/* Aggregate Allocation Summary Card (Clean White with Emerald Accent) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-wide">
            Total Monthly Allocation
          </span>
          <span
            className={`font-bold px-3 py-1 rounded-full border text-xs ${
              overallPercentage > 100
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : overallPercentage >= 80
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {overallPercentage.toFixed(0)}% Utilized
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div className="text-3xl font-extrabold text-slate-900">
            {formatINR(totalSpentAcrossBudgets)}
            <span className="text-base font-normal text-slate-400">
              {' '}
              / {formatINR(totalMonthlyBudget)}
            </span>
          </div>

          <div className="text-xs text-slate-600 font-medium">
            Remaining Budget:{' '}
            <strong className="text-emerald-700 font-bold">
              {formatINR(Math.max(0, totalMonthlyBudget - totalSpentAcrossBudgets))}
            </strong>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPercentage > 100
                ? 'bg-rose-600'
                : overallPercentage >= 80
                ? 'bg-amber-500'
                : 'bg-emerald-600'
            }`}
            style={{ width: `${Math.min(100, overallPercentage)}%` }}
          />
        </div>
      </div>

      {/* Envelopes List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Active Category Envelopes ({budgets.length})
        </h3>

        {budgets.length === 0 ? (
          <div className="py-12 bg-white border border-slate-200 rounded-3xl text-center p-6 text-xs text-slate-500">
            No budgets configured yet. Click "New Budget Envelope" to set monthly spending limits.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {budgets.map((b) => {
              const spent = categoryExpenses[b.categoryId] || 0;
              const cat =
                CATEGORIES[b.categoryId] || {
                  displayName: b.categoryId.replace('_', ' '),
                  colorHex: '#64748B',
                };
              const pct = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
              const isOver = spent > b.monthlyLimit;
              const isAlert = pct >= b.alertThresholdPercent && !isOver;

              return (
                <div
                  key={b.categoryId}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: cat.colorHex }}
                      />
                      <span className="font-bold text-sm text-slate-900">
                        {cat.displayName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOver ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                          <ShieldAlert className="w-3.5 h-3.5" /> Over by {formatINR(spent - b.monthlyLimit)}
                        </span>
                      ) : isAlert ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> {pct.toFixed(0)}% Warning
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Safe ({pct.toFixed(0)}%)
                        </span>
                      )}

                      <button
                        onClick={() => onOpenBudgetModal(b)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Envelope"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={async () => {
                          if (confirm(`Delete budget for ${cat.displayName}?`)) {
                            await onDeleteBudget(b.categoryId);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? 'bg-rose-600' : isAlert ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  {/* Info Row */}
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>
                      Spent: <strong className="text-slate-900">{formatINR(spent)}</strong>
                    </span>
                    <span>
                      Cap: <strong className="text-slate-900">{formatINR(b.monthlyLimit)}</strong>
                    </span>
                  </div>

                  {/* Slider to adjust limit live */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Sliders className="w-3 h-3" /> Quick Adjust:
                    </span>
                    <input
                      type="range"
                      min="500"
                      max="50000"
                      step="500"
                      value={b.monthlyLimit}
                      onChange={(e) =>
                        onUpdateBudgetLimit(b.categoryId, parseFloat(e.target.value))
                      }
                      className="flex-1 accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <span className="text-xs font-bold text-emerald-800 w-20 text-right">
                      {formatINR(b.monthlyLimit)}
                    </span>
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
