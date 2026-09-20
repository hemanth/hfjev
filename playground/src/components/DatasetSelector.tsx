import React, { useState, useEffect, useRef } from 'react';
import { Search, Database, ChevronDown, Check, Sparkles, FileText, Upload, AlertCircle, Loader2, Heart, Download, X, Key } from 'lucide-react';
import { PRESET_DATASETS, PresetDataset } from '../data/presets';
import { PastelBadge } from './PastelBadge';
import { HFDatasetMeta } from '../types';
import { searchHfDatasets } from '../services/api';

interface DatasetSelectorProps {
  selectedDataset: string;
  config: string;
  split: string;
  sampleSize: number;
  selectedColumn: string;
  candidateColumns: string[];
  features: Array<{ name: string; type: string }>;
  isLoading: boolean;
  hfToken?: string;
  isModal?: boolean;
  onClose?: () => void;
  onOpenApiKeyModal?: (tab: 'typesafe' | 'huggingface') => void;
  onSelectDataset: (datasetId: string, config?: string, split?: string, column?: string) => void;
  onConfigChange: (config: string) => void;
  onSplitChange: (split: string) => void;
  onSampleSizeChange: (size: number) => void;
  onColumnChange: (col: string) => void;
  onLoadCustomRows: (rows: any[], name: string, column: string) => void;
  onApplyRecommendedPack?: (packId: string) => void;
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  selectedDataset,
  config,
  split,
  sampleSize,
  selectedColumn,
  candidateColumns,
  features,
  isLoading,
  hfToken,
  isModal = false,
  onClose,
  onOpenApiKeyModal,
  onSelectDataset,
  onConfigChange,
  onSplitChange,
  onSampleSizeChange,
  onColumnChange,
  onLoadCustomRows,
  onApplyRecommendedPack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HFDatasetMeta[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [activeTab, setActiveTab] = useState<'presets' | 'search' | 'upload'>('presets');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search for HF datasets
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchHfDatasets(searchQuery, hfToken);
        if (data.datasets) {
          setSearchResults(data.datasets);
          setIsDropdownOpen(true);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, hfToken]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPreset = (preset: PresetDataset) => {
    onSelectDataset(preset.id, preset.defaultConfig, preset.defaultSplit, preset.defaultColumn);
    if (onApplyRecommendedPack && preset.recommendedPack) {
      onApplyRecommendedPack(preset.recommendedPack);
    }
    if (onClose) onClose();
  };

  const handleCustomDatasetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onSelectDataset(customInput.trim());
      setIsDropdownOpen(false);
      if (onClose) onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        let parsedRows: any[] = [];
        let col = 'text';

        if (file.name.endsWith('.json') || file.name.endsWith('.jsonl')) {
          if (file.name.endsWith('.jsonl') || text.trim().startsWith('{')) {
            const lines = text.split('\n').filter(l => l.trim());
            parsedRows = lines.map((line, idx) => {
              try {
                return { row_idx: idx, row: JSON.parse(line) };
              } catch {
                return null;
              }
            }).filter(Boolean);
          } else {
            const json = JSON.parse(text);
            const array = Array.isArray(json) ? json : (json.rows || [json]);
            parsedRows = array.map((item: any, idx: number) => ({
              row_idx: idx,
              row: typeof item === 'string' ? { text: item } : item
            }));
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').filter(l => l.trim());
          if (lines.length > 0) {
            const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
            col = headers.find(h => ['text', 'sentence', 'review', 'prompt', 'input'].includes(h.toLowerCase())) || headers[0];
            parsedRows = lines.slice(1, 101).map((line, idx) => {
              const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
              const rowObj: Record<string, string> = {};
              headers.forEach((h, i) => {
                rowObj[h] = values[i] || '';
              });
              return { row_idx: idx, row: rowObj };
            });
          }
        }

        if (parsedRows.length === 0) {
          throw new Error('Could not parse any rows from file');
        }

        onLoadCustomRows(parsedRows, file.name.replace(/\.[^/.]+$/, ''), col);
        if (onClose) onClose();
      } catch (err: any) {
        setUploadError(err.message || 'Failed to parse file');
      }
    };
    reader.readAsText(file);
  };

  const content = (
    <div className="flex flex-col gap-4">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pastel-sky text-pastel-sky-text">
            <Database size={15} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink-900">Select Dataset Source</h2>
            <p className="text-[11px] text-ink-500">Choose a popular preset, search the Hugging Face Hub, or upload local files</p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-ink-100/70 p-1 text-xs">
          <button
            onClick={() => setActiveTab('presets')}
            className={`rounded-lg px-3 py-1 font-medium transition ${
              activeTab === 'presets'
                ? 'bg-white text-ink-900 shadow-soft-sm font-semibold'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Popular Presets
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`rounded-lg px-3 py-1 font-medium transition ${
              activeTab === 'search'
                ? 'bg-white text-ink-900 shadow-soft-sm font-semibold'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Search Hugging Face
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`rounded-lg px-3 py-1 font-medium transition ${
              activeTab === 'upload'
                ? 'bg-white text-ink-900 shadow-soft-sm font-semibold'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Upload / Custom
          </button>
        </div>
      </div>

      {/* Tab 1: Popular Presets */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESET_DATASETS.map((preset) => {
            const isSelected = selectedDataset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                  isSelected
                    ? 'border-[#7C66DC] bg-pastel-lavender/40 ring-1 ring-[#7C66DC]'
                    : 'border-ink-200/70 bg-white hover:border-ink-300 hover:bg-ink-50/50'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-semibold text-ink-900 truncate">
                    {preset.name}
                  </span>
                  <PastelBadge color="sky" size="sm">
                    {preset.category}
                  </PastelBadge>
                </div>
                <p className="text-[11px] text-ink-600 line-clamp-2 mb-2 leading-relaxed font-sans">
                  {preset.description}
                </p>
                <div className="mt-auto flex items-center gap-1.5 text-[10px] text-ink-500 font-mono">
                  <code className="truncate max-w-[210px]">{preset.id}</code>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab 2: Search Hugging Face */}
      {activeTab === 'search' && (
        <div className="space-y-3">
          {/* Gated / Private Token notice banner */}
          <div className="flex items-center justify-between rounded-xl bg-peach-50 border border-peach-200 p-2.5 text-xs text-peach-900">
            <div className="flex items-center gap-2">
              <Key size={13} className="text-peach-700 shrink-0" />
              <span>Searching gated or private datasets (e.g. LLaMA, Gemma)?</span>
            </div>
            {onOpenApiKeyModal && (
              <button
                type="button"
                onClick={() => onOpenApiKeyModal('huggingface')}
                className="font-semibold text-peach-800 hover:text-peach-950 underline shrink-0 text-[11px]"
              >
                {hfToken ? 'HF Token Configured ✓' : 'Set HF Access Token →'}
              </button>
            )}
          </div>

          <div ref={searchContainerRef} className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setIsDropdownOpen(true)}
                  placeholder="Search thousands of datasets on Hugging Face (e.g. imdb, glue, alpaca, news)..."
                  className="w-full rounded-xl border border-ink-200/90 pl-10 pr-4 py-2 text-xs font-medium placeholder:text-ink-400 focus:border-[#7C66DC] focus:outline-none focus:ring-2 focus:ring-[#EEF0FD]"
                />
                {isSearching && (
                  <Loader2
                    size={15}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-ink-400"
                  />
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (searchQuery.trim()) {
                    onSelectDataset(searchQuery.trim());
                    if (onClose) onClose();
                  }
                }}
                className="rounded-xl bg-ink-900 px-4 py-2 text-xs font-medium text-white hover:bg-ink-800 transition"
              >
                Load
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {isDropdownOpen && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-72 overflow-y-auto rounded-xl border border-ink-200 bg-white p-1.5 shadow-soft-lg">
                {searchResults.map((ds) => (
                  <button
                    key={ds.id}
                    onClick={() => {
                      onSelectDataset(ds.id);
                      setIsDropdownOpen(false);
                      setSearchQuery(ds.id);
                      if (onClose) onClose();
                    }}
                    className="flex w-full flex-col items-start rounded-lg p-2.5 text-left hover:bg-ink-50 transition"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-semibold text-ink-900">{ds.id}</span>
                      <div className="flex items-center gap-2 text-[10px] text-ink-500">
                        {ds.likes > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Heart size={10} className="text-coral-500 fill-coral-500/20" />
                            {ds.likes}
                          </span>
                        )}
                        {ds.downloads > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Download size={10} className="text-ink-400" />
                            {ds.downloads}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-0.5 text-[11px] text-ink-600 line-clamp-1">
                      {ds.description}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Direct Dataset Repo ID input */}
          <form onSubmit={handleCustomDatasetSubmit} className="flex items-center gap-2 pt-1">
            <span className="text-xs text-ink-500 whitespace-nowrap">Or exact repository ID:</span>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. stanfordnlp/imdb or glue"
              className="flex-1 rounded-xl border border-ink-200 px-3 py-1.5 text-xs font-mono focus:border-[#7C66DC] focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 transition"
            >
              Fetch
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Upload Local File */}
      {activeTab === 'upload' && (
        <div className="rounded-xl border-2 border-dashed border-ink-200 p-6 text-center">
          <Upload size={24} className="mx-auto mb-2 text-ink-400" />
          <p className="text-xs font-medium text-ink-700">Upload custom dataset file (.json, .jsonl, or .csv)</p>
          <p className="text-[11px] text-ink-500 mt-1">Classify your own proprietary records, customer messages, or logs</p>
          <input
            type="file"
            accept=".json,.jsonl,.csv"
            onChange={handleFileUpload}
            className="mt-3 block mx-auto text-xs text-ink-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-pastel-lavender file:text-pastel-lavender-text hover:file:bg-pastel-lavender-hover cursor-pointer"
          />
          {uploadError && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-pastel-rose-text">
              <AlertCircle size={14} />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer info in modal */}
      {isModal && (
        <div className="flex items-center justify-between pt-3 border-t border-ink-100 text-xs text-ink-500">
          <span>Active dataset: <strong className="font-mono text-ink-800">{selectedDataset}</strong></span>
          <button
            onClick={onClose}
            className="rounded-xl px-3 py-1.5 border border-ink-200 text-ink-700 hover:bg-ink-50 font-medium"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-soft-lg border border-ink-100">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft-sm">
      {content}
    </div>
  );
};
