import React from 'react';
import { Sparkles, Key, Cpu, ExternalLink, Database, Sliders, Layers, Terminal } from 'lucide-react';

interface HeaderProps {
  apiKey: string;
  isSimulated: boolean;
  hfToken?: string;
  onOpenApiKeyModal: () => void;
  activeDatasetName: string;
  totalEvaluated: number;
}

export const Header: React.FC<HeaderProps> = ({
  apiKey,
  isSimulated,
  hfToken,
  onOpenApiKeyModal,
  activeDatasetName,
  totalEvaluated,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-3 pb-2.5 backdrop-blur-md bg-canvas/90 border-b border-ink-200/60 transition-all">
      <nav className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <a href="#hero" className="group flex items-center gap-2.5 font-bold tracking-tight text-ink-900 text-lg">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-ink-900 text-white shadow-soft-sm group-hover:bg-peach-700 transition-colors duration-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold tracking-tight text-ink-900 text-base font-sans">TypeSafe</span>
                <span className="font-mono text-sm font-semibold text-peach-700">Jev</span>
                <span className="text-ink-400 text-xs">/</span>
                <span className="text-xs font-medium text-ink-500 font-mono">hf-studio</span>
              </div>
            </div>
          </a>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-sage-100 text-sage-800 border border-sage-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-700"></span>
            <span>System One · jev-latest</span>
          </div>
        </div>

        {/* Navigation Links & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
          <a
            href="#studio"
            className="hidden md:inline-flex px-3 py-1.5 rounded-full text-ink-700 hover:text-ink-900 hover:bg-ink-100/70 transition-colors"
          >
            Studio
          </a>
          <a
            href="#how-it-works"
            className="hidden md:inline-flex px-3 py-1.5 rounded-full text-ink-700 hover:text-ink-900 hover:bg-ink-100/70 transition-colors"
          >
            How it Works
          </a>
          <a
            href="#primitives"
            className="hidden md:inline-flex px-3 py-1.5 rounded-full text-ink-700 hover:text-ink-900 hover:bg-ink-100/70 transition-colors"
          >
            Primitives
          </a>

          {totalEvaluated > 0 && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-sage-100 text-sage-800 border border-sage-200">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-700"></span>
              <span>{totalEvaluated} Classified</span>
            </div>
          )}

          <button
            onClick={onOpenApiKeyModal}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-medium transition shadow-soft-sm ${
              apiKey && !isSimulated
                ? 'border-sage-200 bg-sage-100 text-sage-800 hover:bg-sage-200'
                : isSimulated
                ? 'border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-200'
                : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
            }`}
          >
            <Key size={12} />
            <span>
              {apiKey && !isSimulated
                ? 'Live API'
                : isSimulated
                ? 'Simulation Mode'
                : 'Connect API'}
            </span>
            {hfToken && (
              <span className="w-1.5 h-1.5 rounded-full bg-peach-600" title="Hugging Face Token Configured"></span>
            )}
          </button>

          <a
            href="https://docs.typesafe.ai"
            target="_blank"
            rel="noreferrer"
            className="micro-sheen inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-ink-900 text-white font-semibold shadow-soft-sm hover:bg-ink-800 transition-all"
          >
            <span>Docs</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </nav>
    </header>
  );
};
