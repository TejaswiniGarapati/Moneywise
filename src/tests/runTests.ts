import { formatINR } from '../demoData';
import {
  parseCSVToRows,
  parseIndianAmount,
  parseFlexibleDate,
  detectColumnMapping,
  categorizeTransactionDescription,
  isLikelyDuplicate,
  SAMPLE_BANK_CSVS,
} from '../services/csvParser';
import { Transaction } from '../types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

console.log('========================================================');
console.log('🧪 RUNNING MONEYWISE CSE TEST SUITE (INDIA SPECIFIC & MATH)');
console.log('========================================================\n');

// 1. TEST INDIAN RUPEE FORMATTING
console.log('▶ Test 1: Indian Number Grouping & Currency Symbol (INR)');
const test1K = formatINR(1000);
assert(test1K.includes('₹') && test1K.includes('1,000'), `Formats ₹1,000.00 correctly (got: "${test1K}")`);

const test25K = formatINR(25000);
assert(test25K.includes('25,000'), `Formats ₹25,000.00 correctly (got: "${test25K}")`);

const test1Lakh = formatINR(100000);
assert(test1Lakh.includes('1,00,000'), `Formats 1 Lakh with Indian grouping ₹1,00,000.00 (got: "${test1Lakh}")`);

const test10Lakh = formatINR(1050000);
assert(test10Lakh.includes('10,50,000'), `Formats 10.5 Lakhs ₹10,50,000.00 (got: "${test10Lakh}")`);

const testNegative = formatINR(-5000);
assert(testNegative.startsWith('-') && testNegative.includes('5,000'), `Formats negative amount correctly (got: "${testNegative}")`);

// 2. TEST FINANCIAL CALCULATIONS
console.log('\n▶ Test 2: Inflow, Outflow, Net Savings, and Savings Rate');
const mockTransactions: Transaction[] = [
  { id: '1', title: 'Salary', amount: 80000, type: 'INCOME', categoryId: 'SALARY', timestamp: Date.now() },
  { id: '2', title: 'Consulting', amount: 20000, type: 'INCOME', categoryId: 'FREELANCE', timestamp: Date.now() },
  { id: '3', title: 'Rent', amount: 25000, type: 'EXPENSE', categoryId: 'HOUSING', timestamp: Date.now() },
  { id: '4', title: 'Groceries', amount: 15000, type: 'EXPENSE', categoryId: 'GROCERIES', timestamp: Date.now() },
];

const totalInflow = mockTransactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
const totalOutflow = mockTransactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
const netSavings = totalInflow - totalOutflow;
const savingsRate = (netSavings / totalInflow) * 100;

assert(totalInflow === 100000, `Calculates total gross income = ₹1,00,000 (got ${totalInflow})`);
assert(totalOutflow === 40000, `Calculates total gross expenses = ₹40,000 (got ${totalOutflow})`);
assert(netSavings === 60000, `Calculates net savings surplus = ₹60,000 (got ${netSavings})`);
assert(savingsRate === 60, `Calculates savings rate = 60% (got ${savingsRate}%)`);

// 3. TEST BUDGET CONSUMPTION & OVER-BUDGET LOGIC
console.log('\n▶ Test 3: Budget Overrun & 80% Threshold Alert');
const budgetLimit = 20000;
const spentWithinSafe = 10000;
const spentAtWarning = 16500;
const spentOverLimit = 22000;

const pct1 = (spentWithinSafe / budgetLimit) * 100;
assert(pct1 === 50 && pct1 < 80, '50% spent is within safe budget');

const pct2 = (spentAtWarning / budgetLimit) * 100;
assert(pct2 >= 80 && pct2 <= 100, `82.5% spent triggers 80% warning threshold (got ${pct2}%)`);

const isOver = spentOverLimit > budgetLimit;
const overrunAmount = spentOverLimit - budgetLimit;
assert(isOver && overrunAmount === 2000, `Correctly identifies over-budget by ₹2,000 (got ₹${overrunAmount})`);

// 4. TEST CSV PARSING & BANK STATEMENT IMPORT
console.log('\n▶ Test 4: Indian Bank Statement CSV Parsing');
const hdfcRows = parseCSVToRows(SAMPLE_BANK_CSVS.HDFC);
assert(hdfcRows.length === 8, `Parsed 8 rows (1 header + 7 transactions) from HDFC CSV (got ${hdfcRows.length})`);

const mapping = detectColumnMapping(hdfcRows[0]);
assert(mapping.debitCol !== undefined && mapping.creditCol !== undefined, 'Auto-detected separate Debit and Credit columns in HDFC statement');

const dateTimestamp = parseFlexibleDate('02/10/2026');
const parsedDate = new Date(dateTimestamp);
assert(parsedDate.getDate() === 2 && parsedDate.getMonth() === 9 && parsedDate.getFullYear() === 2026, 'Parsed Indian DD/MM/YYYY date format correctly');

const { amount: amt1 } = parseIndianAmount('₹ 45,210.50');
assert(amt1 === 45210.50, `Parsed Indian Rupee string to number (got ${amt1})`);

// 5. TEST HEURISTIC CATEGORIZATION
console.log('\n▶ Test 5: Transaction Description Auto-Categorization');
assert(categorizeTransactionDescription('UPI-SWIGGY-BANGALORE-ORDER') === 'FOOD_DINING', 'Auto-tagged SWIGGY as FOOD_DINING');
assert(categorizeTransactionDescription('SALARY CREDIT FROM INFOSYS TECH') === 'SALARY', 'Auto-tagged INFOSYS as SALARY');
assert(categorizeTransactionDescription('DMART RETAIL STORE GROCERIES') === 'GROCERIES', 'Auto-tagged DMART as GROCERIES');
assert(categorizeTransactionDescription('UBER RIDE BANGALORE COMMUTE') === 'TRANSPORTATION', 'Auto-tagged UBER as TRANSPORTATION');
assert(categorizeTransactionDescription('ACH DEBIT BESCOM POWER BILL') === 'UTILITIES', 'Auto-tagged BESCOM as UTILITIES');

// 6. TEST DUPLICATE DETECTION
console.log('\n▶ Test 6: Likely Duplicate Detection');
const existingTx: Transaction[] = [
  {
    id: 'tx-existing',
    title: 'UPI-SWIGGY-ORDER',
    amount: 450,
    type: 'EXPENSE',
    categoryId: 'FOOD_DINING',
    timestamp: dateTimestamp,
  },
];

const duplicateCheck = isLikelyDuplicate(
  { timestamp: dateTimestamp, amount: 450, description: 'UPI-SWIGGY-ORDER-RETRY' },
  existingTx
);
assert(duplicateCheck.isDuplicate === true, 'Detected duplicate transaction on same date and amount');

const nonDuplicateCheck = isLikelyDuplicate(
  { timestamp: dateTimestamp, amount: 990, description: 'UPI-SWIGGY-ORDER-NEW' },
  existingTx
);
assert(nonDuplicateCheck.isDuplicate === false, 'Did not flag different amount as duplicate');

console.log('\n========================================================');
console.log(`🏁 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log('========================================================');

if (failed > 0) {
  process.exit(1);
}
