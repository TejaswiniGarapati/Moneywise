import React, { useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  PiggyBank,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Goal } from '../types';
import { formatINR } from '../demoData';

interface GoalsViewProps {
  goals: Goal[];
  onOpenGoalModal: (goalToEdit?: Goal | null) => void;
  onOpenContributionModal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => Promise<void>;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onOpenGoalModal,
  onOpenContributionModal,
  onDeleteGoal,
}) => {
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallAchieved = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="flex flex-col gap-5 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Wealth Milestones
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Savings Goals (INR - ₹)
          </h2>
          <p className="text-xs text-slate-500">
            Track emergency reserves, mutual fund targets, and capital milestones
          </p>
        </div>

        <button
          onClick={() => onOpenGoalModal(null)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Target</span>
        </button>
      </div>

      {/* Aggregate Goals Summary Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-wide">
            Portfolio Goals Progress
          </span>
          <span className="font-bold px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs">
            {overallAchieved.toFixed(1)}% Funded
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div className="text-3xl font-extrabold text-slate-900">
            {formatINR(totalSaved)}
            <span className="text-base font-normal text-slate-400">
              {' '}
              / {formatINR(totalTarget)}
            </span>
          </div>

          <div className="text-xs text-slate-600 font-medium">
            Remaining Target:{' '}
            <strong className="text-emerald-700 font-bold">
              {formatINR(Math.max(0, totalTarget - totalSaved))}
            </strong>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, overallAchieved)}%` }}
          />
        </div>
      </div>

      {/* Goals Cards List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Active Milestones ({goals.length})
        </h3>

        {goals.length === 0 ? (
          <div className="py-12 bg-white border border-slate-200 rounded-3xl text-center p-6 text-xs text-slate-500">
            No savings goals established yet. Click "New Savings Target" to set up emergency reserves or investment targets.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((g) => {
              const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
              const remaining = Math.max(0, g.targetAmount - g.currentAmount);

              return (
                <div
                  key={g.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{g.title}</h4>
                          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                            <span>{g.category}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Target: {g.targetDate}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenGoalModal(g)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Goal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Delete savings goal "${g.title}"?`)) {
                              await onDeleteGoal(g.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 my-3">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>

                    {/* Figures */}
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500 block">Accumulated</span>
                        <strong className="text-slate-900 font-bold">{formatINR(g.currentAmount)}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block">Target Needed</span>
                        <strong className="text-emerald-800 font-bold">{formatINR(g.targetAmount)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {pct >= 100 ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Goal Achieved!
                        </span>
                      ) : (
                        `${formatINR(remaining)} to complete milestone`
                      )}
                    </span>

                    <button
                      onClick={() => onOpenContributionModal(g)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition active:scale-95"
                    >
                      <PiggyBank className="w-3.5 h-3.5" />
                      <span>Deposit ₹</span>
                    </button>
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
