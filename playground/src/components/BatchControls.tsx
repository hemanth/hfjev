import React from 'react';
import { Play, Pause, RotateCcw, Download, Sparkles, Clock, CheckCircle2, Zap, AlertCircle } from 'lucide-react';
import { PastelBadge } from './PastelBadge';

interface BatchControlsProps {
  totalRows: number;
  completedRows: number;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onExport: () => void;
  activeDimensionCount: number;
  totalTokens: { input_tokens: number; output_tokens: number };
  avgLatencyMs: number;
  isSimulated: boolean;
}

export const BatchControls: React.FC<BatchControlsProps> = ({
  totalRows,
  completedRows,
  isRunning,
  onStart,
  onStop,
  onReset,
  onExport,
  activeDimensionCount,
  totalTokens,
  avgLatencyMs,
  isSimulated,
}) => {
  const percent = totalRows > 0 ? Math.round((completedRows / totalRows) * 100) : 0;
  const isDone = totalRows > 0 && completedRows === totalRows;

  return (
    <div className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Main Execution Button & Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {!isRunning ? (
              <button
                onClick={onStart}
                disabled={activeDimensionCount === 0 || totalRows === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-[#4D3DB5] hover:bg-[#3D2FA0] px-5 py-2.5 text-xs font-semibold text-white shadow-soft-sm transition disabled:opacity-50"
              >
                <Play size={14} className="fill-current" />
                <span>
                  {completedRows > 0 && !isDone
                    ? `Resume Classification (${completedRows}/${totalRows})`
                    : `Classify ${totalRows} Rows (${activeDimensionCount} Dimensions)`}
                </span>
              </button>
            ) : (
              <button
                onClick={onStop}
                className="inline-flex items-center gap-2 rounded-xl border border-pastel-peach-border bg-pastel-peach text-pastel-peach-text hover:bg-pastel-peach-hover px-5 py-2.5 text-xs font-semibold shadow-soft-sm transition"
              >
                <Pause size={14} className="fill-current" />
                <span>Pause Classification</span>
              </button>
            )}

            {completedRows > 0 && (
              <button
                onClick={onReset}
                disabled={isRunning}
                className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-xs font-medium text-ink-700 hover:bg-ink-50 shadow-soft-sm transition disabled:opacity-50"
                title="Reset all evaluations"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}

            {completedRows > 0 && (
              <button
                onClick={onExport}
                className="inline-flex items-center gap-1.5 rounded-xl border border-pastel-mint-border bg-pastel-mint text-pastel-mint-text hover:bg-pastel-mint-hover px-3.5 py-2.5 text-xs font-semibold shadow-soft-sm transition"
              >
                <Download size={13} />
                <span>Export ({completedRows})</span>
              </button>
            )}
          </div>

          {/* Quick Stats Summary */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-600">
            {isSimulated && (
              <PastelBadge color="butter" size="sm">
                Calibrated Simulation
              </PastelBadge>
            )}

            {avgLatencyMs > 0 && (
              <div className="flex items-center gap-1">
                <Clock size={13} className="text-ink-400" />
                <span>~{Math.round(avgLatencyMs)} ms/row</span>
              </div>
            )}

            {totalTokens.input_tokens > 0 && (
              <div className="flex items-center gap-1 font-mono text-[11px] text-ink-500">
                <Zap size={12} className="text-pastel-lavender-text" />
                <span>{totalTokens.input_tokens + totalTokens.output_tokens} tokens</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar & Live Counter */}
        {(completedRows > 0 || isRunning) && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-ink-700">
                {isDone
                  ? 'All rows classified with calibrated confidence'
                  : isRunning
                  ? `Evaluating row ${completedRows + 1} of ${totalRows}...`
                  : `Paused at ${completedRows} of ${totalRows} rows`}
              </span>
              <span className="font-mono text-ink-600">{percent}%</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
              <div
                className={`h-full transition-all duration-300 ${
                  isDone
                    ? 'bg-[#10B981]'
                    : isRunning
                    ? 'bg-[#7C66DC] animate-pulse'
                    : 'bg-[#7C66DC]'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
