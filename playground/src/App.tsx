import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { WhySection } from './components/WhySection';
import { Footer } from './components/Footer';
import { DatasetSelector } from './components/DatasetSelector';
import { DimensionManager } from './components/DimensionManager';
import { BatchControls } from './components/BatchControls';
import { DatasetTable } from './components/DatasetTable';
import { RowInspectorModal } from './components/RowInspectorModal';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { ExportModal } from './components/ExportModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PRESET_DATASETS, PRESET_DIMENSION_PACKS, getDynamicDimensionsForDataset } from './data/presets';
import { DatasetRow, Dimension, DimensionPack, RowEvaluation } from './types';
import { Table, BarChart2, AlertCircle, Sparkles, Wand2, X, Database, Sliders, RefreshCw } from 'lucide-react';
import { fetchHfRows, evaluateRow } from './services/api';

export function App() {
  // View routing ('docs' | 'studio') based on URL hash
  const getInitialView = (): 'docs' | 'studio' => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('studio')) return 'studio';
    }
    return 'docs';
  };

  const [currentView, setCurrentView] = useState<'docs' | 'studio'>(getInitialView);
  const [isDatasetPickerOpen, setIsDatasetPickerOpen] = useState(false);
  const [isDimensionManagerOpen, setIsDimensionManagerOpen] = useState(false);

  // Sync hash changes with view state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('studio')) {
        setCurrentView('studio');
      } else {
        setCurrentView('docs');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleViewChange = (view: 'docs' | 'studio') => {
    setCurrentView(view);
    if (view === 'studio') {
      window.location.hash = '#/studio';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = '#/';
    }
  };

  // API Key & Simulation state
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('typesafe_api_key') || '');
  const [hfToken, setHfToken] = useState<string>(() => localStorage.getItem('hf_token') || '');
  const [isSimulated, setIsSimulated] = useState<boolean>(() => {
    const saved = localStorage.getItem('typesafe_simulate');
    return saved !== null ? saved === 'true' : !localStorage.getItem('typesafe_api_key');
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyModalTab, setApiKeyModalTab] = useState<'typesafe' | 'huggingface'>('typesafe');

  // Active Dataset state
  const defaultPreset = PRESET_DATASETS[0];
  const [selectedDataset, setSelectedDataset] = useState<string>(defaultPreset.id);
  const [config, setConfig] = useState<string>(defaultPreset.defaultConfig);
  const [split, setSplit] = useState<string>(defaultPreset.defaultSplit);
  const [sampleSize, setSampleSize] = useState<number>(10);
  const [selectedColumn, setSelectedColumn] = useState<string>(defaultPreset.defaultColumn);
  const [candidateColumns, setCandidateColumns] = useState<string[]>([defaultPreset.defaultColumn]);
  const [features, setFeatures] = useState<Array<{ name: string; type: string }>>([]);
  const [rows, setRows] = useState<DatasetRow[]>([]);
  const [isLoadingDataset, setIsLoadingDataset] = useState<boolean>(false);
  const [datasetError, setDatasetError] = useState<string | null>(null);

  // Dynamic Adaptation state
  const [autoAdaptDimensions, setAutoAdaptDimensions] = useState<boolean>(true);
  const [activePackName, setActivePackName] = useState<string>('Film & Media Reviews');
  const [adaptationToast, setAdaptationToast] = useState<string | null>(null);

  // Dimensions state (initialized with first preset pack)
  const [dimensions, setDimensions] = useState<Dimension[]>(() => {
    const initial = getDynamicDimensionsForDataset(defaultPreset.id);
    return initial.dimensions;
  });

  // Batch Execution state
  const [isRunningBatch, setIsRunningBatch] = useState<boolean>(false);
  const [evaluatingRowIdx, setEvaluatingRowIdx] = useState<number | null>(null);
  const [totalTokens, setTotalTokens] = useState({ input_tokens: 0, output_tokens: 0 });
  const [avgLatencyMs, setAvgLatencyMs] = useState<number>(0);

  // UI Views and Modals
  const [activeTab, setActiveTab] = useState<'table' | 'analytics'>('table');
  const [inspectingRow, setInspectingRow] = useState<DatasetRow | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Ref to cancel batch processing
  const abortControllerRef = useRef<AbortController | null>(null);

  // Save API key & simulate settings
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('typesafe_api_key', key);
    if (key) {
      setIsSimulated(false);
      localStorage.setItem('typesafe_simulate', 'false');
    }
  };

  const handleSaveHfToken = (token: string) => {
    setHfToken(token);
    localStorage.setItem('hf_token', token);
  };

  const handleToggleSimulated = (sim: boolean) => {
    setIsSimulated(sim);
    localStorage.setItem('typesafe_simulate', String(sim));
  };

  // Save dimensions to localStorage
  useEffect(() => {
    localStorage.setItem('typesafe_dimensions', JSON.stringify(dimensions));
  }, [dimensions]);

  // Fetch Dataset rows from Hugging Face
  const fetchDatasetRows = useCallback(async (
    dsId: string,
    cfg: string = 'default',
    splt: string = 'train',
    limit: number = 10,
    preferredColumn?: string
  ) => {
    setIsLoadingDataset(true);
    setDatasetError(null);
    try {
      const data = await fetchHfRows(dsId, cfg, splt, limit, hfToken);

      const returnedFeatures = data.features || [];
      setFeatures(returnedFeatures);
      setCandidateColumns(data.candidateTextColumns || []);

      let colToUse = preferredColumn;
      if (!colToUse || !returnedFeatures.some((f: any) => f.name === colToUse)) {
        colToUse = data.candidateTextColumns?.[0] || returnedFeatures[0]?.name || 'text';
      }
      setSelectedColumn(colToUse);

      const parsedRows: DatasetRow[] = (data.rows || []).map((item: any, idx: number) => ({
        row_idx: item.row_idx !== undefined ? item.row_idx : idx,
        row: item.row || {},
        status: 'idle'
      }));

      setRows(parsedRows);

      // Dynamically adapt dimensions for the newly selected dataset
      if (autoAdaptDimensions) {
        const dynamic = getDynamicDimensionsForDataset(dsId, returnedFeatures, parsedRows[0]?.row);
        setDimensions(dynamic.dimensions);
        setActivePackName(dynamic.packName);
        const shortName = dsId.split('/').pop() || dsId;
        setAdaptationToast(`Dimensions auto-adapted for "${shortName}" (${dynamic.packName})`);
        setTimeout(() => setAdaptationToast(null), 4500);
      }
    } catch (err: any) {
      console.error('Error fetching dataset rows:', err);
      setDatasetError(err.message || 'Failed to fetch rows from Hugging Face');
    } finally {
      setIsLoadingDataset(false);
    }
  }, [autoAdaptDimensions, hfToken]);

  // Initial load
  useEffect(() => {
    fetchDatasetRows(selectedDataset, config, split, sampleSize, selectedColumn);
  }, []);

  // Handler when user selects a dataset
  const handleSelectDataset = (
    dsId: string,
    newConfig?: string,
    newSplit?: string,
    newColumn?: string
  ) => {
    setSelectedDataset(dsId);
    const c = newConfig || 'default';
    const s = newSplit || 'train';
    setConfig(c);
    setSplit(s);
    fetchDatasetRows(dsId, c, s, sampleSize, newColumn);
  };

  const handleConfigChange = (newConfig: string) => {
    setConfig(newConfig);
    fetchDatasetRows(selectedDataset, newConfig, split, sampleSize, selectedColumn);
  };

  const handleSplitChange = (newSplit: string) => {
    setSplit(newSplit);
    fetchDatasetRows(selectedDataset, config, newSplit, sampleSize, selectedColumn);
  };

  const handleSampleSizeChange = (newSize: number) => {
    setSampleSize(newSize);
    fetchDatasetRows(selectedDataset, config, split, newSize, selectedColumn);
  };

  // Custom local rows upload
  const handleLoadCustomRows = (customRows: any[], name: string, col: string) => {
    setSelectedDataset(`local:${name}`);
    setSelectedColumn(col);
    const customFeatures = Object.keys(customRows[0]?.row || {}).map(k => ({ name: k, type: 'string' }));
    setFeatures(customFeatures);
    setCandidateColumns([col]);
    setRows(customRows);

    if (autoAdaptDimensions) {
      const dynamic = getDynamicDimensionsForDataset(name, customFeatures, customRows[0]?.row);
      setDimensions(dynamic.dimensions);
      setActivePackName(dynamic.packName);
      setAdaptationToast(`Dimensions auto-adapted for uploaded file (${dynamic.packName})`);
      setTimeout(() => setAdaptationToast(null), 4500);
    }
  };

  // Explicit re-generation
  const handleReGenerateDimensions = () => {
    const dynamic = getDynamicDimensionsForDataset(selectedDataset, features, rows[0]?.row);
    setDimensions(dynamic.dimensions);
    setActivePackName(dynamic.packName);
    const shortName = selectedDataset.split('/').pop() || selectedDataset;
    setAdaptationToast(`Dimensions re-adapted for "${shortName}" (${dynamic.packName})`);
    setTimeout(() => setAdaptationToast(null), 4000);
  };

  // Dimension operations
  const handleToggleDimension = (id: string) => {
    setDimensions(dims => dims.map(d => d.id === id ? { ...d, enabled: !d.enabled } : d));
  };

  const handleUpdateDimension = (updated: Dimension) => {
    setDimensions(dims => dims.map(d => d.id === updated.id ? updated : d));
  };

  const handleAddDimension = (newDim: Dimension) => {
    setDimensions(dims => [...dims, newDim]);
  };

  const handleDeleteDimension = (id: string) => {
    setDimensions(dims => dims.filter(d => d.id !== id));
  };

  const handleApplyPack = (pack: DimensionPack) => {
    setDimensions(pack.dimensions);
  };

  // Prepare questions payload for active dimensions
  const buildQuestionsPayload = () => {
    const active = dimensions.filter(d => d.enabled);
    const questionsPayload: Record<string, any> = {};

    for (const d of active) {
      if (d.type === 'choice') {
        questionsPayload[d.id] = {
          type: 'choice',
          instructions: d.instructions,
          criteria: d.criteria
        };
      } else if (d.type === 'noul') {
        questionsPayload[d.id] = {
          type: 'noul',
          instructions: d.instructions,
          criteria: d.criteria
        };
      } else if (d.type === 'score') {
        questionsPayload[d.id] = {
          type: 'score',
          instructions: d.instructions,
          criteria: d.criteria
        };
      }
    }
    return questionsPayload;
  };

  // Single Row Classification
  const handleClassifySingleRow = async (rowIdx: number) => {
    const targetRow = rows.find(r => r.row_idx === rowIdx);
    if (!targetRow) return;

    const questions = buildQuestionsPayload();
    if (Object.keys(questions).length === 0) {
      alert('Please enable at least one dimension before classifying.');
      return;
    }

    setEvaluatingRowIdx(rowIdx);
    setRows(prev => prev.map(r => r.row_idx === rowIdx ? { ...r, status: 'evaluating' } : r));

    try {
      const stateContent = targetRow.row[selectedColumn] !== undefined
        ? String(targetRow.row[selectedColumn])
        : targetRow.row;

      const data = await evaluateRow({
        state: stateContent,
        questions,
        model: 'jev-latest',
        apiKey,
        simulate: isSimulated
      });

      setRows(prev => prev.map(r => {
        if (r.row_idx === rowIdx) {
          return {
            ...r,
            status: 'completed',
            evaluation: {
              model: data.model,
              answers: data.answers,
              usage: data.usage,
              latencyMs: data.latencyMs,
              isSimulated: data.isSimulated,
              timestamp: new Date().toISOString()
            }
          };
        }
        return r;
      }));

      // Update tokens & latency
      if (data.usage) {
        setTotalTokens(t => ({
          input_tokens: t.input_tokens + (data.usage.input_tokens || 0),
          output_tokens: t.output_tokens + (data.usage.output_tokens || 0)
        }));
      }
      if (data.latencyMs) {
        setAvgLatencyMs(prev => prev === 0 ? data.latencyMs : (prev + data.latencyMs) / 2);
      }
    } catch (err: any) {
      console.error('Single row evaluation error:', err);
      setRows(prev => prev.map(r => r.row_idx === rowIdx ? { ...r, status: 'error', error: err.message } : r));
    } finally {
      setEvaluatingRowIdx(null);
    }
  };

  // Batch Classification
  const handleStartBatch = async () => {
    const questions = buildQuestionsPayload();
    if (Object.keys(questions).length === 0) {
      alert('Please enable at least one dimension before classifying.');
      return;
    }

    setIsRunningBatch(true);
    abortControllerRef.current = new AbortController();

    // Iterate through unevaluated rows sequentially or in controlled stream
    const uncompletedRows = rows.filter(r => !r.evaluation || Object.keys(r.evaluation.answers || {}).length === 0);
    const targetList = uncompletedRows.length > 0 ? uncompletedRows : rows;

    for (let i = 0; i < targetList.length; i++) {
      if (abortControllerRef.current?.signal.aborted) {
        break;
      }

      const rowItem = targetList[i];
      setEvaluatingRowIdx(rowItem.row_idx);
      setRows(prev => prev.map(r => r.row_idx === rowItem.row_idx ? { ...r, status: 'evaluating' } : r));

      try {
        const stateContent = rowItem.row[selectedColumn] !== undefined
          ? String(rowItem.row[selectedColumn])
          : rowItem.row;

        const data = await evaluateRow({
          state: stateContent,
          questions,
          model: 'jev-latest',
          apiKey,
          simulate: isSimulated,
          signal: abortControllerRef.current.signal
        });

        setRows(prev => prev.map(r => {
          if (r.row_idx === rowItem.row_idx) {
            return {
              ...r,
              status: 'completed',
              evaluation: {
                model: data.model,
                answers: data.answers,
                usage: data.usage,
                latencyMs: data.latencyMs,
                isSimulated: data.isSimulated,
                timestamp: new Date().toISOString()
              }
            };
          }
          return r;
        }));

        if (data.usage) {
          setTotalTokens(t => ({
            input_tokens: t.input_tokens + (data.usage.input_tokens || 0),
            output_tokens: t.output_tokens + (data.usage.output_tokens || 0)
          }));
        }
        if (data.latencyMs) {
          setAvgLatencyMs(prev => prev === 0 ? data.latencyMs : (prev + data.latencyMs) / 2);
        }
      } catch (err: any) {
        if (err.name === 'AbortError' || abortControllerRef.current?.signal.aborted) break;
        console.error(`Error on row ${rowItem.row_idx}:`, err);
        setRows(prev => prev.map(r => r.row_idx === rowItem.row_idx ? { ...r, status: 'error', error: err.message } : r));
      }
    }

    setEvaluatingRowIdx(null);
    setIsRunningBatch(false);
  };

  const handleStopBatch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunningBatch(false);
    setEvaluatingRowIdx(null);
  };

  const handleResetBatch = () => {
    setRows(prev => prev.map(r => ({ ...r, evaluation: undefined, status: 'idle', error: undefined })));
    setTotalTokens({ input_tokens: 0, output_tokens: 0 });
    setAvgLatencyMs(0);
  };

  const completedCount = rows.filter(r => r.evaluation && Object.keys(r.evaluation.answers || {}).length > 0).length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#191E28] pb-16 font-sans">
      {/* Top Header with Navigation & API Key Status */}
      <Header
        currentView={currentView}
        onChangeView={handleViewChange}
        apiKey={apiKey}
        isSimulated={isSimulated}
        hfToken={hfToken}
        onOpenApiKeyModal={(tab) => {
          setApiKeyModalTab(tab || 'typesafe');
          setIsApiKeyModalOpen(true);
        }}
        activeDatasetName={selectedDataset}
        totalEvaluated={completedCount}
      />

      {/* VIEW 1: OVERVIEW & DOCS */}
      {currentView === 'docs' && (
        <>
          <HeroSection
            onScrollToStudio={() => handleViewChange('studio')}
            datasetCount={rows.length}
          />

          <WhySection />

          {/* Quick Launch CTA Banner */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="rounded-2xl border border-ink-200/80 bg-white p-8 text-center shadow-soft-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-peach-100 text-peach-800 border border-peach-200 mb-3">
                <Sparkles size={13} />
                <span>Interactive Classifier Studio</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">
                Ready to evaluate your dataset?
              </h3>
              <p className="text-xs sm:text-sm text-ink-600 max-w-lg mx-auto mb-5 font-sans leading-relaxed">
                Launch the studio workbench to classify Hugging Face datasets or upload your own files with calibrated probabilities and speculative fan-out.
              </p>
              <button
                onClick={() => handleViewChange('studio')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ink-900 text-white font-semibold text-xs shadow-soft-md hover:bg-peach-700 active:scale-[0.98] transition-all"
              >
                <span>Launch Classifier Studio</span>
                <Sparkles size={14} />
              </button>
            </div>
          </section>

          <Footer />
        </>
      )}

      {/* VIEW 2: DEDICATED STUDIO WORKBENCH */}
      {currentView === 'studio' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 space-y-5">
          {/* Breadcrumb & Section Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ink-200/60 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-peach-800 font-semibold mb-1">
                <span>Interactive Workbench</span>
                <span className="text-ink-400">/</span>
                <span className="text-ink-600">TypeSafe Jev System One</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
                Dataset Classifier Studio
              </h1>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-ink-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Hub API Active</span>
              <span className="text-ink-300">·</span>
              <span>Speculative Fan-out</span>
            </div>
          </div>

          {/* Error notification if any */}
          {datasetError && (
            <div className="rounded-xl border border-peach-200 bg-peach-50/90 p-4 text-xs text-peach-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-soft-sm animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={16} className="text-peach-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block sm:inline mr-1">Dataset Notice:</span>
                  <span>{datasetError}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {(datasetError.toLowerCase().includes('authentication') ||
                  datasetError.toLowerCase().includes('gated') ||
                  datasetError.toLowerCase().includes('private') ||
                  datasetError.toLowerCase().includes('does not exist')) && (
                  <button
                    onClick={() => {
                      setApiKeyModalTab('huggingface');
                      setIsApiKeyModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-peach-700 text-white font-medium hover:bg-peach-800 shadow-soft-sm transition"
                  >
                    Configure HF Token
                  </button>
                )}
                <button
                  onClick={() => fetchDatasetRows(selectedDataset, config, split, sampleSize, selectedColumn)}
                  className="px-3 py-1.5 rounded-lg border border-peach-300 font-medium hover:bg-peach-100/70 transition"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Auto-adaptation notification toast */}
          {adaptationToast && (
            <div className="rounded-xl border border-pastel-lavender-border bg-pastel-lavender/70 px-4 py-2 text-xs text-pastel-lavender-text shadow-soft-sm flex items-center justify-between transition-all animate-fadeIn">
              <div className="flex items-center gap-2 font-medium">
                <Sparkles size={14} className="text-[#4D3DB5]" />
                <span>{adaptationToast}</span>
              </div>
              <button
                onClick={() => setAdaptationToast(null)}
                className="text-ink-400 hover:text-ink-700 p-0.5 rounded transition"
                aria-label="Dismiss notification"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Studio Command Bar: High-density, uncluttered controls */}
          <div className="rounded-2xl border border-ink-200/80 bg-white p-4 shadow-soft-sm space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-3">
              {/* Active Dataset Pill & Picker Trigger */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ink-50 border border-ink-200/80 text-xs font-mono">
                  <Database size={14} className="text-peach-700" />
                  <span className="font-semibold text-ink-900 max-w-[220px] truncate" title={selectedDataset}>
                    {selectedDataset}
                  </span>
                  {isLoadingDataset && (
                    <span className="text-[10px] text-peach-700 animate-pulse font-bold">Loading...</span>
                  )}
                </div>

                <button
                  onClick={() => setIsDatasetPickerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink-900 text-white hover:bg-peach-700 text-xs font-medium shadow-soft-sm transition"
                >
                  <Database size={13} />
                  <span>Change Dataset</span>
                </button>

                {/* Inline Configuration Dropdowns */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Split Dropdown */}
                  <div className="flex items-center gap-1 text-xs font-mono bg-ink-50 px-2.5 py-1 rounded-lg border border-ink-200">
                    <span className="text-ink-400 text-[11px]">split:</span>
                    <select
                      value={split}
                      onChange={(e) => handleSplitChange(e.target.value)}
                      disabled={isLoadingDataset}
                      className="bg-transparent text-ink-800 font-semibold focus:outline-none cursor-pointer text-xs"
                    >
                      <option value="train">train</option>
                      <option value="test">test</option>
                      <option value="validation">validation</option>
                    </select>
                  </div>

                  {/* Rows Limit Dropdown */}
                  <div className="flex items-center gap-1 text-xs font-mono bg-ink-50 px-2.5 py-1 rounded-lg border border-ink-200">
                    <span className="text-ink-400 text-[11px]">rows:</span>
                    <select
                      value={sampleSize}
                      onChange={(e) => handleSampleSizeChange(Number(e.target.value))}
                      disabled={isLoadingDataset}
                      className="bg-transparent text-ink-800 font-semibold focus:outline-none cursor-pointer text-xs"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  {/* Target Column Dropdown */}
                  {candidateColumns.length > 0 && (
                    <div className="flex items-center gap-1 text-xs font-mono bg-ink-50 px-2.5 py-1 rounded-lg border border-ink-200">
                      <span className="text-ink-400 text-[11px]">col:</span>
                      <select
                        value={selectedColumn}
                        onChange={(e) => setSelectedColumn(e.target.value)}
                        disabled={isLoadingDataset}
                        className="bg-transparent text-ink-800 font-semibold focus:outline-none cursor-pointer text-xs max-w-[130px] truncate"
                      >
                        {candidateColumns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Rubrics & Dimension Manager Trigger */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDimensionManagerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pastel-lavender/60 border border-pastel-lavender-border text-xs text-pastel-lavender-text font-mono hover:bg-pastel-lavender transition"
                  title="Configure rubrics, criteria, and primitives"
                >
                  <Sliders size={13} />
                  <span className="font-semibold">{dimensions.filter(d => d.enabled).length} Rubrics Active</span>
                  <span className="text-[10px] opacity-75 hidden sm:inline">({activePackName})</span>
                </button>

                <button
                  onClick={handleReGenerateDimensions}
                  title="Auto-adapt rubrics to current dataset"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-ink-200 hover:bg-ink-50 text-xs font-mono text-ink-700 transition"
                >
                  <Sparkles size={13} className="text-peach-700" />
                  <span className="hidden sm:inline">Auto-Adapt</span>
                </button>
              </div>
            </div>

            {/* Batch Execution Controls Bar */}
            <BatchControls
              totalRows={rows.length}
              completedRows={completedCount}
              isRunning={isRunningBatch}
              onStart={handleStartBatch}
              onStop={handleStopBatch}
              onReset={handleResetBatch}
              onExport={() => setIsExportModalOpen(true)}
              activeDimensionCount={dimensions.filter(d => d.enabled).length}
              totalTokens={totalTokens}
              avgLatencyMs={avgLatencyMs}
              isSimulated={isSimulated}
            />
          </div>

          {/* Tab Navigation (Table vs Analytics) */}
          <div className="flex items-center gap-2 border-b border-ink-200/80 pb-1">
            <button
              onClick={() => setActiveTab('table')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'table'
                  ? 'bg-white text-ink-900 shadow-soft-sm border border-ink-200'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <Table size={14} />
              <span>Classified Table ({rows.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'analytics'
                  ? 'bg-white text-ink-900 shadow-soft-sm border border-ink-200'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <BarChart2 size={14} />
              <span>Dimension Analytics &amp; Certainty</span>
            </button>
          </div>

          {/* Tab 1: Dataset Table */}
          {activeTab === 'table' && (
            <DatasetTable
              rows={rows}
              dimensions={dimensions}
              selectedColumn={selectedColumn}
              onInspectRow={(r) => setInspectingRow(r)}
              onClassifySingleRow={handleClassifySingleRow}
              evaluatingRowIdx={evaluatingRowIdx}
            />
          )}

          {/* Tab 2: Dimension Analytics */}
          {activeTab === 'analytics' && (
            <AnalyticsPanel
              rows={rows}
              dimensions={dimensions}
              onInspectRow={(r) => setInspectingRow(r)}
            />
          )}
        </main>
      )}

      {/* MODAL 1: Dataset Picker Modal */}
      {isDatasetPickerOpen && (
        <DatasetSelector
          selectedDataset={selectedDataset}
          config={config}
          split={split}
          sampleSize={sampleSize}
          selectedColumn={selectedColumn}
          candidateColumns={candidateColumns}
          features={features}
          isLoading={isLoadingDataset}
          hfToken={hfToken}
          isModal={true}
          onClose={() => setIsDatasetPickerOpen(false)}
          onOpenApiKeyModal={(tab) => {
            setApiKeyModalTab(tab);
            setIsApiKeyModalOpen(true);
          }}
          onSelectDataset={(dsId, cfg, splt, col) => {
            handleSelectDataset(dsId, cfg, splt, col);
            setIsDatasetPickerOpen(false);
          }}
          onConfigChange={handleConfigChange}
          onSplitChange={handleSplitChange}
          onSampleSizeChange={handleSampleSizeChange}
          onColumnChange={setSelectedColumn}
          onLoadCustomRows={(customRows, name, col) => {
            handleLoadCustomRows(customRows, name, col);
            setIsDatasetPickerOpen(false);
          }}
          onApplyRecommendedPack={(packId) => {
            const found = PRESET_DIMENSION_PACKS.find(p => p.id === packId);
            if (found) {
              handleApplyPack(found);
              setActivePackName(found.name);
            }
          }}
        />
      )}

      {/* MODAL 2: Dimension Manager Modal */}
      {isDimensionManagerOpen && (
        <DimensionManager
          dimensions={dimensions}
          onToggleDimension={handleToggleDimension}
          onUpdateDimension={handleUpdateDimension}
          onAddDimension={handleAddDimension}
          onDeleteDimension={handleDeleteDimension}
          onApplyPack={(pack) => {
            handleApplyPack(pack);
            setActivePackName(pack.name);
          }}
          autoAdapt={autoAdaptDimensions}
          onToggleAutoAdapt={setAutoAdaptDimensions}
          activePackName={activePackName}
          onReGenerate={handleReGenerateDimensions}
          isModal={true}
          onClose={() => setIsDimensionManagerOpen(false)}
        />
      )}

      {/* MODAL 3: Deep Row Inspection Modal */}
      <RowInspectorModal
        isOpen={!!inspectingRow}
        onClose={() => setInspectingRow(null)}
        row={inspectingRow}
        dimensions={dimensions}
        selectedColumn={selectedColumn}
      />

      {/* MODAL 4: Export Enriched Dataset Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        rows={rows}
        dimensions={dimensions}
        datasetName={selectedDataset}
      />

      {/* MODAL 5: API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        hfToken={hfToken}
        onSaveHfToken={handleSaveHfToken}
        isSimulated={isSimulated}
        onToggleSimulated={handleToggleSimulated}
        initialTab={apiKeyModalTab}
      />
    </div>
  );
}
