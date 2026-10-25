import React, { useState, useEffect } from 'react';
import { AndroidSimulatorFrame } from './components/AndroidSimulatorFrame';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { GoalsView } from './components/GoalsView';
import { ReportsView } from './components/ReportsView';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { GoalModal } from './components/GoalModal';
import { GoalContributionModal } from './components/GoalContributionModal';
import { CSVImportModal } from './components/CSVImportModal';
import { GeminiAdvisorModal } from './components/GeminiAdvisorModal';
import { AndroidProjectExplorer } from './components/AndroidProjectExplorer';
import { CSEProjectDocs } from './components/CSEProjectDocs';
import { dbService } from './services/db';
import { Transaction, Budget, Goal } from './types';

export default function App() {
  const [activeAppTab, setActiveAppTab] = useState<'simulator' | 'code' | 'docs'>('simulator');
  const [activeNavTab, setActiveNavTab] = useState<string>('home');

  // Real Persistent State from Database
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // UI Visibility States
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(() => {
    return localStorage.getItem('mw_balance_visible') !== 'false';
  });

  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

  const [isContributionModalOpen, setIsContributionModalOpen] = useState<boolean>(false);
  const [goalForContribution, setGoalForContribution] = useState<Goal | null>(null);

  const [isCsvImportOpen, setIsCsvImportOpen] = useState<boolean>(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState<boolean>(false);

  // Initialize Persistent Database on Startup
  useEffect(() => {
    async function loadDatabase() {
      try {
        await dbService.init();
        await refreshAllData();
      } catch (err) {
        console.error('Failed to load database:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDatabase();
  }, []);

  const refreshAllData = async () => {
    const [txList, budgetList, goalList] = await Promise.all([
      dbService.getTransactions(),
      dbService.getBudgets(),
      dbService.getGoals(),
    ]);
    setTransactions(txList);
    setBudgets(budgetList);
    setGoals(goalList);
  };

  const handleToggleBalanceVisibility = () => {
    setIsBalanceVisible((prev) => {
      const next = !prev;
      localStorage.setItem('mw_balance_visible', next ? 'true' : 'false');
      return next;
    });
  };

  // --- Real CRUD Operations with Database ---

  // 1. Transactions CRUD
  const handleSaveTransaction = async (tx: Transaction) => {
    await dbService.saveTransaction(tx);
    await refreshAllData();
  };

  const handleDeleteTransaction = async (id: string) => {
    await dbService.deleteTransaction(id);
    await refreshAllData();
  };

  const handleOpenEditTransaction = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setIsTransactionModalOpen(true);
  };

  const handleOpenAddTransaction = () => {
    setTransactionToEdit(null);
    setIsTransactionModalOpen(true);
  };

  // 2. Budgets CRUD
  const handleSaveBudget = async (b: Budget) => {
    await dbService.saveBudget(b);
    await refreshAllData();
  };

  const handleDeleteBudget = async (categoryId: string) => {
    await dbService.deleteBudget(categoryId);
    await refreshAllData();
  };

  const handleUpdateBudgetLimit = async (categoryId: string, newLimit: number) => {
    const existing = budgets.find((b) => b.categoryId === categoryId);
    if (existing) {
      await dbService.saveBudget({ ...existing, monthlyLimit: newLimit });
      await refreshAllData();
    }
  };

  const handleOpenBudgetModal = (bToEdit?: Budget | null) => {
    setBudgetToEdit(bToEdit || null);
    setIsBudgetModalOpen(true);
  };

  // 3. Savings Goals CRUD & Contributions
  const handleSaveGoal = async (g: Goal) => {
    await dbService.saveGoal(g);
    await refreshAllData();
  };

  const handleDeleteGoal = async (id: string) => {
    await dbService.deleteGoal(id);
    await refreshAllData();
  };

  const handleOpenGoalModal = (gToEdit?: Goal | null) => {
    setGoalToEdit(gToEdit || null);
    setIsGoalModalOpen(true);
  };

  const handleOpenContributionModal = (goal: Goal) => {
    setGoalForContribution(goal);
    setIsContributionModalOpen(true);
  };

  const handleRecordContribution = async (goalId: string, amount: number, notes: string) => {
    await dbService.recordGoalContribution({
      id: `contrib-${Date.now()}`,
      goalId,
      amount,
      timestamp: Date.now(),
      notes,
    });
    await refreshAllData();
  };

  // 4. Bank Statement CSV Import
  const handleImportCSVConfirmed = async (newTransactions: Transaction[]) => {
    await dbService.addTransactionsBatch(newTransactions);
    await refreshAllData();
  };

  // 5. Demonstration Data Management
  const handleClearDemoData = async () => {
    await dbService.clearDemoTransactions();
    await refreshAllData();
  };

  const handleRestoreDemoData = async () => {
    await dbService.resetToDemo();
    await refreshAllData();
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center gap-3 text-slate-700">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-sm text-slate-900">Initializing MoneyWise Database...</p>
        <span className="text-xs text-slate-400">Loading offline IndexedDB storage (INR - ₹)</span>
      </div>
    );
  }

  return (
    <AndroidSimulatorFrame
      activeAppTab={activeAppTab}
      onSelectAppTab={(tab) => setActiveAppTab(tab as any)}
      activeNavTab={activeNavTab}
      onSelectNavTab={(tab) => setActiveNavTab(tab)}
      onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
      onOpenCsvImport={() => setIsCsvImportOpen(true)}
      onOpenAddModal={handleOpenAddTransaction}
    >
      {activeAppTab === 'simulator' && (
        <>
          {activeNavTab === 'home' && (
            <DashboardView
              transactions={transactions}
              budgets={budgets}
              isBalanceVisible={isBalanceVisible}
              onToggleBalanceVisibility={handleToggleBalanceVisibility}
              onNavigateToTransactions={() => setActiveNavTab('transactions')}
              onOpenAddModal={handleOpenAddTransaction}
              onOpenEditModal={handleOpenEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onClearDemoData={handleClearDemoData}
              onRestoreDemoData={handleRestoreDemoData}
              onOpenCsvImport={() => setIsCsvImportOpen(true)}
            />
          )}

          {activeNavTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              onOpenAddModal={handleOpenAddTransaction}
              onOpenEditModal={handleOpenEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenCsvImport={() => setIsCsvImportOpen(true)}
            />
          )}

          {activeNavTab === 'budgets' && (
            <BudgetsView
              budgets={budgets}
              transactions={transactions}
              onOpenBudgetModal={handleOpenBudgetModal}
              onDeleteBudget={handleDeleteBudget}
              onUpdateBudgetLimit={handleUpdateBudgetLimit}
            />
          )}

          {activeNavTab === 'goals' && (
            <GoalsView
              goals={goals}
              onOpenGoalModal={handleOpenGoalModal}
              onOpenContributionModal={handleOpenContributionModal}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {activeNavTab === 'reports' && (
            <ReportsView
              transactions={transactions}
              onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
            />
          )}
        </>
      )}

      {activeAppTab === 'code' && <AndroidProjectExplorer />}

      {activeAppTab === 'docs' && <CSEProjectDocs />}

      {/* Record / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        transactionToEdit={transactionToEdit}
      />

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleSaveBudget}
        budgetToEdit={budgetToEdit}
      />

      {/* Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
        goalToEdit={goalToEdit}
      />

      {/* Goal Deposit Contribution Modal */}
      <GoalContributionModal
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
        goal={goalForContribution}
        onRecordContribution={handleRecordContribution}
      />

      {/* Bank Statement CSV Import Modal */}
      <CSVImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        existingTransactions={transactions}
        onImportConfirmed={handleImportCSVConfirmed}
      />

      {/* Gemini AI Financial Advisor Modal */}
      <GeminiAdvisorModal
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
        transactions={transactions}
        budgets={budgets}
      />
    </AndroidSimulatorFrame>
  );
}
