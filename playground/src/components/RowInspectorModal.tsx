import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, Terminal, BarChart2, ShieldCheck, Clock, Zap } from 'lucide-react';
import { DatasetRow, Dimension, ChoiceAnswer, NoulAnswer, ScoreAnswer } from '../types';
import { PastelBadge } from './PastelBadge';
import { ConfidenceRing } from './ConfidenceRing';

interface RowInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: DatasetRow | null;
  dimensions: Dimension[];
  selectedColumn: string;
}

export const RowInspectorModal: React.FC<RowInspectorModalProps> = ({
  isOpen,
  onClose,
  row,
  dimensions,
  selectedColumn,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'judgments' | 'json'>('judgments');

  if (!isOpen || !row) return null;

  const evaluation = row.evaluation;
  const rowText = row.row[selectedColumn] !== undefined ? String(row.row[selectedColumn]) : JSON.stringify(row.row);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(evaluation || row, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-soft-lg border border-ink-100 my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-ink-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pastel-lavender text-pastel-lavender-text">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-ink-900">
                  Row #{row.row_idx} Inspection
                </h3>
                {evaluation?.isSimulated ? (
                  <PastelBadge color="butter" size="sm">
                    Simulated
                  </PastelBadge>
                ) : (
                  <PastelBadge color="mint" size="sm">
                    {evaluation?.model || 'jev-latest'}
                  </PastelBadge>
                )}
              </div>
              <p className="text-xs text-ink-500">
                Evaluation state, judgments, and calibrated probability distributions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-ink-100/70 p-1 text-xs mr-8">
            <button
              onClick={() => setActiveTab('judgments')}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                activeTab === 'judgments'
                  ? 'bg-white text-ink-900 shadow-soft-sm'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              Judgments
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                activeTab === 'json'
                  ? 'bg-white text-ink-900 shadow-soft-sm'
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              Raw JSON
            </button>
          </div>
        </div>

        {/* State / Text Preview */}
        <div className="mb-4 rounded-xl border border-ink-200/80 bg-ink-50/50 p-3.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-ink-500 mb-1.5">
            <span>Evaluated State (<code className="font-mono">{selectedColumn}</code>):</span>
            <span>{rowText.length} characters</span>
          </div>
          <div className="text-xs text-ink-800 leading-relaxed font-sans max-h-36 overflow-y-auto whitespace-pre-wrap">
            {rowText}
          </div>
        </div>

        {/* Tab 1: Detailed Judgments */}
        {activeTab === 'judgments' && (
          <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
            {!evaluation || !evaluation.answers || Object.keys(evaluation.answers).length === 0 ? (
              <div className="py-8 text-center text-xs text-ink-500">
                This row has not been evaluated yet. Click "Classify" in the table or run batch classification.
              </div>
            ) : (
              Object.entries(evaluation.answers).map(([dimId, ans]) => {
                const dimDef = dimensions.find((d) => d.id === dimId);
                const dimName = dimDef?.name || dimId;
                const dimColor = dimDef?.color || 'lavender';

                return (
                  <div
                    key={dimId}
                    className="rounded-xl border border-ink-200/80 bg-white p-4 shadow-soft-sm"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <PastelBadge color={dimColor} size="sm">
                          {dimName}
                        </PastelBadge>
                        <span className="text-xs font-mono text-ink-500">({ans.type})</span>
                      </div>

                      {'confidence' in ans && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-ink-500 font-medium">Certainty:</span>
                          <ConfidenceRing confidence={ans.confidence} size={24} />
                        </div>
                      )}
                    </div>

                    {dimDef?.instructions && (
                      <p className="text-xs text-ink-600 mb-3 italic">
                        "{dimDef.instructions}"
                      </p>
                    )}

                    {/* CHOICE ANSWER */}
                    {ans.type === 'choice' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-ink-700">Winning Choice:</span>
                          <PastelBadge color={dimColor} size="md">
                            {(ans as ChoiceAnswer).choice}
                          </PastelBadge>
                        </div>

                        {/* Probability Distribution */}
                        <div className="space-y-1.5 pt-1">
                          <div className="text-[11px] font-medium text-ink-500">
                            Full Calibrated Distribution:
                          </div>
                          {Object.entries((ans as ChoiceAnswer).probabilities || {}).map(
                            ([opt, prob]) => {
                              const isWinner = opt === (ans as ChoiceAnswer).choice;
                              const pct = Math.round(prob * 100);
                              return (
                                <div key={opt} className="flex items-center gap-2 text-xs">
                                  <span
                                    className={`w-28 truncate font-mono text-[11px] ${
                                      isWinner ? 'font-semibold text-ink-900' : 'text-ink-600'
                                    }`}
                                  >
                                    {opt}
                                  </span>
                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        isWinner ? 'bg-[#7C66DC]' : 'bg-ink-300'
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="w-10 text-right font-mono text-[11px] text-ink-600">
                                    {pct}%
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                    {/* NOUL ANSWER */}
                    {ans.type === 'noul' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-ink-700">
                            Probability (Yes / True):
                          </span>
                          <span className="font-mono text-sm font-semibold text-ink-900">
                            {Math.round((ans as NoulAnswer).noul * 100)}%
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
                          <div
                            className={`h-full rounded-full transition-all ${
                              (ans as NoulAnswer).noul > 0.5 ? 'bg-[#7C66DC]' : 'bg-[#10B981]'
                            }`}
                            style={{ width: `${Math.round((ans as NoulAnswer).noul * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-ink-500">
                          <span>0% (False / Absent)</span>
                          <span>100% (True / Holds)</span>
                        </div>
                      </div>
                    )}

                    {/* SCORE ANSWER */}
                    {ans.type === 'score' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-ink-700">Weighted Score:</span>
                          <span className="font-mono text-sm font-semibold text-[#4D3DB5]">
                            {(ans as ScoreAnswer).score.toFixed(2)}
                          </span>
                        </div>

                        {/* Level probabilities */}
                        <div className="space-y-1.5 pt-1">
                          {Object.entries((ans as ScoreAnswer).probabilities || {}).map(
                            ([lvl, prob]) => {
                              const desc = (ans as ScoreAnswer).legend?.[lvl] || `Level ${lvl}`;
                              const pct = Math.round(prob * 100);
                              return (
                                <div key={lvl} className="flex items-center gap-2 text-xs">
                                  <span className="w-32 truncate text-[11px] text-ink-600" title={desc}>
                                    {lvl}: {desc}
                                  </span>
                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                                    <div
                                      className="h-full rounded-full bg-[#10B981]"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="w-10 text-right font-mono text-[11px] text-ink-600">
                                    {pct}%
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Raw JSON Response */}
        {activeTab === 'json' && (
          <div className="relative rounded-xl border border-ink-200 bg-ink-900 p-4 text-ink-100 font-mono text-xs max-h-96 overflow-y-auto">
            <button
              onClick={handleCopyJson}
              className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-ink-800 hover:bg-ink-700 px-2.5 py-1 text-[11px] text-ink-300 transition"
            >
              {copied ? <Check size={12} className="text-[#10B981]" /> : <Copy size={12} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <pre className="whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(evaluation || row, null, 2)}
            </pre>
          </div>
        )}

        {/* Footer Metrics */}
        {evaluation && (
          <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-[11px] text-ink-500">
            <div className="flex items-center gap-3">
              {evaluation.latencyMs && (
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{evaluation.latencyMs} ms</span>
                </div>
              )}
              {evaluation.usage && (
                <div className="flex items-center gap-1">
                  <Zap size={12} />
                  <span>
                    In: {evaluation.usage.input_tokens} | Out: {evaluation.usage.output_tokens} tokens
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
