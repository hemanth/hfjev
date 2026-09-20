import React, { useState } from 'react';
import { Sliders, Plus, Edit2, Trash2, CheckCircle2, Circle, Sparkles, Wand2, RefreshCw } from 'lucide-react';
import { Dimension, DimensionPack } from '../types';
import { PRESET_DIMENSION_PACKS } from '../data/presets';
import { PastelBadge } from './PastelBadge';
import { DimensionEditorModal } from './DimensionEditorModal';

interface DimensionManagerProps {
  dimensions: Dimension[];
  onToggleDimension: (id: string) => void;
  onUpdateDimension: (dim: Dimension) => void;
  onAddDimension: (dim: Dimension) => void;
  onDeleteDimension: (id: string) => void;
  onApplyPack: (pack: DimensionPack) => void;
  autoAdapt: boolean;
  onToggleAutoAdapt: (val: boolean) => void;
  activePackName?: string;
  onReGenerate: () => void;
}

export const DimensionManager: React.FC<DimensionManagerProps> = ({
  dimensions,
  onToggleDimension,
  onUpdateDimension,
  onAddDimension,
  onDeleteDimension,
  onApplyPack,
  autoAdapt,
  onToggleAutoAdapt,
  activePackName,
  onReGenerate,
}) => {
  const [editingDimension, setEditingDimension] = useState<Dimension | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeCount = dimensions.filter((d) => d.enabled).length;

  return (
    <div className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft-sm">
      <div className="flex flex-col gap-4">
        {/* Header & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pastel-lavender text-pastel-lavender-text">
                <Sliders size={15} />
              </div>
              <h2 className="text-sm font-semibold text-ink-900">
                Classification Dimensions
              </h2>
              <PastelBadge color="lavender" size="sm">
                {activeCount} Active
              </PastelBadge>
              {activePackName && (
                <PastelBadge color="mint" size="sm" icon={<Wand2 size={11} />}>
                  {activePackName}
                </PastelBadge>
              )}
            </div>
            <p className="text-[11px] text-ink-500 mt-0.5">
              Speculative Fan-out: all active questions evaluate simultaneously in a single System One call per row
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Auto-adapt with dataset toggle */}
            <div className="flex items-center gap-2 rounded-xl bg-pastel-lavender/40 border border-pastel-lavender-border px-3 py-1.5">
              <span className="text-xs font-medium text-ink-800 flex items-center gap-1">
                <Sparkles size={12} className="text-[#4D3DB5]" />
                Auto-adapt with dataset
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAdapt}
                  onChange={(e) => onToggleAutoAdapt(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-ink-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#7C66DC]"></div>
              </label>
            </div>

            <button
              onClick={onReGenerate}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 shadow-soft-sm transition"
              title="Re-analyze dataset and adapt dimensions"
            >
              <RefreshCw size={12} />
              <span>Re-adapt</span>
            </button>

            <button
              onClick={() => {
                setEditingDimension(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-800 hover:bg-ink-50 shadow-soft-sm transition"
            >
              <Plus size={13} className="text-[#4D3DB5]" />
              <span>Add Dimension</span>
            </button>
          </div>
        </div>

        {/* Preset Packs Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-medium text-ink-500 whitespace-nowrap">
            Presets:
          </span>
          {PRESET_DIMENSION_PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => onApplyPack(pack)}
              className="group inline-flex items-center gap-1.5 rounded-xl border border-ink-200/80 bg-ink-50/50 hover:bg-white hover:border-[#7C66DC] px-3 py-1 text-xs font-medium text-ink-700 transition shrink-0"
              title={pack.description}
            >
              <span className="h-2 w-2 rounded-full bg-[#7C66DC]"></span>
              <span>{pack.name}</span>
            </button>
          ))}
        </div>

        {/* Dimension Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dimensions.map((dim) => {
            return (
              <div
                key={dim.id}
                className={`relative flex flex-col justify-between rounded-xl border p-3.5 transition-all ${
                  dim.enabled
                    ? 'border-ink-200 bg-white shadow-soft-sm hover:border-ink-300'
                    : 'border-ink-100 bg-ink-50/60 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleDimension(dim.id)}
                        className="text-ink-400 hover:text-[#4D3DB5] transition"
                        title={dim.enabled ? 'Click to disable' : 'Click to enable'}
                      >
                        {dim.enabled ? (
                          <CheckCircle2 size={16} className="text-[#4D3DB5]" />
                        ) : (
                          <Circle size={16} />
                        )}
                      </button>
                      <span className="text-xs font-semibold text-ink-900 truncate">
                        {dim.name}
                      </span>
                    </div>

                    <PastelBadge color={dim.color} size="sm">
                      {dim.type}
                    </PastelBadge>
                  </div>

                  <p className="text-xs text-ink-600 line-clamp-2 leading-relaxed mb-2">
                    {dim.instructions}
                  </p>
                </div>

                {/* Criteria footer preview */}
                <div className="pt-2 border-t border-ink-100 flex items-center justify-between text-[11px] text-ink-500">
                  <div className="truncate pr-2 font-mono text-[10px]">
                    {dim.type === 'choice' && (
                      <span>
                        {Object.keys(dim.criteria || {}).slice(0, 3).join(', ')}
                        {Object.keys(dim.criteria || {}).length > 3 ? '...' : ''}
                      </span>
                    )}
                    {dim.type === 'noul' && <span>P(Yes) ∈ [0, 1]</span>}
                    {dim.type === 'score' && (
                      <span>
                        {Array.isArray(dim.criteria)
                          ? `${dim.criteria.length} levels (0 to ${dim.criteria.length - 1})`
                          : 'Score rubric'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingDimension(dim);
                        setIsModalOpen(true);
                      }}
                      className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition"
                      title="Edit Dimension"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => onDeleteDimension(dim.id)}
                      className="rounded p-1 text-ink-400 hover:bg-pastel-rose hover:text-pastel-rose-text transition"
                      title="Delete Dimension"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DimensionEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(dim) => {
          if (editingDimension) {
            onUpdateDimension(dim);
          } else {
            onAddDimension(dim);
          }
        }}
        initialDimension={editingDimension}
      />
    </div>
  );
};
