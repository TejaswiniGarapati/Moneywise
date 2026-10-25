import { Transaction, TransactionType, ParsedBankRow, CSVColumnMapping, CATEGORIES } from '../types';

/**
 * Standard CSV line splitter handling quoted values with commas
 */
export function parseCSVToRows(csvText: string): string[][] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows: string[][] = [];

  for (const line of lines) {
    const row: string[] = [];
    let insideQuote = false;
    let entry = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuote && line[i + 1] === '"') {
          entry += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());
    if (row.some((cell) => cell.length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Parses numbers with commas, currency symbols, and signs (e.g. "₹ 12,450.00", "5000.50 CR", "-200")
 */
export function parseIndianAmount(rawVal: string): { amount: number; isNegative: boolean } {
  if (!rawVal) return { amount: 0, isNegative: false };

  let clean = rawVal.replace(/[₹$,\s]/g, '').trim();
  const isDr = /dr|debit/i.test(clean);
  const isCr = /cr|credit/i.test(clean);
  clean = clean.replace(/(dr|cr|debit|credit)/gi, '').trim();

  const isNeg = clean.startsWith('-') || isDr;
  const num = Math.abs(parseFloat(clean));

  return {
    amount: isNaN(num) ? 0 : num,
    isNegative: isNeg && !isCr,
  };
}

/**
 * Parses dates into standard Unix millisecond timestamps.
 * Supports: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, DD MMM YYYY.
 */
export function parseFlexibleDate(dateStr: string): number {
  if (!dateStr) return Date.now();
  const clean = dateStr.trim();

  // 1. Try DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d.getTime();
  }

  // 2. Try Standard Date.parse
  const parsed = Date.parse(clean);
  if (!isNaN(parsed)) return parsed;

  return Date.now();
}

/**
 * Auto-detects column mappings from CSV header row
 */
export function detectColumnMapping(headers: string[]): CSVColumnMapping {
  const norm = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const findIndex = (patterns: string[]) => {
    for (const p of patterns) {
      const idx = norm.findIndex((h) => h.includes(p));
      if (idx !== -1) return headers[idx];
    }
    return '';
  };

  const dateCol = findIndex(['date', 'txndate', 'valuedate', 'transactiondate']) || headers[0] || '';
  const descriptionCol = findIndex(['narration', 'description', 'particulars', 'remarks', 'details']) || headers[1] || '';
  const debitCol = findIndex(['debit', 'withdrawal', 'dr', 'outflow']);
  const creditCol = findIndex(['credit', 'deposit', 'cr', 'inflow']);
  const amountCol = findIndex(['amount', 'txnamount', 'balance', 'total']) || headers[2] || '';
  const typeCol = findIndex(['type', 'trantype', 'drcr']);

  return {
    dateCol,
    descriptionCol,
    amountCol,
    debitCol: debitCol || undefined,
    creditCol: creditCol || undefined,
    typeCol: typeCol || undefined,
  };
}

/**
 * Intelligent category heuristic tagging based on transaction description
 */
export function categorizeTransactionDescription(desc: string): string {
  const d = desc.toUpperCase();

  if (/SWIGGY|ZOMATO|MCDONALD|DOMINO|STARBUCKS|KFC|CAFE|RESTAURANT|BISTRO|FOOD|BURGER/i.test(d)) {
    return 'FOOD_DINING';
  }
  if (/DMART|BLINKIT|ZEPTO|BIGBASKET|INSTAMART|KIRANA|GROCERY|SUPERMARKET|SPENCER|NATURES BASKET/i.test(d)) {
    return 'GROCERIES';
  }
  if (/UBER|OLA|RAPIDO|PETROL|FUEL|HPCL|BPCL|IOCL|INDIAN OIL|SHELL|METRO|IRCTC|RAILWAY/i.test(d)) {
    return 'TRANSPORTATION';
  }
  if (/BESCOM|TNEB|MSEDCL|ELECTRICITY|POWER|WATER|BWSSB|IGL|ADANI GAS|PIPED GAS/i.test(d)) {
    return 'UTILITIES';
  }
  if (/AIRTEL|JIO|VODAFONE|VI|ACT FIBERNET|BROADBAND|TATA PLAY|DTH|RECHARGE/i.test(d)) {
    return 'TELECOM';
  }
  if (/SALARY|PAYROLL|INFOSYS|TCS|WIPRO|ACCENTURE|GOOGLE|MICROSOFT|TECH CORP|STIPEND/i.test(d)) {
    return 'SALARY';
  }
  if (/ZERODHA|GROWW|UPSTOX|MUTUAL FUND|SIP|DIVIDEND|NSE|BSE|KFINTECH|CAMS/i.test(d)) {
    return 'INVESTMENT';
  }
  if (/RENT|SOCIETY|MAINTENANCE|HOUSING|APARTMENT|FLAT/i.test(d)) {
    return 'HOUSING';
  }
  if (/AMAZON|FLIPKART|MYNTRA|AJIO|NYKAA|ZARA|H&M|SHOPPERS STOP|DECATHLON/i.test(d)) {
    return 'SHOPPING';
  }
  if (/APOLLO|PHARMEASY|NETMEDS|MEDPLUS|HOSPITAL|CLINIC|DIAGNOSTICS|HEALTHCARE/i.test(d)) {
    return 'HEALTHCARE';
  }
  if (/EMI|LOAN|CREDIT CARD|HDFC CARD|SBI CARD|ICICI CARD|BAJAJ/i.test(d)) {
    return 'EMI_LOAN';
  }
  if (/COURSERA|UDEMY|COLLEGE|UNIVERSITY|TUITION|EXAM FEE|CERTIFICATION/i.test(d)) {
    return 'EDUCATION';
  }
  if (/NETFLIX|PRIME|HOTSTAR|BOOKMYSHOW|PVR|INOX|SPOTIFY|YOUTUBE/i.test(d)) {
    return 'ENTERTAINMENT';
  }

  return 'OTHER_EXPENSE';
}

/**
 * Checks for likely duplicate transactions against existing database records
 */
export function isLikelyDuplicate(
  candidate: { timestamp: number; amount: number; description: string },
  existingList: Transaction[]
): { isDuplicate: boolean; reason?: string } {
  const candDate = new Date(candidate.timestamp).toDateString();
  const candDesc = candidate.description.trim().toLowerCase();

  for (const existing of existingList) {
    const existDate = new Date(existing.timestamp).toDateString();
    const amountMatch = Math.abs(existing.amount - candidate.amount) < 0.01;

    if (amountMatch && candDate === existDate) {
      const existDesc = existing.title.trim().toLowerCase();
      if (
        candDesc.includes(existDesc) ||
        existDesc.includes(candDesc) ||
        candDesc.slice(0, 10) === existDesc.slice(0, 10)
      ) {
        return {
          isDuplicate: true,
          reason: `Matches existing entry "${existing.title}" on ${existDate}`,
        };
      }
    }
  }

  return { isDuplicate: false };
}

/**
 * Sample Indian Bank CSV statements for instant evaluation and testing
 */
export const SAMPLE_BANK_CSVS = {
  HDFC: `Date,Narration,Withdrawal (Debit),Deposit (Credit),Closing Balance
02/10/2026,UPI-SWIGGY-BANGALORE-ORDER#4412,450.00,,45210.50
03/10/2026,SALARY CREDIT FROM INFOSYS TECH,,85000.00,130210.50
04/10/2026,ACH DEBIT BESCOM POWER BILL,2150.00,,128060.50
05/10/2026,UPI-DMART RETAIL STORE GROCERIES,4320.00,,123740.50
06/10/2026,MUTUAL FUND SIP DIVIDEND PAYOUT,,1500.00,125240.50
07/10/2026,UPI-UBER RIDE BANGALORE COMMUTE,380.00,,124860.50
08/10/2026,NEFT RENT TRANSFER TO LANDLORD,22000.00,,102860.50`,

  SBI: `Txn Date,Description,Debit,Credit,Balance
01-10-2026,CREDIT INTEREST TRANSFER,,420.00,54420.00
03-10-2026,HPCL PETROL BUNK VEHICLE REFUEL,1800.00,,52620.00
05-10-2026,AIRTEL BROADBAND FIBER BILL,1179.00,,51441.00
07-10-2026,FREELANCE CONSULTING SETTLEMENT,,18500.00,69941.00
09-10-2026,APOLLO PHARMACY HEALTHCARE MEDICINES,940.00,,69001.00`,

  GENERIC: `Date,Particulars,Amount,Type
10/10/2026,ZOMATO ONLINE FOOD ORDER,620.00,DR
11/10/2026,TECH FREELANCE ADVANCE PAYMENT,15000.00,CR
12/10/2026,NETFLIX AND HOTSTAR SUBSCRIPTIONS,999.00,DR
13/10/2026,AMAZON INDIA SHOPPING DELIVERY,2450.00,DR`,
};
