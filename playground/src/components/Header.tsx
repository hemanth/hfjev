import React from 'react';
import { Key, ExternalLink, Sliders, Database, Layers, Sparkles, Terminal } from 'lucide-react';

interface HeaderProps {
  currentView: 'docs' | 'studio';
  onChangeView: (view: 'docs' | 'studio') => void;
  apiKey: string;
  isSimulated: boolean;
  hfToken?: string;
  onOpenApiKeyModal: (tab?: 'typesafe' | 'huggingface') => void;
  activeDatasetName: string;
  totalEvaluated: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onChangeView,
  apiKey,
  isSimulated,
  hfToken,
  onOpenApiKeyModal,
  activeDatasetName,
  totalEvaluated,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2.5 backdrop-blur-md bg-[#fbfaf7]/90 border-b border-ink-200/60 transition-all">
      <nav className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onChangeView('docs')}
            className="group flex items-center gap-2.5 font-bold tracking-tight text-ink-900 text-lg"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-ink-900 text-white shadow-soft-sm group-hover:bg-peach-700 transition-colors duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold tracking-tight text-ink-900 text-base font-sans">TypeSafe</span>
              <span className="font-mono text-sm font-semibold text-peach-700">Jev</span>
              <span className="text-ink-400 text-xs">/</span>
              <span className="text-xs font-medium text-ink-500 font-mono">hfjev</span>
            </div>
          </button>

          <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-sage-100 text-sage-800 border border-sage-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-700"></span>
            <span>System One · Speculative Fan-out</span>
          </div>
        </div>

        {/* View Switcher: Studio Workbench vs Overview/Blueprint */}
        <div className="flex items-center rounded-xl bg-ink-100/80 p-1 border border-ink-200/70 text-xs font-mono">
          <button
            onClick={() => onChangeView('studio')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              currentView === 'studio'
                ? 'bg-white text-ink-900 font-bold shadow-soft-sm'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'studio' ? 'bg-peach-600' : 'bg-transparent'}`}></span>
            <span>Studio Workbench</span>
          </button>

          <button
            onClick={() => onChangeView('docs')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              currentView === 'docs'
                ? 'bg-white text-ink-900 font-bold shadow-soft-sm'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentView === 'docs' ? 'bg-peach-600' : 'bg-transparent'}`}></span>
            <span>Overview &amp; Docs</span>
          </button>
        </div>

        {/* Actions: API Keys & External Links */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {totalEvaluated > 0 && (
            <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-sage-100 text-sage-800 border border-sage-200">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-700"></span>
              <span>{totalEvaluated} Classified</span>
            </div>
          )}

          {/* Explicit API Keys Button */}
          <button
            onClick={() => onOpenApiKeyModal()}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-medium transition shadow-soft-sm ${
              apiKey && !isSimulated
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                : isSimulated
                ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
            }`}
            title="Configure TypeSafe Jev API Key and Hugging Face Token"
          >
            <Key size={13} className={apiKey && !isSimulated ? "text-emerald-700" : "text-amber-700"} />
            <span>API Keys</span>
            <span className="text-[10px] opacity-75">
              ({apiKey && !isSimulated ? 'Live' : 'Sim'})
            </span>
            {hfToken && (
              <span className="w-1.5 h-1.5 rounded-full bg-peach-600" title="HF Token Configured"></span>
            )}
          </button>

          <a
            href="https://github.com/hemanth/hfjev"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 font-medium transition shadow-soft-sm"
          >
            <span>GitHub</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </nav>
    </header>
  );
};
