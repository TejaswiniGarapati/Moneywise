import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Budget, CATEGORIES } from '../types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Budget) => Promise<void>;
  budgetToEdit?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  budgetToEdit,
}) => {
  const [categoryId, setCategoryId] = useState('FOOD_DINING');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [alertThresholdPercent, setAlertThresholdPercent] = useState('80');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (budgetToEdit) {
      setCategoryId(budgetToEdit.categoryId);
      setMonthlyLimit(budgetToEdit.monthlyLimit.toString());
      setAlertThresholdPercent(budgetToEdit.alertThresholdPercent.toString());
    } else {
      setCategoryId('FOOD_DINING');
      setMonthlyLimit('5000');
      setAlertThresholdPercent('80');
    }
    setError(null);
  }, [budgetToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(monthlyLimit);
    const threshold = parseInt(alertThresholdPercent, 10);

    if (isNaN(limit) || limit <= 0) {
      setError('Please specify a positive monthly budget limit in ₹.');
      return;
    }
    if (isNaN(threshold) || threshold < 10 || threshold > 100) {
      setError('Alert threshold must be between 10% and 100%.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        categoryId,
        monthlyLimit: limit,
        alertThresholdPercent: threshold,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const expenseCategories = Object.values(CATEGORIES).filter(
    (c) => c.type === 'EXPENSE' || c.type === 'BOTH'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {budgetToEdit ? 'Edit Budget Envelope' : 'Set Category Budget'}
            </h3>
            <p className="text-xs text-slate-500">
              Automated threshold warnings in Indian Rupees (₹)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs text-slate-700">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              disabled={!!budgetToEdit}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Monthly Spending Cap (₹ INR) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min="100"
                step="50"
                placeholder="5000"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Alert Trigger Threshold (% of limit)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={alertThresholdPercent}
                onChange={(e) => setAlertThresholdPercent(e.target.value)}
                className="flex-1 accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="font-bold text-emerald-700 w-12 text-right">
                {alertThresholdPercent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              You will see a warning alert badge when current spending reaches {alertThresholdPercent}% of this budget.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Budget'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
