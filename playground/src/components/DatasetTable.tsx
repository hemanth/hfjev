import React, { useState, useMemo } from 'react';
import { Search, Eye, Sparkles, Filter, ChevronRight, ChevronDown, CheckSquare, Square, RefreshCw, AlertCircle } from 'lucide-react';
import { DatasetRow, Dimension, ChoiceAnswer, NoulAnswer, ScoreAnswer } from '../types';
import { PastelBadge } from './PastelBadge';
import { ConfidenceRing } from './ConfidenceRing';

interface DatasetTableProps {
  rows: DatasetRow[];
  dimensions: Dimension[];
  selectedColumn: string;
  onInspectRow: (row: DatasetRow) => void;
  onClassifySingleRow: (rowIdx: number) => void;
  evaluatingRowIdx: number | null;
}

export const DatasetTable: React.FC<DatasetTableProps> = ({
  rows,
  dimensions,
  selectedColumn,
  onInspectRow,
  onClassifySingleRow,
  evaluatingRowIdx,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleExpand = (rowIdx: number) => {
    setExpandedRows((prev) => ({ ...prev, [rowIdx]: !prev[rowIdx] }));
  };

  const activeDimensions = useMemo(() => dimensions.filter((d) => d.enabled), [dimensions]);

  // Filter rows based on search query and minimum confidence
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const text = r.row[selectedColumn] !== undefined ? String(r.row[selectedColumn]).toLowerCase() : JSON.stringify(r.row).toLowerCase();
      if (filterQuery && !text.includes(filterQuery.toLowerCase())) {
        return false;
      }

      if (minConfidence > 0) {
        if (!r.evaluation || !r.evaluation.answers) return false;
        // Check if any dimension answer meets or is below the threshold
        const confidences = Object.values(r.evaluation.answers)
          .map((a: any) => a.confidence)
          .filter((c: any) => typeof c === 'number');

        if (confidences.length === 0) return false;
        const avgConf = confidences.reduce((a, b) => a + b, 0) / confidences.length;
        if (avgConf < minConfidence) return false;
      }

      return true;
    });
  }, [rows, selectedColumn, filterQuery, minConfidence]);

  return (
    <div className="rounded-2xl border border-ink-200/80 bg-white shadow-soft-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-ink-100 bg-white">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={`Filter ${rows.length} rows by text...`}
            className="w-full rounded-xl border border-ink-200 pl-8 pr-3 py-1.5 text-xs focus:border-[#7C66DC] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Confidence Filter Slider */}
          <div className="flex items-center gap-2 text-xs text-ink-600">
            <span className="text-[11px] font-medium text-ink-500">Min Certainty:</span>
            <input
              type="range"
              min="0"
              max="0.95"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-20 accent-[#7C66DC] cursor-pointer"
            />
            <span className="font-mono text-[11px] w-8">
              {minConfidence > 0 ? `${Math.round(minConfidence * 100)}%` : 'All'}
            </span>
          </div>

          <span className="text-xs text-ink-500">
            Showing <strong className="text-ink-800">{filteredRows.length}</strong> of {rows.length} rows
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-ink-50/75 text-ink-600 font-medium border-b border-ink-100 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3 w-14 text-center">#</th>
              <th className="py-3 px-4 min-w-[280px]">
                Text Content (<code className="lowercase font-mono">{selectedColumn}</code>)
              </th>
              {activeDimensions.map((dim) => (
                <th key={dim.id} className="py-3 px-3.5 min-w-[150px]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dim.color === 'lavender' ? '#7C66DC' : dim.color === 'mint' ? '#10B981' : dim.color === 'peach' ? '#F97316' : '#3B82F6' }}></span>
                    <span className="capitalize">{dim.name}</span>
                  </div>
                </th>
              ))}
              <th className="py-3 px-3 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={3 + activeDimensions.length} className="py-12 text-center text-ink-500">
                  No rows matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredRows.map((rowItem) => {
                const rowIdx = rowItem.row_idx;
                const isExpanded = !!expandedRows[rowIdx];
                const rawText = rowItem.row[selectedColumn] !== undefined ? String(rowItem.row[selectedColumn]) : JSON.stringify(rowItem.row);
                const isCurrentlyEvaluating = evaluatingRowIdx === rowIdx || rowItem.status === 'evaluating';
                const hasEvaluation = !!rowItem.evaluation && Object.keys(rowItem.evaluation.answers || {}).length > 0;

                return (
                  <tr
                    key={rowIdx}
                    className={`hover:bg-ink-50/60 transition-colors ${
                      isCurrentlyEvaluating ? 'bg-pastel-lavender/25 animate-soft-pulse' : ''
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3 px-3 text-center font-mono text-[11px] text-ink-500">
                      {rowIdx + 1}
                    </td>

                    {/* Text Snippet with Expand */}
                    <td className="py-3 px-4 text-ink-800 max-w-sm">
                      <div className="flex items-start gap-1.5">
                        <button
                          onClick={() => toggleExpand(rowIdx)}
                          className="mt-0.5 text-ink-400 hover:text-ink-700 shrink-0"
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <div
                          onClick={() => toggleExpand(rowIdx)}
                          className={`cursor-pointer leading-relaxed ${
                            isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'
                          }`}
                        >
                          {rawText}
                        </div>
                      </div>
                    </td>

                    {/* Dynamic Dimension Columns */}
                    {activeDimensions.map((dim) => {
                      const ans = rowItem.evaluation?.answers?.[dim.id];
                      return (
                        <td key={dim.id} className="py-3 px-3.5 align-top">
                          {!ans ? (
                            isCurrentlyEvaluating ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#7C66DC] font-medium">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#7C66DC] animate-ping"></span>
                                Judging...
                              </span>
                            ) : (
                              <span className="text-[11px] text-ink-400">—</span>
                            )
                          ) : (
                            <div className="flex flex-col gap-1">
                              {/* CHOICE */}
                              {ans.type === 'choice' && (
                                <div className="flex items-center gap-2">
                                  <PastelBadge
                                    color={dim.color}
                                    size="sm"
                                    className="font-medium truncate max-w-[130px]"
                                    title={`Confidence: ${Math.round((ans as ChoiceAnswer).confidence * 100)}%`}
                                  >
                                    {(ans as ChoiceAnswer).choice}
                                  </PastelBadge>
                                  <ConfidenceRing
                                    confidence={(ans as ChoiceAnswer).confidence}
                                    size={18}
                                    strokeWidth={2.5}
                                    showLabel={false}
                                  />
                                </div>
                              )}

                              {/* NOUL */}
                              {ans.type === 'noul' && (
                                <div className="flex items-center gap-1.5">
                                  <div className="h-2 w-14 overflow-hidden rounded-full bg-ink-100">
                                    <div
                                      className={`h-full rounded-full ${
                                        (ans as NoulAnswer).noul > 0.5 ? 'bg-[#7C66DC]' : 'bg-[#10B981]'
                                      }`}
                                      style={{ width: `${Math.round((ans as NoulAnswer).noul * 100)}%` }}
                                    />
                                  </div>
                                  <span className="font-mono text-[11px] text-ink-600">
                                    {Math.round((ans as NoulAnswer).noul * 100)}%
                                  </span>
                                </div>
                              )}

                              {/* SCORE */}
                              {ans.type === 'score' && (
                                <div className="flex items-center gap-1.5">
                                  <PastelBadge color={dim.color} size="sm">
                                    {(ans as ScoreAnswer).score.toFixed(1)}
                                  </PastelBadge>
                                  <span className="text-[10px] text-ink-500 truncate max-w-[80px]">
                                    {(ans as ScoreAnswer).legend?.[Math.round((ans as ScoreAnswer).score)] || ''}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          data-testid="inspect-btn"
                          onClick={() => onInspectRow(rowItem)}
                          className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2 py-1 text-[11px] font-medium text-ink-700 hover:bg-ink-50 transition shadow-soft-sm"
                          title="Deep Inspection"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>

                        {!hasEvaluation && (
                          <button
                            onClick={() => onClassifySingleRow(rowIdx)}
                            disabled={isCurrentlyEvaluating}
                            className="inline-flex items-center rounded-lg bg-pastel-lavender hover:bg-pastel-lavender-hover text-pastel-lavender-text p-1 transition"
                            title="Classify this row"
                          >
                            <Sparkles size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
