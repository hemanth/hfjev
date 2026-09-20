import React from 'react';
import { BarChart3, PieChart, ShieldAlert, Zap, Clock, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { DatasetRow, Dimension, ChoiceAnswer, NoulAnswer, ScoreAnswer } from '../types';
import { PastelBadge } from './PastelBadge';
import { ConfidenceRing } from './ConfidenceRing';

interface AnalyticsPanelProps {
  rows: DatasetRow[];
  dimensions: Dimension[];
  onInspectRow: (row: DatasetRow) => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  rows,
  dimensions,
  onInspectRow,
}) => {
  const evaluatedRows = rows.filter((r) => r.evaluation && Object.keys(r.evaluation.answers || {}).length > 0);
  const totalEvaluated = evaluatedRows.length;

  if (totalEvaluated === 0) {
    return (
      <div className="rounded-2xl border border-ink-200/80 bg-white p-12 text-center shadow-soft-sm">
        <BarChart3 size={32} className="mx-auto mb-3 text-ink-300" />
        <h3 className="text-sm font-semibold text-ink-800">No Analytics Available Yet</h3>
        <p className="text-xs text-ink-500 mt-1 max-w-sm mx-auto">
          Start classification to see aggregated dimension distributions, confidence curves, and edge cases.
        </p>
      </div>
    );
  }

  // Calculate overall confidence distribution
  const allConfidences: number[] = [];
  evaluatedRows.forEach((r) => {
    Object.values(r.evaluation?.answers || {}).forEach((ans: any) => {
      if (typeof ans.confidence === 'number') {
        allConfidences.push(ans.confidence);
      }
    });
  });

  const avgConfidence = allConfidences.length > 0
    ? (allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length)
    : 0;

  // Identify uncertain / edge-case rows (lowest confidence)
  const lowConfidenceRows = evaluatedRows
    .filter((r) => {
      const confs = Object.values(r.evaluation?.answers || {})
        .map((a: any) => a.confidence)
        .filter((c: any) => typeof c === 'number');
      if (confs.length === 0) return false;
      return Math.min(...confs) < 0.75;
    })
    .slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Top Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-ink-200/80 bg-white p-4 shadow-soft-sm">
          <div className="flex items-center justify-between text-ink-500 text-xs mb-1">
            <span>Evaluated Rows</span>
            <CheckCircle size={15} className="text-[#10B981]" />
          </div>
          <div className="text-xl font-bold text-ink-900">
            {totalEvaluated} / {rows.length}
          </div>
          <div className="text-[11px] text-ink-500 mt-1">
            {Math.round((totalEvaluated / rows.length) * 100)}% coverage
          </div>
        </div>

        <div className="rounded-2xl border border-ink-200/80 bg-white p-4 shadow-soft-sm">
          <div className="flex items-center justify-between text-ink-500 text-xs mb-1">
            <span>Avg Model Certainty</span>
            <TrendingUp size={15} className="text-[#7C66DC]" />
          </div>
          <div className="text-xl font-bold text-ink-900">
            {Math.round(avgConfidence * 100)}%
          </div>
          <div className="text-[11px] text-ink-500 mt-1">
            Calibrated Jev confidence
          </div>
        </div>

        <div className="rounded-2xl border border-ink-200/80 bg-white p-4 shadow-soft-sm">
          <div className="flex items-center justify-between text-ink-500 text-xs mb-1">
            <span>Active Dimensions</span>
            <PieChart size={15} className="text-[#3B82F6]" />
          </div>
          <div className="text-xl font-bold text-ink-900">
            {dimensions.filter((d) => d.enabled).length}
          </div>
          <div className="text-[11px] text-ink-500 mt-1">
            Evaluated simultaneously
          </div>
        </div>

        <div className="rounded-2xl border border-ink-200/80 bg-white p-4 shadow-soft-sm">
          <div className="flex items-center justify-between text-ink-500 text-xs mb-1">
            <span>Edge Cases Flagged</span>
            <AlertTriangle size={15} className="text-[#F97316]" />
          </div>
          <div className="text-xl font-bold text-ink-900">
            {lowConfidenceRows.length}
          </div>
          <div className="text-[11px] text-ink-500 mt-1">
            Certainty &lt; 75%
          </div>
        </div>
      </div>

      {/* Per Dimension Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {dimensions.filter((d) => d.enabled).map((dim) => {
          // Aggregate answers for this dimension
          if (dim.type === 'choice') {
            const counts: Record<string, number> = {};
            let dimTotal = 0;

            evaluatedRows.forEach((r) => {
              const ans = r.evaluation?.answers?.[dim.id] as ChoiceAnswer | undefined;
              if (ans && ans.choice) {
                counts[ans.choice] = (counts[ans.choice] || 0) + 1;
                dimTotal++;
              }
            });

            return (
              <div
                key={dim.id}
                className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PastelBadge color={dim.color} size="sm">
                      {dim.name}
                    </PastelBadge>
                    <span className="text-xs text-ink-500 font-mono">(Choice distribution)</span>
                  </div>
                  <span className="text-xs text-ink-500">{dimTotal} judgments</span>
                </div>

                <div className="space-y-2.5">
                  {Object.entries(counts).map(([choiceKey, count]) => {
                    const pct = dimTotal > 0 ? Math.round((count / dimTotal) * 100) : 0;
                    return (
                      <div key={choiceKey} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-ink-800">{choiceKey}</span>
                          <span className="font-mono text-ink-600">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
                          <div
                            className="h-full rounded-full bg-[#7C66DC] transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          if (dim.type === 'noul') {
            let sumProb = 0;
            let trueCount = 0;
            let noulTotal = 0;

            evaluatedRows.forEach((r) => {
              const ans = r.evaluation?.answers?.[dim.id] as NoulAnswer | undefined;
              if (ans && typeof ans.noul === 'number') {
                sumProb += ans.noul;
                if (ans.noul > 0.5) trueCount++;
                noulTotal++;
              }
            });

            const avgProb = noulTotal > 0 ? (sumProb / noulTotal) : 0;

            return (
              <div
                key={dim.id}
                className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PastelBadge color={dim.color} size="sm">
                      {dim.name}
                    </PastelBadge>
                    <span className="text-xs text-ink-500 font-mono">(Noul Probability)</span>
                  </div>
                  <span className="text-xs text-ink-500">{noulTotal} judgments</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-ink-700">Average P(True):</span>
                    <span className="font-mono text-base font-bold text-[#4D3DB5]">
                      {Math.round(avgProb * 100)}%
                    </span>
                  </div>

                  <div className="h-3 w-full overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-[#7C66DC] transition-all duration-500"
                      style={{ width: `${Math.round(avgProb * 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-ink-600">
                    <span>
                      High Likelihood (&gt;50%): <strong>{trueCount}</strong>
                    </span>
                    <span>
                      Low Likelihood (≤50%): <strong>{noulTotal - trueCount}</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          if (dim.type === 'score') {
            let sumScore = 0;
            let scoreTotal = 0;

            evaluatedRows.forEach((r) => {
              const ans = r.evaluation?.answers?.[dim.id] as ScoreAnswer | undefined;
              if (ans && typeof ans.score === 'number') {
                sumScore += ans.score;
                scoreTotal++;
              }
            });

            const avgScore = scoreTotal > 0 ? (sumScore / scoreTotal) : 0;

            return (
              <div
                key={dim.id}
                className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PastelBadge color={dim.color} size="sm">
                      {dim.name}
                    </PastelBadge>
                    <span className="text-xs text-ink-500 font-mono">(Score Average)</span>
                  </div>
                  <span className="text-xs text-ink-500">{scoreTotal} judgments</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-ink-700">Mean Score:</span>
                    <span className="font-mono text-base font-bold text-[#10B981]">
                      {avgScore.toFixed(2)}
                    </span>
                  </div>

                  <div className="h-3 w-full overflow-hidden rounded-full bg-ink-100">
                    <div
                      className="h-full rounded-full bg-[#10B981] transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, (avgScore / Math.max(1, (dim.criteria?.length || 3) - 1)) * 100))}%`
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-ink-500">
                    <span>Min: 0</span>
                    <span>Max: {(dim.criteria?.length || 3) - 1}</span>
                  </div>
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Edge Cases Table: Low-Confidence items for human-in-the-loop review */}
      {lowConfidenceRows.length > 0 && (
        <div className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-[#F97316]" />
              <h3 className="text-sm font-semibold text-ink-900">
                Borderline Cases Requiring Review
              </h3>
            </div>
            <span className="text-xs text-ink-500">
              TypeSafe confidence alerts where probability was divided
            </span>
          </div>

          <div className="divide-y divide-ink-100">
            {lowConfidenceRows.map((r) => {
              const text = Object.values(r.row)[0] || '';
              return (
                <div key={r.row_idx} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-mono font-medium text-ink-500 mr-2">
                      #{r.row_idx + 1}
                    </span>
                    <span className="text-xs text-ink-700 truncate">
                      {String(text).slice(0, 100)}...
                    </span>
                  </div>
                  <button
                    onClick={() => onInspectRow(r)}
                    className="shrink-0 text-xs font-medium text-[#4D3DB5] hover:underline"
                  >
                    Inspect Probability Spread →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
