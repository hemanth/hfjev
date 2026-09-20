import React, { useState } from 'react';
import { X, Download, Copy, Check, FileJson, FileSpreadsheet } from 'lucide-react';
import { DatasetRow, Dimension } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: DatasetRow[];
  dimensions: Dimension[];
  datasetName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  rows,
  dimensions,
  datasetName,
}) => {
  const [format, setFormat] = useState<'csv' | 'json' | 'jsonl'>('csv');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const evaluatedRows = rows.filter((r) => r.evaluation && Object.keys(r.evaluation.answers || {}).length > 0);

  const generateData = () => {
    if (format === 'json') {
      return JSON.stringify(
        evaluatedRows.map((r) => ({
          ...r.row,
          _typesafe_evaluations: r.evaluation?.answers,
          _typesafe_model: r.evaluation?.model,
          _typesafe_latency_ms: r.evaluation?.latencyMs
        })),
        null,
        2
      );
    }

    if (format === 'jsonl') {
      return evaluatedRows
        .map((r) =>
          JSON.stringify({
            ...r.row,
            _typesafe_evaluations: r.evaluation?.answers,
            _typesafe_model: r.evaluation?.model
          })
        )
        .join('\n');
    }

    // CSV format
    if (evaluatedRows.length === 0) return '';
    const sampleRow = evaluatedRows[0].row;
    const baseCols = Object.keys(sampleRow);
    const evalCols: string[] = [];

    dimensions.forEach((dim) => {
      if (dim.type === 'choice') {
        evalCols.push(`${dim.id}_choice`, `${dim.id}_confidence`);
      } else if (dim.type === 'noul') {
        evalCols.push(`${dim.id}_prob_yes`);
      } else if (dim.type === 'score') {
        evalCols.push(`${dim.id}_score`, `${dim.id}_confidence`);
      }
    });

    const header = [...baseCols, ...evalCols].map((c) => `"${c}"`).join(',');

    const csvLines = evaluatedRows.map((r) => {
      const baseValues = baseCols.map((col) => {
        const val = r.row[col] !== undefined ? String(r.row[col]).replace(/"/g, '""') : '';
        return `"${val}"`;
      });

      const evalValues: string[] = [];
      dimensions.forEach((dim) => {
        const ans = r.evaluation?.answers?.[dim.id];
        if (!ans) {
          if (dim.type === 'choice' || dim.type === 'score') evalValues.push('""', '""');
          else evalValues.push('""');
          return;
        }

        if (ans.type === 'choice') {
          evalValues.push(`"${ans.choice}"`, `"${ans.confidence.toFixed(2)}"`);
        } else if (ans.type === 'noul') {
          evalValues.push(`"${ans.noul.toFixed(2)}"`);
        } else if (ans.type === 'score') {
          evalValues.push(`"${ans.score.toFixed(2)}"`, `"${ans.confidence.toFixed(2)}"`);
        }
      });

      return [...baseValues, ...evalValues].join(',');
    });

    return [header, ...csvLines].join('\n');
  };

  const handleDownload = () => {
    const content = generateData();
    const mime = format === 'csv' ? 'text/csv' : 'application/json';
    const ext = format;
    const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${datasetName.replace(/[^a-zA-Z0-9_-]/g, '_')}_classified.${ext}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateData());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-soft-lg border border-ink-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pastel-mint text-pastel-mint-text">
            <Download size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink-900">Export Classified Dataset</h3>
            <p className="text-xs text-ink-500">
              {evaluatedRows.length} rows with TypeSafe System One judgments
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-2">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`rounded-xl border p-2.5 text-center transition ${
                  format === 'csv'
                    ? 'border-[#7C66DC] bg-pastel-lavender/40 text-[#4D3DB5]'
                    : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
                }`}
              >
                <FileSpreadsheet size={18} className="mx-auto mb-1" />
                <div className="text-xs font-medium">CSV Table</div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`rounded-xl border p-2.5 text-center transition ${
                  format === 'json'
                    ? 'border-[#7C66DC] bg-pastel-lavender/40 text-[#4D3DB5]'
                    : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
                }`}
              >
                <FileJson size={18} className="mx-auto mb-1" />
                <div className="text-xs font-medium">JSON Array</div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('jsonl')}
                className={`rounded-xl border p-2.5 text-center transition ${
                  format === 'jsonl'
                    ? 'border-[#7C66DC] bg-pastel-lavender/40 text-[#4D3DB5]'
                    : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
                }`}
              >
                <FileJson size={18} className="mx-auto mb-1" />
                <div className="text-xs font-medium">HF JSONL</div>
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-ink-50 p-3 text-xs text-ink-600 leading-relaxed">
            {format === 'csv' && (
              <p>Columns will include all source fields plus flattened TypeSafe columns (e.g. choice, score, confidence).</p>
            )}
            {format === 'json' && (
              <p>Full structured records with complete probability distributions, confidence ratings, and model metadata.</p>
            )}
            {format === 'jsonl' && (
              <p>Line-delimited JSON ready for <code>datasets.load_dataset('json', data_files=...)</code>.</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-100">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-xl border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 transition"
            >
              {copied ? <Check size={13} className="text-[#10B981]" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#4D3DB5] hover:bg-[#3D2FA0] px-4 py-1.5 text-xs font-semibold text-white transition shadow-soft-sm"
            >
              <Download size={14} />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
