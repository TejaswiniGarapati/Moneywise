import * as pdfjsLib from 'pdfjs-dist';
import { Transaction, TransactionType, ParsedBankRow } from '../types';
import {
  categorizeTransactionDescription,
  parseIndianAmount,
  parseFlexibleDate,
  isLikelyDuplicate,
} from './csvParser';
import { GoogleGenAI, Type } from '@google/genai';

// Configure pdfjs worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.379'}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('pdfjs worker initialization notice:', e);
  }
}

export interface PDFExtractionResult {
  transactions: ParsedBankRow[];
  pageCount: number;
  rawText: string;
  sourceType: 'LOCAL_REGEX' | 'GEMINI_AI';
  summary: {
    totalCredits: number;
    totalDebits: number;
    totalAmount: number;
    duplicateCount: number;
    categoryBreakdown: Record<string, number>;
  };
}

/**
 * Extracts raw textual content page by page from an ArrayBuffer of a PDF file
 */
export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<{ text: string; pageCount: number }> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageLines: string[] = [];
    let currentY: number | null = null;
    let lineStr = '';

    // Sort items by vertical position (top to bottom) then horizontal (left to right)
    const items = textContent.items as Array<{ str: string; transform: number[] }>;
    
    for (const item of items) {
      const y = item.transform[5];
      if (currentY === null || Math.abs(currentY - y) > 3) {
        if (lineStr.trim()) pageLines.push(lineStr.trim());
        lineStr = item.str;
        currentY = y;
      } else {
        lineStr += ' ' + item.str;
      }
    }
    if (lineStr.trim()) pageLines.push(lineStr.trim());

    pageTexts.push(pageLines.join('\n'));
  }

  return {
    text: pageTexts.join('\n\n'),
    pageCount,
  };
}

/**
 * Deterministic parser for standard Indian bank statement text layouts (HDFC, SBI, ICICI, Axis, etc.)
 */
export function parseBankStatementText(
  rawText: string,
  existingTransactions: Transaction[]
): ParsedBankRow[] {
  const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const parsedRows: ParsedBankRow[] = [];

  // Common Indian Bank date patterns (e.g. 15/10/2026, 15-10-2026, 15 Oct 2026)
  const dateRegex = /(\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b|\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}\b)/i;

  let rowIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line contains a transaction date
    const dateMatch = line.match(dateRegex);
    if (!dateMatch) continue;

    const rawDate = dateMatch[0];
    const timestamp = parseFlexibleDate(rawDate);

    // Strip all dates from line first so date numbers (day/month/year) are never mistaken for amounts
    const lineWithoutDates = line.replace(new RegExp(dateRegex.source, 'g'), ' ');

    // Look for monetary amounts in the line (e.g., 840.00, 1,450.00, 25,000.00, 1,15,000.00)
    // Matches formatted amounts with decimals (840.00) or comma separated (1,15,000), avoiding ref codes
    const amountMatches = lineWithoutDates.match(
      /\b[0-9]{1,3}(?:,[0-9]{2,3})*\.[0-9]{2}\b|\b[0-9]{1,3}(?:,[0-9]{2,3})+\b/g
    );
    if (!amountMatches || amountMatches.length === 0) continue;

    // Parse amounts and filter invalid/year values
    const candidates = amountMatches
      .map((m) => parseIndianAmount(m).amount)
      .filter((n) => n > 0 && n !== 2024 && n !== 2025 && n !== 2026 && n !== 2027);

    if (candidates.length === 0) continue;

    // Check for explicit Dr / Cr / Debit / Credit / Wdl / Dep markers
    const isCredit = /\b(cr|credit|dep|deposit|inflow|refund)\b/i.test(line);
    const isDebit = /\b(dr|debit|wdl|withdrawal|paid|transfer to)\b/i.test(line);

    let type: TransactionType = 'EXPENSE';
    let transactionAmount = candidates[0];

    // In Indian statements, the format is typically [Date] [Narration] [Debit/Wdl] [Credit/Dep] [Balance]
    if (candidates.length >= 2) {
      if (isCredit && !isDebit) {
        type = 'INCOME';
        transactionAmount = candidates[0];
      } else if (isDebit && !isCredit) {
        type = 'EXPENSE';
        transactionAmount = candidates[0];
      } else {
        transactionAmount = candidates[0];
      }
    } else {
      if (isCredit) {
        type = 'INCOME';
      }
    }

    // Clean description by stripping the date and amounts
    let description = line
      .replace(dateRegex, '')
      .replace(/₹?\s*[0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?/g, '')
      .replace(/\b(dr|cr|debit|credit|bal|balance|closing|inr)\b/gi, '')
      .replace(/[\/\-_|#:]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // If description is too short, grab context from adjacent line
    if (description.length < 4 && i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      if (!nextLine.match(dateRegex)) {
        description = (description + ' ' + nextLine).trim();
      }
    }

    if (!description || description.length < 2) {
      description = `Bank Transaction (${rawDate})`;
    }

    // Heuristic categorization
    const suggestedCategory = categorizeTransactionDescription(description);

    // Duplicate check
    const dupCheck = isLikelyDuplicate(
      { timestamp, amount: transactionAmount, description },
      existingTransactions
    );

    parsedRows.push({
      index: rowIdx++,
      date: rawDate,
      timestamp,
      description,
      amount: transactionAmount,
      type,
      suggestedCategory,
      isDuplicate: dupCheck.isDuplicate,
      duplicateReason: dupCheck.reason,
      selected: !dupCheck.isDuplicate,
      raw: { line },
    });
  }

  return parsedRows;
}

/**
 * Intelligent Multimodal AI Extraction using Gemini 3.8 Flash
 * Ideal for scanned PDFs, multi-page complex statements, or irregular bank formats.
 */
export async function extractTransactionsWithGeminiAI(
  pdfBase64OrText: { base64?: string; text?: string },
  existingTransactions: Transaction[]
): Promise<ParsedBankRow[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Falling back to local offline PDF parser.');
  }

  const ai = new GoogleGenAI();

  const prompt = `You are a financial statement analyzer.
Extract all individual transaction records from this bank statement.
For every transaction:
1. "date": Transaction date in DD/MM/YYYY format.
2. "description": Clean merchant, narration, or payee name (e.g. "Swiggy Order", "Infosys Salary", "Bescom Electricity Bill").
3. "amount": The numeric transaction amount (always a positive number, in INR).
4. "type": Either "INCOME" (if credit/deposit) or "EXPENSE" (if debit/withdrawal).
5. "category": Choose one of the following exact category IDs based on the narration:
   - "SALARY": Salary, payroll, corporate credit
   - "FREELANCE": Consulting, freelance invoice, contract
   - "INVESTMENT": Mutual funds, SIP, stocks, dividend, Zerodha, Groww
   - "HOUSING": Rent, society maintenance, flat
   - "GROCERIES": DMart, Blinkit, Zepto, BigBasket, Kirana, supermarket
   - "FOOD_DINING": Swiggy, Zomato, restaurants, cafes, food
   - "TRANSPORTATION": Fuel, petrol, Uber, Ola, Metro, transit, IRCTC
   - "UTILITIES": Electricity, water, gas, power bills
   - "TELECOM": Airtel, Jio, broadband, mobile recharge
   - "HEALTHCARE": Medicines, pharmacy, Apollo, hospital, clinic
   - "SHOPPING": Amazon, Flipkart, Myntra, apparel, retail
   - "EDUCATION": Fees, courses, tuition, books
   - "ENTERTAINMENT": Movies, OTT, Netflix, Hotstar, events
   - "EMI_LOAN": EMI, credit card payment, loan repayment
   - "OTHER_EXPENSE" or "OTHER_INCOME"

Output a strict JSON array of objects.`;

  const contents: any[] = [];

  if (pdfBase64OrText.base64) {
    contents.push({
      inlineData: {
        mimeType: 'application/pdf',
        data: pdfBase64OrText.base64,
      },
    });
    contents.push({ text: prompt });
  } else {
    contents.push({
      text: `${prompt}\n\nBank Statement Text:\n${pdfBase64OrText.text}`,
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            description: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            type: { type: Type.STRING, enum: ['INCOME', 'EXPENSE'] },
            category: { type: Type.STRING },
          },
          required: ['date', 'description', 'amount', 'type', 'category'],
        },
      },
    },
  });

  const parsedJson = JSON.parse(response.text || '[]');
  const resultRows: ParsedBankRow[] = [];

  parsedJson.forEach((item: any, idx: number) => {
    const timestamp = parseFlexibleDate(item.date);
    const amount = Math.abs(parseFloat(item.amount) || 0);
    const dupCheck = isLikelyDuplicate(
      { timestamp, amount, description: item.description },
      existingTransactions
    );

    resultRows.push({
      index: idx,
      date: item.date,
      timestamp,
      description: item.description,
      amount,
      type: item.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
      suggestedCategory: item.category || 'OTHER_EXPENSE',
      isDuplicate: dupCheck.isDuplicate,
      duplicateReason: dupCheck.reason,
      selected: !dupCheck.isDuplicate,
      raw: item,
    });
  });

  return resultRows;
}

/**
 * Calculates financial summary and category breakdown from parsed rows
 */
export function calculateExtractionSummary(rows: ParsedBankRow[]) {
  let totalCredits = 0;
  let totalDebits = 0;
  let duplicateCount = 0;
  const categoryBreakdown: Record<string, number> = {};

  for (const r of rows) {
    if (r.isDuplicate) duplicateCount++;
    if (r.type === 'INCOME') {
      totalCredits += r.amount;
    } else {
      totalDebits += r.amount;
      categoryBreakdown[r.suggestedCategory] =
        (categoryBreakdown[r.suggestedCategory] || 0) + r.amount;
    }
  }

  return {
    totalCredits,
    totalDebits,
    totalAmount: totalCredits + totalDebits,
    duplicateCount,
    categoryBreakdown,
  };
}

/**
 * Generates an authentic downloadable & testable Indian Bank Statement PDF file
 * Using standard PDF byte specification (no external build dependencies).
 */
export function generateSampleBankPDF(): Blob {
  // A clean, valid minimal PDF document with HDFC/SBI bank statement table text
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 720 >>
stream
BT
/F1 14 Tf
50 740 Td
(HDFC BANK LIMITED - ACCOUNT STATEMENT (INR)) Tj
/F1 9 Tf
0 -20 Td
(Account: 50100429182344   Name: TEJASWINI G   Branch: INDIRANAGAR BANGALORE) Tj
0 -15 Td
(Statement Period: 01-OCT-2026 to 25-OCT-2026   Currency: INR) Tj
0 -25 Td
(DATE       NARRATION / PARTICULARS             WITHDRAWAL (DR)    DEPOSIT (CR)    BALANCE) Tj
0 -15 Td
(-----------------------------------------------------------------------------------------------------) Tj
0 -15 Td
(02/10/2026 UPI/SWIGGY/BANGALORE/ORDER-9182             480.00                       1,42,120.00) Tj
0 -15 Td
(03/10/2026 SALARY CREDIT INFOSYS TECH CORP                          85,000.00       2,27,120.00) Tj
0 -15 Td
(04/10/2026 ACH DR BESCOM POWER ELECTRICITY BILL       2,150.00                       2,24,970.00) Tj
0 -15 Td
(05/10/2026 POS DMART RETAIL GROCERIES                 4,320.00                       2,20,650.00) Tj
0 -15 Td
(06/10/2026 ZERODHA BROKING MUTUAL FUND SIP DIVIDEND                  2,500.00       2,23,150.00) Tj
0 -15 Td
(07/10/2026 UPI/UBER RIDE/DAILY METRO COMMUTE            380.00                       2,22,770.00) Tj
0 -15 Td
(08/10/2026 NEFT FLAT RENT TRANSFER TO OWNER          22,000.00                       2,00,770.00) Tj
0 -15 Td
(10/10/2026 AMAZON INDIA ONLINE SHOPPING               2,450.00                       1,98,320.00) Tj
0 -15 Td
(12/10/2026 APOLLO PHARMACY HEALTHCARE MEDICINES         940.00                       1,97,380.00) Tj
0 -15 Td
(14/10/2026 AIRTEL FIBER BROADBAND RECHARGE            1,179.00                       1,96,201.00) Tj
0 -15 Td
(16/10/2026 NETFLIX & OTT ENTERTAINMENT                  649.00                       1,95,552.00) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
0000001007 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1076
%%EOF`;

  return new Blob([pdfContent], { type: 'application/pdf' });
}
