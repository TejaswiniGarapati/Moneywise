import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileCode,
  Folder,
  ExternalLink,
  Terminal,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES, ProjectFile } from '../androidProjectFiles';

export const AndroidProjectExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(ANDROID_PROJECT_FILES[11]); // Default to FinanceViewModel.kt
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  const categories = ['ALL', 'Data & Room', 'MVVM & State', 'UI & Compose', 'Configuration'];

  const filteredFiles = ANDROID_PROJECT_FILES.filter((f) => {
    if (activeCategoryFilter === 'ALL') return true;
    return f.category === activeCategoryFilter;
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();

      // Top-level gitignore
      zip.file(
        '.gitignore',
        `*.iml
.gradle
/local.properties
/.idea/caches
/.idea/libraries
/.idea/modules.xml
/.idea/workspace.xml
/.idea/navEditor.xml
/.idea/assetWizardSettings.xml
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
local.properties
`
      );

      // Add all project files
      ANDROID_PROJECT_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Add comprehensive README.md
      zip.file(
        'README.md',
        `# MoneyWise — Personal Finance, Bank Statement Analytics & Wealth Management System
Computer Science Engineering Capstone Project
Package Name: com.moneywise
Country / Currency: India (INR - ₹)

## Architecture Overview
- Architecture: Model-View-ViewModel (MVVM) with Unidirectional Data Flow (UDF)
- UI Framework: Jetpack Compose with Material Design 3 (Clean White Professional Theme)
- Local Persistence: Room Database with SQLite & Reactive Kotlin Coroutines Flow
- Currency & Locale: INR (₹) with Indian Numbering System grouping (en-IN)
- Asynchronous Engine: Kotlin Coroutines & StateFlow
- Generative AI: Google Gemini GenAI SDK for Kotlin (com.google.ai.client.generativeai:0.7.0)

## How to Import & Run in Android Studio:
1. Open Android Studio (Hedgehog 2023.1.1, Iguana, or newer).
2. Click "Open" and choose this extracted project root folder.
3. In File > Settings > Build Tools > Gradle, verify Gradle JDK is set to Java 17.
4. Click "Sync Project with Gradle Files".
5. Run on an Android Virtual Device (API level 26+) or physical Android phone with USB Debugging enabled.
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'MoneyWise-Android-Studio-Project-INR.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error creating ZIP archive:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-5 text-slate-800">
      {/* Banner / Explanation of Native Android vs Cloud Environment */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                Native Android Studio Codebase
              </span>
              <span className="text-xs text-slate-500 font-medium">Package: com.moneywise (INR - ₹)</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Android Studio Project Hub (Kotlin + Jetpack Compose)
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              <strong>Architecture Note:</strong> The cloud preview runs the web implementation with real IndexedDB storage. Below is the complete native Kotlin Android Studio project ready for submission. You can inspect every file or download the complete <code>.zip</code> to run in Android Studio on your computer.
            </p>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={downloading}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-2xl shadow-xs active:scale-95 transition shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Packing Project...' : 'Download Android Project (.ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* Code Inspector: File Tree + Code Editor Viewer (White Theme) */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs flex flex-col lg:flex-row min-h-[600px]">
        {/* Left Sidebar: File Tree & Categories */}
        <div className="w-full lg:w-80 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-3 shrink-0">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
              Source Architecture
            </h3>
            {/* Category Pills */}
            <div className="flex flex-wrap gap-1 mb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition ${
                    activeCategoryFilter === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* File list */}
          <div className="flex-1 overflow-y-auto max-h-[460px] flex flex-col gap-1 pr-1">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition flex flex-col gap-0.5 ${
                    isSelected
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileCode
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{file.filename}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate pl-5">
                    {file.path}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Panel: File Viewer */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* File Header Bar */}
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3">
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-800">
                  {selectedFile.filename}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                  {selectedFile.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {selectedFile.description}
              </p>
            </div>

            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-xs text-slate-700 transition shrink-0"
              title="Copy file contents"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Body */}
          <div className="flex-1 p-5 overflow-auto bg-slate-900 font-mono text-xs leading-relaxed text-slate-100 rounded-b-2xl">
            <pre className="whitespace-pre">
              <code>{selectedFile.content}</code>
            </pre>
          </div>

          {/* Footer info */}
          <div className="px-5 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
            <span>Package: com.moneywise • Kotlin 2.0+ • Jetpack Compose</span>
            <span>Target SDK: 34 • Min SDK: 26 (Android 8.0+) • en-IN ₹</span>
          </div>
        </div>
      </div>
    </div>
  );
};
