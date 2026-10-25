import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Check,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { Transaction, ParsedBankRow } from '../types';
import {
  parseCSVToRows,
  detectColumnMapping,
  parseIndianAmount,
  parseFlexibleDate,
  categorizeTransactionDescription,
  isLikelyDuplicate,
  SAMPLE_BANK_CSVS,
} from '../services/csvParser';
import { formatINR, formatDate } from '../demoData';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTransactions: Transaction[];
  onImportConfirmed: (newTransactions: Transaction[]) => Promise<void>;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  existingTransactions,
  onImportConfirmed,
}) => {
  const [csvContent, setCsvContent] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedBankRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState<boolean>(false);
  const [selectedBankSample, setSelectedBankSample] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      processCSV(text);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = (bank: 'HDFC' | 'SBI' | 'GENERIC') => {
    setSelectedBankSample(bank);
    const sample = SAMPLE_BANK_CSVS[bank];
    setCsvContent(sample);
    processCSV(sample);
  };

  const processCSV = (rawText: string) => {
    setValidationError(null);
    if (!rawText.trim()) {
      setParsedRows([]);
      setHeaders([]);
      return;
    }

    try {
      const allRows = parseCSVToRows(rawText);
      if (allRows.length < 2) {
        setValidationError('The CSV file must contain a header row and at least one data row.');
        setParsedRows([]);
        return;
      }

      const fileHeaders = allRows[0];
      setHeaders(fileHeaders);
      const mapping = detectColumnMapping(fileHeaders);

      if (!mapping.dateCol || !mapping.descriptionCol) {
        setValidationError('Could not auto-detect required Date and Description columns. Please check your CSV headers.');
      }

      const dateIdx = fileHeaders.indexOf(mapping.dateCol);
      const descIdx = fileHeaders.indexOf(mapping.descriptionCol);
      const debitIdx = mapping.debitCol ? fileHeaders.indexOf(mapping.debitCol) : -1;
      const creditIdx = mapping.creditCol ? fileHeaders.indexOf(mapping.creditCol) : -1;
      const amountIdx = mapping.amountCol ? fileHeaders.indexOf(mapping.amountCol) : -1;
      const typeIdx = mapping.typeCol ? fileHeaders.indexOf(mapping.typeCol) : -1;

      const dataRows = allRows.slice(1);
      const parsed: ParsedBankRow[] = [];

      dataRows.forEach((row, idx) => {
        const rawDate = row[dateIdx] || '';
        const rawDesc = row[descIdx] || 'Bank Transaction';

        let amount = 0;
        let isIncome = false;

        // Check if separate Debit/Credit columns exist (Standard in Indian bank statements)
        if (debitIdx !== -1 && creditIdx !== -1) {
          const debitRaw = row[debitIdx] || '';
          const creditRaw = row[creditIdx] || '';

          if (creditRaw.trim() && parseIndianAmount(creditRaw).amount > 0) {
            amount = parseIndianAmount(creditRaw).amount;
            isIncome = true;
          } else if (debitRaw.trim() && parseIndianAmount(debitRaw).amount > 0) {
            amount = parseIndianAmount(debitRaw).amount;
            isIncome = false;
          }
        } else if (amountIdx !== -1) {
          const rawAmt = row[amountIdx] || '';
          const parsedInfo = parseIndianAmount(rawAmt);
          amount = parsedInfo.amount;

          if (typeIdx !== -1) {
            const rawType = (row[typeIdx] || '').toUpperCase();
            isIncome = rawType.includes('CR') || rawType.includes('CREDIT') || rawType.includes('INCOME');
          } else {
            isIncome = !parsedInfo.isNegative;
          }
        }

        if (amount > 0 && rawDesc.trim()) {
          const timestamp = parseFlexibleDate(rawDate);
          const suggestedCategory = categorizeTransactionDescription(rawDesc);
          const dupCheck = isLikelyDuplicate(
            { timestamp, amount, description: rawDesc },
            existingTransactions
          );

          parsed.push({
            index: idx,
            date: rawDate,
            timestamp,
            description: rawDesc,
            amount,
            type: isIncome ? 'INCOME' : 'EXPENSE',
            suggestedCategory,
            isDuplicate: dupCheck.isDuplicate,
            duplicateReason: dupCheck.reason,
            selected: !dupCheck.isDuplicate, // Unselect duplicates by default to prevent double counting
            raw: fileHeaders.reduce((acc, h, i) => ({ ...acc, [h]: row[i] || '' }), {}),
          });
        }
      });

      setParsedRows(parsed);
      if (parsed.length === 0) {
        setValidationError('No valid transactions could be parsed from the provided CSV data.');
      }
    } catch (err: any) {
      setValidationError(`Error parsing CSV: ${err.message || 'Malformed file'}`);
      setParsedRows([]);
    }
  };

  const toggleSelectRow = (index: number) => {
    setParsedRows(
      parsedRows.map((r) => (r.index === index ? { ...r, selected: !r.selected } : r))
    );
  };

  const toggleSelectAll = (select: boolean) => {
    setParsedRows(parsedRows.map((r) => ({ ...r, selected: select })));
  };

  const handleCommitImport = async () => {
    const selectedRows = parsedRows.filter((r) => r.selected);
    if (selectedRows.length === 0) return;

    setImporting(true);
    try {
      const newTransactions: Transaction[] = selectedRows.map((r) => ({
        id: `imported-${Date.now()}-${r.index}`,
        title: r.description,
        amount: r.amount,
        type: r.type,
        categoryId: r.suggestedCategory,
        timestamp: r.timestamp,
        paymentMode: r.description.toUpperCase().includes('UPI')
          ? 'UPI'
          : r.description.toUpperCase().includes('NEFT')
          ? 'NET_BANKING'
          : 'NET_BANKING',
        notes: `Imported via Statement CSV (${r.date})`,
        isDemo: false,
      }));

      await onImportConfirmed(newTransactions);
      onClose();
    } catch (err: any) {
      alert(`Import error: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const selectedCount = parsedRows.filter((r) => r.selected).length;
  const duplicateCount = parsedRows.filter((r) => r.isDuplicate).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Import Bank Statement (CSV)
              </h3>
              <p className="text-xs text-slate-500">
                Intelligent Indian bank statement parser with column detection &amp; duplicate prevention
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-5 text-xs text-slate-700">
          {/* File Upload or Preset Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition shadow-sm">
                <Upload className="w-4 h-4" />
                <span>Choose CSV File</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-slate-400">or try a sample:</span>
            </div>

            {/* Indian Bank Sample Templates */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['HDFC', 'SBI', 'GENERIC'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleLoadSample(b)}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition ${
                    selectedBankSample === b
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {b === 'GENERIC' ? 'Generic Format' : `${b} Bank Sample`}
                </button>
              ))}
            </div>
          </div>

          {/* Validation Error Alert */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Notice</p>
                <p className="text-[11px] text-amber-700 mt-0.5">{validationError}</p>
              </div>
            </div>
          )}

          {/* Duplicate & Selection Summary */}
          {parsedRows.length > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-2 px-1">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 text-sm">
                  {parsedRows.length} Transactions Detected
                </span>
                {duplicateCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    {duplicateCount} Likely Duplicate{duplicateCount > 1 ? 's' : ''} (Unchecked)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleSelectAll(true)}
                  className="text-xs text-emerald-700 hover:underline font-semibold"
                >
                  Select All
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => toggleSelectAll(false)}
                  className="text-xs text-slate-500 hover:underline"
                >
                  Deselect All
                </button>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 ? (
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto max-h-[340px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 z-10 font-bold">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">Import</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Narration / Description</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((r) => (
                      <tr
                        key={r.index}
                        onClick={() => toggleSelectRow(r.index)}
                        className={`cursor-pointer transition hover:bg-slate-50/80 ${
                          r.selected ? 'bg-emerald-50/30' : 'opacity-70'
                        } ${r.isDuplicate ? 'bg-amber-50/20' : ''}`}
                      >
                        <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={r.selected}
                            onChange={() => toggleSelectRow(r.index)}
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-medium whitespace-nowrap text-slate-700">
                          {formatDate(r.timestamp)}
                        </td>
                        <td className="py-2.5 px-3 max-w-[260px] truncate">
                          <div className="font-semibold text-slate-900 truncate">{r.description}</div>
                          {r.isDuplicate && (
                            <div className="text-[10px] text-amber-700 font-medium flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                              <span>{r.duplicateReason}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.type === 'INCOME'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {r.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                          {r.suggestedCategory.replace('_', ' ')}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-bold whitespace-nowrap ${
                            r.type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {r.type === 'INCOME' ? '+' : '-'} {formatINR(r.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-12 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/50">
              <FileSpreadsheet className="w-12 h-12 text-slate-300 mb-2" />
              <h4 className="font-bold text-sm text-slate-800">No Statement Loaded</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Upload a bank statement CSV or select one of the pre-loaded Indian bank samples (HDFC / SBI / Generic) above.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {selectedCount} of {parsedRows.length} transactions selected for import
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedCount === 0 || importing}
              onClick={handleCommitImport}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{importing ? 'Importing Records...' : `Import ${selectedCount} Transactions`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
