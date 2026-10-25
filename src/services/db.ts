import { Transaction, Budget, Goal, GoalContribution } from '../types';
import { INITIAL_DEMO_TRANSACTIONS, INITIAL_DEMO_BUDGETS, INITIAL_DEMO_GOALS } from '../demoData';

const DB_NAME = 'MoneyWise_Finance_DB';
const DB_VERSION = 1;

const STORES = {
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  GOALS: 'goals',
  CONTRIBUTIONS: 'goal_contributions',
} as const;

// Fallback LocalStorage keys
const STORAGE_KEYS = {
  TRANSACTIONS: 'mw_transactions_v1',
  BUDGETS: 'mw_budgets_v1',
  GOALS: 'mw_goals_v1',
  CONTRIBUTIONS: 'mw_contributions_v1',
  INITIALIZED: 'mw_initialized_v1',
};

class MoneyWiseDatabaseService {
  private db: IDBDatabase | null = null;
  private isIndexedDBAvailable: boolean = true;

  constructor() {
    this.isIndexedDBAvailable = typeof window !== 'undefined' && 'indexedDB' in window;
  }

  /**
   * Initializes IndexedDB or verifies LocalStorage availability.
   */
  async init(): Promise<void> {
    if (!this.isIndexedDBAvailable) {
      this.ensureLocalStorageSeeded();
      return;
    }

    try {
      this.db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;

          if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
            const txStore = db.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id' });
            txStore.createIndex('timestamp', 'timestamp', { unique: false });
            txStore.createIndex('type', 'type', { unique: false });
            txStore.createIndex('categoryId', 'categoryId', { unique: false });
          }

          if (!db.objectStoreNames.contains(STORES.BUDGETS)) {
            db.createObjectStore(STORES.BUDGETS, { keyPath: 'categoryId' });
          }

          if (!db.objectStoreNames.contains(STORES.GOALS)) {
            db.createObjectStore(STORES.GOALS, { keyPath: 'id' });
          }

          if (!db.objectStoreNames.contains(STORES.CONTRIBUTIONS)) {
            const contStore = db.createObjectStore(STORES.CONTRIBUTIONS, { keyPath: 'id' });
            contStore.createIndex('goalId', 'goalId', { unique: false });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      // Check if DB is freshly created; seed demo data once
      const count = await this.getTransactionCount();
      if (count === 0 && !localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
        await this.seedInitialDemoData();
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      }
    } catch (err) {
      console.warn('IndexedDB initialization failed. Falling back to LocalStorage.', err);
      this.isIndexedDBAvailable = false;
      this.ensureLocalStorageSeeded();
    }
  }

  // --- TRANSACTIONS CRUD ---

  async getTransactions(): Promise<Transaction[]> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db!.transaction(STORES.TRANSACTIONS, 'readonly');
        const store = tx.objectStore(STORES.TRANSACTIONS);
        const req = store.getAll();
        req.onsuccess = () => {
          const results = (req.result as Transaction[]) || [];
          results.sort((a, b) => b.timestamp - a.timestamp);
          resolve(results);
        };
        req.onerror = () => reject(req.error);
      });
    }

    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const list: Transaction[] = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db!.transaction(STORES.TRANSACTIONS, 'readwrite');
        const store = tx.objectStore(STORES.TRANSACTIONS);
        const req = store.put(transaction);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }

    const current = await this.getTransactions();
    const updated = [transaction, ...current.filter((t) => t.id !== transaction.id)];
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  }

  async addTransactionsBatch(transactions: Transaction[]): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db!.transaction(STORES.TRANSACTIONS, 'readwrite');
        const store = tx.objectStore(STORES.TRANSACTIONS);
        transactions.forEach((t) => store.put(t));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }

    const current = await this.getTransactions();
    const map = new Map(current.map((t) => [t.id, t]));
    transactions.forEach((t) => map.set(t.id, t));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(Array.from(map.values())));
  }

  async saveTransaction(transaction: Transaction): Promise<void> {
    return this.addTransaction(transaction);
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    return this.addTransaction(transaction);
  }

  async deleteTransaction(id: string): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db!.transaction(STORES.TRANSACTIONS, 'readwrite');
        const store = tx.objectStore(STORES.TRANSACTIONS);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }

    const current = await this.getTransactions();
    const updated = current.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
  }

  async clearDemoTransactions(): Promise<void> {
    const all = await this.getTransactions();
    const realOnes = all.filter((t) => !t.isDemo);

    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db!.transaction(STORES.TRANSACTIONS, 'readwrite');
        const store = tx.objectStore(STORES.TRANSACTIONS);
        store.clear();
        realOnes.forEach((t) => store.put(t));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(realOnes));
  }

  async clearAllTransactions(): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db!.transaction(STORES.TRANSACTIONS, 'readwrite');
        const store = tx.objectStore(STORES.TRANSACTIONS);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
  }

  // --- BUDGETS CRUD ---

  async getBudgets(): Promise<Budget[]> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db!.transaction(STORES.BUDGETS, 'readonly');
        const store = tx.objectStore(STORES.BUDGETS);
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result as Budget[]) || []);
        req.onerror = () => reject(req.error);
      });
    }

    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return raw ? JSON.parse(raw) : [];
  }

  async saveBudget(budget: Budget): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db!.transaction(STORES.BUDGETS, 'readwrite');
        const store = tx.objectStore(STORES.BUDGETS);
        const req = store.put(budget);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }

    const current = await this.getBudgets();
    const updated = [...current.filter((b) => b.categoryId !== budget.categoryId), budget];
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(updated));
  }

  async deleteBudget(categoryId: string): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db!.transaction(STORES.BUDGETS, 'readwrite');
        const store = tx.objectStore(STORES.BUDGETS);
        const req = store.delete(categoryId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }

    const current = await this.getBudgets();
    const updated = current.filter((b) => b.categoryId !== categoryId);
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(updated));
  }

  // --- SAVINGS GOALS & CONTRIBUTIONS CRUD ---

  async getGoals(): Promise<Goal[]> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db!.transaction(STORES.GOALS, 'readonly');
        const store = tx.objectStore(STORES.GOALS);
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result as Goal[]) || []);
        req.onerror = () => reject(req.error);
      });
    }

    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    return raw ? JSON.parse(raw) : [];
  }

  async saveGoal(goal: Goal): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db!.transaction(STORES.GOALS, 'readwrite');
        const store = tx.objectStore(STORES.GOALS);
        const req = store.put(goal);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }

    const current = await this.getGoals();
    const updated = [...current.filter((g) => g.id !== goal.id), goal];
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
  }

  async deleteGoal(id: string): Promise<void> {
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db!.transaction(STORES.GOALS, 'readwrite');
        const store = tx.objectStore(STORES.GOALS);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }

    const current = await this.getGoals();
    const updated = current.filter((g) => g.id !== id);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updated));
  }

  async recordGoalContribution(contribution: GoalContribution): Promise<Goal> {
    // 1. Add contribution to contributions store
    if (this.db) {
      await new Promise<void>((resolve, reject) => {
        const tx = this.db!.transaction(STORES.CONTRIBUTIONS, 'readwrite');
        const store = tx.objectStore(STORES.CONTRIBUTIONS);
        const req = store.put(contribution);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } else {
      const raw = localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS);
      const current = raw ? JSON.parse(raw) : [];
      localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify([contribution, ...current]));
    }

    // 2. Update Goal current amount
    const goals = await this.getGoals();
    const targetGoal = goals.find((g) => g.id === contribution.goalId);
    if (!targetGoal) {
      throw new Error(`Goal with ID ${contribution.goalId} not found.`);
    }

    const updatedGoal: Goal = {
      ...targetGoal,
      currentAmount: Math.max(0, targetGoal.currentAmount + contribution.amount),
    };

    await this.saveGoal(updatedGoal);
    return updatedGoal;
  }

  // --- SEED & RESET UTILITIES ---

  async seedInitialDemoData(): Promise<void> {
    await this.addTransactionsBatch(INITIAL_DEMO_TRANSACTIONS);
    for (const b of INITIAL_DEMO_BUDGETS) {
      await this.saveBudget(b);
    }
    for (const g of INITIAL_DEMO_GOALS) {
      await this.saveGoal(g);
    }
  }

  async resetToDemo(): Promise<void> {
    await this.clearAllTransactions();
    await this.seedInitialDemoData();
  }

  async resetToClean(): Promise<void> {
    await this.clearAllTransactions();
    // Keep empty budgets and goals or clear them
    if (this.db) {
      const tx = this.db.transaction([STORES.BUDGETS, STORES.GOALS], 'readwrite');
      tx.objectStore(STORES.BUDGETS).clear();
      tx.objectStore(STORES.GOALS).clear();
    } else {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
    }
  }

  private async getTransactionCount(): Promise<number> {
    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db!.transaction(STORES.TRANSACTIONS, 'readonly');
        const store = tx.objectStore(STORES.TRANSACTIONS);
        const req = store.count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(0);
      });
    }
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return raw ? JSON.parse(raw).length : 0;
  }

  private ensureLocalStorageSeeded(): void {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_DEMO_TRANSACTIONS));
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(INITIAL_DEMO_BUDGETS));
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(INITIAL_DEMO_GOALS));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }
}

export const dbService = new MoneyWiseDatabaseService();
