import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Check,
  Sparkles,
  Download,
  RotateCcw,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
} from 'lucide-react';
import { Transaction, ParsedBankRow, CATEGORIES } from '../types';
import {
  extractTextFromPDF,
  parseBankStatementText,
  extractTransactionsWithGeminiAI,
  calculateExtractionSummary,
  generateSampleBankPDF,
} from '../services/pdfParser';
import { formatINR, formatDate } from '../demoData';

interface PDFImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTransactions: Transaction[];
  onImportConfirmed: (newTransactions: Transaction[]) => Promise<void>;
}

export const PDFImportModal: React.FC<PDFImportModalProps> = ({
  isOpen,
  onClose,
  existingTransactions,
  onImportConfirmed,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedBankRow[]>([]);
  const [extractedRawText, setExtractedRawText] = useState<string>('');
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [useAI, setUseAI] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a valid PDF file (.pdf).');
      return;
    }

    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    await processPDFFile(uploadedFile);
  };

  const handleLoadSamplePDF = async () => {
    const sampleBlob = generateSampleBankPDF();
    const sampleFile = new File([sampleBlob], 'HDFC_Bank_Statement_Oct2026.pdf', {
      type: 'application/pdf',
    });
    setFile(sampleFile);
    setFileName('HDFC_Bank_Statement_Oct2026.pdf (Sample Test PDF)');
    await processPDFFile(sampleFile);
  };

  const processPDFFile = async (pdfFile: File) => {
    setIsProcessing(true);
    setError(null);
    setProcessingStatus('Reading PDF file structure...');

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();

      // Convert to base64 for optional Gemini AI processing
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const b64 = btoa(binary);
      setPdfBase64(b64);

      setProcessingStatus('Extracting text content from pages...');
      const { text, pageCount: count } = await extractTextFromPDF(arrayBuffer);
      setExtractedRawText(text);
      setPageCount(count);

      setProcessingStatus('Analyzing transaction rows & spending categories...');

      let rows: ParsedBankRow[] = [];

      if (useAI && process.env.GEMINI_API_KEY) {
        setProcessingStatus('Extracting via Gemini 3.8 Flash AI...');
        rows = await extractTransactionsWithGeminiAI({ base64: b64 }, existingTransactions);
      } else {
        // Deterministic high-speed Indian bank regex parser
        rows = parseBankStatementText(text, existingTransactions);
      }

      setParsedRows(rows);

      if (rows.length === 0) {
        setError(
          'No transaction rows could be auto-detected in this PDF. It may be password-protected or an image-only scan. Try enabling AI Deep Extraction.'
        );
      }
    } catch (err: any) {
      console.error('PDF parsing error:', err);
      setError(`Failed to process PDF: ${err.message || 'Corrupted or password-protected PDF.'}`);
      setParsedRows([]);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleRunAiEnhancement = async () => {
    if (!extractedRawText && !pdfBase64) return;
    setIsProcessing(true);
    setProcessingStatus('Running Gemini AI Deep Statement Analysis...');
    setError(null);

    try {
      const rows = await extractTransactionsWithGeminiAI(
        { base64: pdfBase64, text: extractedRawText },
        existingTransactions
      );
      setParsedRows(rows);
      setUseAI(true);
    } catch (err: any) {
      setError(err.message || 'AI extraction failed. Retaining local extracted rows.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
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

  const handleCategoryChange = (index: number, newCategory: string) => {
    setParsedRows(
      parsedRows.map((r) => (r.index === index ? { ...r, suggestedCategory: newCategory } : r))
    );
  };

  const handleCommitImport = async () => {
    const selectedRows = parsedRows.filter((r) => r.selected);
    if (selectedRows.length === 0) return;

    setImporting(true);
    try {
      const newTransactions: Transaction[] = selectedRows.map((r) => ({
        id: `pdf-tx-${Date.now()}-${r.index}`,
        title: r.description,
        amount: r.amount,
        type: r.type,
        categoryId: r.suggestedCategory,
        timestamp: r.timestamp,
        paymentMode: r.description.toUpperCase().includes('UPI')
          ? 'UPI'
          : r.description.toUpperCase().includes('POS')
          ? 'DEBIT_CARD'
          : r.description.toUpperCase().includes('ACH') || r.description.toUpperCase().includes('NEFT')
          ? 'NET_BANKING'
          : 'OTHER',
        notes: `Extracted from PDF: ${fileName}`,
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

  const summary = calculateExtractionSummary(parsedRows);
  const selectedCount = parsedRows.filter((r) => r.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">
                  PDF Bank Statement Extraction &amp; Categorization
                </h3>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  INDIAN BANKS (₹)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Extracts transactions, debits, credits, and categorizes spending automatically
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
          {/* Upload Area & Quick Sample Generator */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 flex-wrap">
              <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition shadow-xs">
                <Upload className="w-4 h-4" />
                <span>Choose Bank PDF File</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <span className="text-slate-400">or test with:</span>

              <button
                type="button"
                onClick={handleLoadSamplePDF}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-semibold shadow-xs transition"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Load Sample HDFC PDF Statement</span>
              </button>
            </div>

            {/* Optional AI Extraction Toggle */}
            {parsedRows.length > 0 && (
              <button
                type="button"
                onClick={handleRunAiEnhancement}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 transition"
                title="Use Gemini AI to analyze complex layout or irregular descriptions"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>{useAI ? 'AI Enhanced Mode' : 'AI Deep Scan (Gemini)'}</span>
              </button>
            )}
          </div>

          {/* Active File Metadata */}
          {fileName && (
            <div className="flex items-center justify-between px-3 py-2 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs text-slate-700">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-bold text-slate-900 truncate">{fileName}</span>
                {pageCount > 0 && (
                  <span className="text-slate-500">({pageCount} page{pageCount > 1 ? 's' : ''})</span>
                )}
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {parsedRows.length} Transactions Extracted
              </span>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="font-bold text-sm text-slate-900">{processingStatus}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Parsing tabular columns, matching amounts, and tagging spending categories.
                </p>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Extraction Notice</p>
                <p className="text-[11px] text-amber-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Categorized Spending Overview Cards */}
          {parsedRows.length > 0 && !isProcessing && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                      Total Inflow (Credits)
                    </span>
                    <strong className="text-lg font-bold text-emerald-700">
                      +{formatINR(summary.totalCredits)}
                    </strong>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-800 uppercase block">
                      Total Outflow (Debits)
                    </span>
                    <strong className="text-lg font-bold text-rose-700">
                      -{formatINR(summary.totalDebits)}
                    </strong>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase block">
                      Spending Categories
                    </span>
                    <strong className="text-lg font-bold text-slate-900">
                      {Object.keys(summary.categoryBreakdown).length} Categories
                    </strong>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Categorization Breakdown Pills */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap gap-2 items-center text-xs">
                <span className="font-bold text-slate-600 text-[11px] uppercase mr-1">
                  Categorized Spend:
                </span>
                {Object.entries(summary.categoryBreakdown).map(([catId, amt]) => {
                  const cat = CATEGORIES[catId] || {
                    displayName: catId.replace('_', ' '),
                    colorHex: '#64748B',
                  };
                  return (
                    <span
                      key={catId}
                      className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 flex items-center gap-1.5 shadow-xs font-medium text-[11px]"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.colorHex }}
                      />
                      <span>{cat.displayName}:</span>
                      <strong className="text-slate-900">{formatINR(amt)}</strong>
                    </span>
                  );
                })}
              </div>

              {/* Duplicate & Selection Toolbar */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-sm">
                    {parsedRows.length} Extracted Transactions
                  </span>
                  {summary.duplicateCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      {summary.duplicateCount} Duplicate{summary.duplicateCount > 1 ? 's' : ''} detected
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

              {/* Transactions Preview Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto max-h-[340px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 z-10 font-bold">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">Import</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Narration / Payee</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Auto Spending Category</th>
                        <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.map((r) => (
                        <tr
                          key={r.index}
                          onClick={() => toggleSelectRow(r.index)}
                          className={`cursor-pointer transition hover:bg-slate-50/80 ${
                            r.selected ? 'bg-emerald-50/30' : 'opacity-65'
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
                          <td className="py-2.5 px-3 max-w-[280px] truncate">
                            <div className="font-semibold text-slate-900 truncate">
                              {r.description}
                            </div>
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
                          <td className="py-2.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {/* Category Selector Dropdown allowing user to adjust if desired */}
                            <select
                              value={r.suggestedCategory}
                              onChange={(e) => handleCategoryChange(r.index, e.target.value)}
                              className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              {Object.values(CATEGORIES).map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.displayName}
                                </option>
                              ))}
                            </select>
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
            </div>
          )}

          {/* Empty Prompt */}
          {!file && !isProcessing && (
            <div className="py-14 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/50">
              <FileText className="w-12 h-12 text-slate-300 mb-2" />
              <h4 className="font-bold text-sm text-slate-800">Upload Bank Statement PDF</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Upload your monthly bank statement PDF from any Indian bank (HDFC, SBI, ICICI, Axis, Paytm, etc.). MoneyWise will extract all transactions and auto-categorize your spending.
              </p>
              <button
                type="button"
                onClick={handleLoadSamplePDF}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 border border-slate-300 text-emerald-700 shadow-xs transition"
              >
                Or Generate &amp; Test Sample HDFC Bank PDF
              </button>
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
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95 transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>
                {importing
                  ? 'Importing...'
                  : `Import ${selectedCount} Transactions to Ledger`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
