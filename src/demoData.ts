import { Transaction, Budget, Goal } from './types';

const now = Date.now();
const DAY_MS = 86_400_000;

/**
 * Format amounts using Indian Numbering System (en-IN) with Rupee (₹) symbol.
 * Examples: ₹1,000.00 | ₹25,000.00 | ₹1,00,000.00 | ₹10,50,000.00
 */
export function formatINR(amount: number, options?: { showSign?: boolean; hideSymbol?: boolean }): string {
  // Guard against non-numeric or NaN values
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const isNegative = safeAmount < 0;
  const absoluteAmount = Math.abs(safeAmount);

  // Safe rounding to 2 decimal places to prevent floating-point anomalies
  const roundedAmount = Math.round(absoluteAmount * 100) / 100;

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundedAmount);

  // formatted string from en-IN includes ₹ symbol
  let result = formatted;
  if (options?.hideSymbol) {
    result = result.replace('₹', '').trim();
  }

  if (isNegative) {
    return `- ${result}`;
  } else if (options?.showSign && safeAmount > 0) {
    return `+ ${result}`;
  }

  return result;
}

// Backward-compatible alias for existing imports
export const formatCurrency = formatINR;

export function formatDate(timestamp: number): string {
  if (!timestamp) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp));
}

export function formatDateTime(timestamp: number): string {
  if (!timestamp) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(timestamp));
}

/**
 * Clearly labeled Demonstration Dataset formatted in Indian Rupees (INR - ₹).
 * Used for initial showcase; users can wipe it at any time.
 */
export const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'demo-tx-1',
    title: 'Infosys Monthly Tech Salary',
    amount: 85000.0,
    type: 'INCOME',
    categoryId: 'SALARY',
    timestamp: now - DAY_MS * 1,
    paymentMode: 'NET_BANKING',
    notes: 'Direct corporate payroll credit (DEMO)',
    isDemo: true,
  },
  {
    id: 'demo-tx-2',
    title: 'Mobile App Consulting Freelance',
    amount: 24000.0,
    type: 'INCOME',
    categoryId: 'FREELANCE',
    timestamp: now - DAY_MS * 4,
    paymentMode: 'UPI',
    notes: 'Client milestone payout via UPI (DEMO)',
    isDemo: true,
  },
  {
    id: 'demo-tx-3',
    title: 'Mutual Fund SIP & Stock Dividend',
    amount: 3800.0,
    type: 'INCOME',
    categoryId: 'INVESTMENT',
    timestamp: now - DAY_MS * 7,
    paymentMode: 'NET_BANKING',
    notes: 'Quarterly index fund dividend payout (DEMO)',
    isDemo: true,
  },
  {
    id: 'demo-tx-4',
    title: 'Apartment Rent & Society Maintenance',
    amount: 22000.0,
    type: 'EXPENSE',
    categoryId: 'HOUSING',
    timestamp: now - DAY_MS * 2,
    paymentMode: 'NET_BANKING',
    notes: 'Monthly flat rent transfer (DEMO)',
    isDemo: true,
  },
  {
    id: 'demo-tx-5',
    title: 'DMart & Local Kirana Monthly Groceries',
    amount: 6850.0,
    type: 'EXPENSE',
    categoryId: 'GROCERIES',
    timestamp: now - DAY_MS * 3,
    paymentMode: 'UPI',
    notes: 'Provisions, vegetables & essentials (DEMO)',
    isDemo: true,
  },
  {
    id: 'demo-tx-6',
    title: 'Swiggy & Weekend Family Dining',
    amount: 2850.0,
    type: 'EXPENSE',
    categoryId: 'FOOD_DINING',
    timestamp: now - DAY_MS * 5,
    paymentMode: 'UPI',
    notes: 'Weekend dinner & online orders (DEMO)',
    isDemo: true,
  },
  {
    id: 'demo-tx-7',
    title: 'Fuel & Namma Metro Smart Card Recharge',
    amount: 2400.0,
    type: 'EXPENSE',
    categoryId: 'TRANSPORTATION',
    timestamp: now - DAY_MS * 6,
    paymentMode: 'DEBIT_CARD',
    notes: 'Vehicle fuel and metro transit pass (DEMO)',
    isDemo: true,
  },
  {
    id: 'demo-tx-8',
    title: 'Bescom Power Bill & Airtel Fiber Broadband',
    amount: 2150.0,
    type: 'EXPENSE',
    categoryId: 'UTILITIES',
    timestamp: now - DAY_MS * 8,
    paymentMode: 'UPI',
    notes: 'Electricity and fiber internet bills (DEMO)',
    isDemo: true,
  },
  {
    id: 'demo-tx-9',
    title: 'Laptop & Electronics EMI Payment',
    amount: 4500.0,
    type: 'EXPENSE',
    categoryId: 'EMI_LOAN',
    timestamp: now - DAY_MS * 9,
    paymentMode: 'NET_BANKING',
    notes: 'Monthly zero-cost EMI installment (DEMO)',
    isDemo: true,
  },
  {
    id: 'demo-tx-10',
    title: 'Cloud Certification & Lab Subscription',
    amount: 3200.0,
    type: 'EXPENSE',
    categoryId: 'EDUCATION',
    timestamp: now - DAY_MS * 11,
    paymentMode: 'CREDIT_CARD',
    notes: 'CSE certification exam prep resources (DEMO)',
    isDemo: true,
  },
];

export const INITIAL_DEMO_BUDGETS: Budget[] = [
  { categoryId: 'HOUSING', monthlyLimit: 25000, alertThresholdPercent: 85 },
  { categoryId: 'GROCERIES', monthlyLimit: 9000, alertThresholdPercent: 80 },
  { categoryId: 'FOOD_DINING', monthlyLimit: 5000, alertThresholdPercent: 80 },
  { categoryId: 'TRANSPORTATION', monthlyLimit: 4000, alertThresholdPercent: 75 },
  { categoryId: 'UTILITIES', monthlyLimit: 3500, alertThresholdPercent: 80 },
  { categoryId: 'SHOPPING', monthlyLimit: 6000, alertThresholdPercent: 70 },
  { categoryId: 'EMI_LOAN', monthlyLimit: 5000, alertThresholdPercent: 90 },
];

export const INITIAL_DEMO_GOALS: Goal[] = [
  {
    id: 'demo-goal-1',
    title: 'Emergency Liquidity Fund (6 Months Expenses)',
    targetAmount: 300000,
    currentAmount: 185000,
    targetDate: 'Dec 2026',
    category: 'Safety Net',
  },
  {
    id: 'demo-goal-2',
    title: 'Mutual Funds & Long-Term Wealth Corpus',
    targetAmount: 1000000,
    currentAmount: 420000,
    targetDate: 'Oct 2027',
    category: 'Wealth Building',
  },
  {
    id: 'demo-goal-3',
    title: 'Higher Education & CSE Hardware Lab',
    targetAmount: 150000,
    currentAmount: 95000,
    targetDate: 'Jun 2027',
    category: 'Education',
  },
];
