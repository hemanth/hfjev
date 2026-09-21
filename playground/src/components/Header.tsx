import { Key, Cpu } from 'lucide-react';
import { type ExecutionEngine } from '../services/api';

interface HeaderProps {
  currentView: 'docs' | 'studio';
  onChangeView: (view: 'docs' | 'studio') => void;
  apiKey: string;
  isSimulated: boolean;
  engineMode?: ExecutionEngine;
  webmlModel?: string;
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
  totalEvaluated,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 py-2.5 backdrop-blur-md bg-[#fbfaf7]/85 border-b border-ink-200/50 transition-all">
      <nav className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand: clean, minimal hfjev */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onChangeView('docs')}
            className="group flex items-center gap-2 font-mono text-sm font-bold tracking-tight text-ink-900 hover:opacity-80 transition"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-ink-900 text-white text-xs font-bold shadow-soft-xs group-hover:bg-peach-700 transition">
              h
            </span>
            <span className="text-ink-900 font-semibold tracking-tight text-sm">hfjev</span>
          </button>
        </div>

        {/* Minimal View Switcher: Studio vs Docs */}
        <div className="flex items-center rounded-xl bg-ink-100/70 p-0.5 border border-ink-200/50 text-xs font-mono">
          <button
            onClick={() => onChangeView('studio')}
            className={`inline-flex items-center px-3 py-1 rounded-lg transition-all ${
              currentView === 'studio'
                ? 'bg-white text-ink-900 font-semibold shadow-soft-xs'
                : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            <span>Studio</span>
          </button>

          <button
            onClick={() => onChangeView('docs')}
            className={`inline-flex items-center px-3 py-1 rounded-lg transition-all ${
              currentView === 'docs'
                ? 'bg-white text-ink-900 font-semibold shadow-soft-xs'
                : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            <span>Docs</span>
          </button>
        </div>

        {/* Actions: Keys & GitHub */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {totalEvaluated > 0 && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono text-sage-800 bg-sage-50 border border-sage-200/70">
              {totalEvaluated} done
            </span>
          )}

          <button
            onClick={() => onOpenApiKeyModal()}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-medium transition ${
              engineMode === 'webml-kit'
                ? 'border-pastel-lavender-border bg-pastel-lavender text-pastel-lavender-text hover:bg-pastel-lavender-hover'
                : (engineMode === 'cloud-api' || (apiKey && !isSimulated))
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
            }`}
            title="Configure API credentials and tokens"
          >
            {engineMode === 'webml-kit' ? (
              <Cpu size={12} className="text-[#4D3DB5]" />
            ) : (
              <Key size={12} className={(engineMode === 'cloud-api' || (apiKey && !isSimulated)) ? "text-emerald-700" : "text-ink-500"} />
            )}
            <span>Engine</span>
            <span className="text-[10px] font-mono opacity-80">
              {engineMode === 'webml-kit' ? 'webml' : (engineMode === 'cloud-api' || (apiKey && !isSimulated)) ? 'live' : 'sim'}
            </span>
            {hfToken && (
              <span className="w-1.5 h-1.5 rounded-full bg-peach-600" title="HF Token Active"></span>
            )}
          </button>

          <a
            href="https://github.com/hemanth/hfjev"
            target="_blank"
            rel="noreferrer"
            className="text-ink-500 hover:text-ink-900 transition p-1"
            title="GitHub Repository"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </nav>
    </header>
  );
};
