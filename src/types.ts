export type TransactionType = 'INCOME' | 'EXPENSE';

export type PaymentMode = 'UPI' | 'NET_BANKING' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'CASH' | 'CHEQUE' | 'OTHER';

export interface CategoryInfo {
  id: string;
  displayName: string;
  iconName: string;
  colorHex: string;
  type: TransactionType | 'BOTH';
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  SALARY: { id: 'SALARY', displayName: 'Salary & Wages', iconName: 'Briefcase', colorHex: '#059669', type: 'INCOME' },
  FREELANCE: { id: 'FREELANCE', displayName: 'Freelance & Consulting', iconName: 'Laptop', colorHex: '#0284C7', type: 'INCOME' },
  INVESTMENT: { id: 'INVESTMENT', displayName: 'Mutual Funds & Stock Returns', iconName: 'TrendingUp', colorHex: '#7C3AED', type: 'INCOME' },
  RENTAL_INCOME: { id: 'RENTAL_INCOME', displayName: 'Rental & Property Income', iconName: 'Building', colorHex: '#0D9488', type: 'INCOME' },
  OTHER_INCOME: { id: 'OTHER_INCOME', displayName: 'Other Income', iconName: 'Coins', colorHex: '#10B981', type: 'INCOME' },

  HOUSING: { id: 'HOUSING', displayName: 'Rent & Maintenance', iconName: 'Home', colorHex: '#4F46E5', type: 'EXPENSE' },
  GROCERIES: { id: 'GROCERIES', displayName: 'Groceries & Kirana', iconName: 'ShoppingCart', colorHex: '#65A30D', type: 'EXPENSE' },
  FOOD_DINING: { id: 'FOOD_DINING', displayName: 'Food & Dining (Swiggy/Zomato)', iconName: 'Utensils', colorHex: '#EA580C', type: 'EXPENSE' },
  TRANSPORTATION: { id: 'TRANSPORTATION', displayName: 'Fuel, Auto & Metro', iconName: 'Car', colorHex: '#2563EB', type: 'EXPENSE' },
  UTILITIES: { id: 'UTILITIES', displayName: 'Electricity, Water & Gas', iconName: 'Zap', colorHex: '#DB2777', type: 'EXPENSE' },
  TELECOM: { id: 'TELECOM', displayName: 'Mobile Recharge & Broadband', iconName: 'Wifi', colorHex: '#0891B2', type: 'EXPENSE' },
  HEALTHCARE: { id: 'HEALTHCARE', displayName: 'Healthcare & Pharmacy', iconName: 'HeartPulse', colorHex: '#E11D48', type: 'EXPENSE' },
  EDUCATION: { id: 'EDUCATION', displayName: 'Education & Tuition', iconName: 'GraduationCap', colorHex: '#0284C7', type: 'EXPENSE' },
  SHOPPING: { id: 'SHOPPING', displayName: 'Shopping & E-Commerce', iconName: 'ShoppingBag', colorHex: '#D97706', type: 'EXPENSE' },
  ENTERTAINMENT: { id: 'ENTERTAINMENT', displayName: 'OTT & Entertainment', iconName: 'Film', colorHex: '#9333EA', type: 'EXPENSE' },
  EMI_LOAN: { id: 'EMI_LOAN', displayName: 'EMI, Credit Card & Loans', iconName: 'CreditCard', colorHex: '#DC2626', type: 'EXPENSE' },
  OTHER_EXPENSE: { id: 'OTHER_EXPENSE', displayName: 'Other Expenses', iconName: 'MoreHorizontal', colorHex: '#64748B', type: 'EXPENSE' }
};

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  timestamp: number; // Unix timestamp in milliseconds
  paymentMode?: PaymentMode;
  notes?: string;
  isDemo?: boolean;
}

export interface Budget {
  categoryId: string;
  monthlyLimit: number;
  alertThresholdPercent: number; // e.g. 80%
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  timestamp: number;
  notes?: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
}

export interface CSVColumnMapping {
  dateCol: string;
  descriptionCol: string;
  amountCol: string;
  typeCol?: string;
  debitCol?: string;
  creditCol?: string;
}

export interface ParsedBankRow {
  index: number;
  date: string;
  timestamp: number;
  description: string;
  amount: number;
  type: TransactionType;
  suggestedCategory: string;
  isDuplicate: boolean;
  duplicateReason?: string;
  selected: boolean;
  raw: Record<string, string>;
}
