import React from 'react';
import { ExternalLink, Sparkles, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-ink-200/60 bg-canvas py-10 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-500 font-mono">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-ink-900 text-white flex items-center justify-center font-bold text-[10px]">
            h
          </div>
          <span>
            <strong className="text-ink-800">hfjev</strong> · Open-source semantic evaluation for Hugging Face
          </span>
        </div>

        <div className="flex items-center gap-5 text-ink-600">
          <a
            href="https://github.com/hemanth/hfjev"
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink-900 transition flex items-center gap-1"
          >
            <span>GitHub Repository</span>
            <ExternalLink size={10} />
          </a>
          <a
            href="https://huggingface.co/datasets"
            target="_blank"
            rel="noreferrer"
            className="hover:text-ink-900 transition flex items-center gap-1"
          >
            <span>Hugging Face Hub</span>
            <ExternalLink size={10} />
          </a>
          <a
            href="#/"
            className="hover:text-ink-900 transition flex items-center gap-1"
          >
            <span>Documentation</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
