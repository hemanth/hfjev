import React, { useState } from 'react';
import { X, Plus, Trash2, Sliders, Check } from 'lucide-react';
import { Dimension, QuestionType, PastelColor } from '../types';
import { PastelBadge } from './PastelBadge';

interface DimensionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dimension: Dimension) => void;
  initialDimension?: Dimension | null;
}

const pastelColors: PastelColor[] = ['lavender', 'mint', 'peach', 'sky', 'rose', 'butter', 'lilac'];

export const DimensionEditorModal: React.FC<DimensionEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDimension,
}) => {
  if (!isOpen) return null;

  const [id, setId] = useState(initialDimension?.id || `dim_${Date.now()}`);
  const [name, setName] = useState(initialDimension?.name || '');
  const [type, setType] = useState<QuestionType>(initialDimension?.type || 'choice');
  const [instructions, setInstructions] = useState(initialDimension?.instructions || '');
  const [color, setColor] = useState<PastelColor>(initialDimension?.color || 'lavender');
  const [description, setDescription] = useState(initialDimension?.description || '');

  // Choice options: map of { key: description }
  const [choiceOptions, setChoiceOptions] = useState<Array<{ key: string; rubric: string }>>(() => {
    if (initialDimension?.type === 'choice' && initialDimension.criteria) {
      return Object.entries(initialDimension.criteria).map(([k, v]) => ({
        key: k,
        rubric: typeof v === 'string' ? v : ''
      }));
    }
    return [
      { key: 'positive', rubric: 'Praise or favorable outlook' },
      { key: 'neutral', rubric: 'Balanced or indifferent' },
      { key: 'negative', rubric: 'Critical or unfavorable' }
    ];
  });

  // Noul criteria: { true: string, false: string }
  const [noulTrueCriteria, setNoulTrueCriteria] = useState(
    initialDimension?.type === 'noul' ? initialDimension.criteria?.true || '' : 'Condition holds true'
  );
  const [noulFalseCriteria, setNoulFalseCriteria] = useState(
    initialDimension?.type === 'noul' ? initialDimension.criteria?.false || '' : 'Condition is false'
  );

  // Score levels: ordered array of descriptions
  const [scoreLevels, setScoreLevels] = useState<string[]>(() => {
    if (initialDimension?.type === 'score' && Array.isArray(initialDimension.criteria)) {
      return [...initialDimension.criteria];
    }
    return ['Low / Minimal', 'Moderate', 'High / Exceptional'];
  });

  const handleAddChoiceOption = () => {
    setChoiceOptions([...choiceOptions, { key: `option_${choiceOptions.length + 1}`, rubric: '' }]);
  };

  const handleRemoveChoiceOption = (idx: number) => {
    if (choiceOptions.length > 2) {
      setChoiceOptions(choiceOptions.filter((_, i) => i !== idx));
    }
  };

  const handleAddScoreLevel = () => {
    if (scoreLevels.length < 10) {
      setScoreLevels([...scoreLevels, `Level ${scoreLevels.length + 1}`]);
    }
  };

  const handleRemoveScoreLevel = (idx: number) => {
    if (scoreLevels.length > 2) {
      setScoreLevels(scoreLevels.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !instructions.trim()) return;

    let criteria: any;
    if (type === 'choice') {
      criteria = {};
      choiceOptions.forEach(opt => {
        if (opt.key.trim()) {
          criteria[opt.key.trim().toLowerCase().replace(/\s+/g, '_')] = opt.rubric.trim() || null;
        }
      });
    } else if (type === 'noul') {
      criteria = {
        true: noulTrueCriteria.trim() || undefined,
        false: noulFalseCriteria.trim() || undefined
      };
    } else if (type === 'score') {
      criteria = scoreLevels.map(l => l.trim()).filter(Boolean);
    }

    const newDimension: Dimension = {
      id: id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      name: name.trim(),
      type,
      instructions: instructions.trim(),
      criteria,
      color,
      enabled: initialDimension ? initialDimension.enabled : true,
      description: description.trim()
    };

    onSave(newDimension);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-soft-lg border border-ink-100 my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pastel-lavender text-pastel-lavender-text">
            <Sliders size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink-900">
              {initialDimension ? 'Edit Dimension' : 'Create Custom Dimension'}
            </h3>
            <p className="text-xs text-ink-500">
              Configure question primitive and rubric criteria
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dimension Name & ID */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!initialDimension) {
                    setId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
                  }
                }}
                placeholder="e.g. Sentiment, Helpfulness"
                required
                className="w-full rounded-xl border border-ink-200 px-3 py-2 text-xs focus:border-[#7C66DC] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Key / ID</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. is_toxic, sentiment"
                required
                className="w-full rounded-xl border border-ink-200 px-3 py-2 text-xs font-mono focus:border-[#7C66DC] focus:outline-none"
              />
            </div>
          </div>

          {/* Question Primitive Type */}
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1.5">Question Primitive</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('choice')}
                className={`rounded-xl border p-2 text-left transition ${
                  type === 'choice'
                    ? 'border-[#7C66DC] bg-pastel-lavender/50 text-[#4D3DB5]'
                    : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
                }`}
              >
                <div className="text-xs font-semibold">Choice</div>
                <div className="text-[10px] text-ink-500 mt-0.5">Picks 1 of set + probs</div>
              </button>

              <button
                type="button"
                onClick={() => setType('noul')}
                className={`rounded-xl border p-2 text-left transition ${
                  type === 'noul'
                    ? 'border-[#7C66DC] bg-pastel-lavender/50 text-[#4D3DB5]'
                    : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
                }`}
              >
                <div className="text-xs font-semibold">Noul</div>
                <div className="text-[10px] text-ink-500 mt-0.5">Yes/No probability [0, 1]</div>
              </button>

              <button
                type="button"
                onClick={() => setType('score')}
                className={`rounded-xl border p-2 text-left transition ${
                  type === 'score'
                    ? 'border-[#7C66DC] bg-pastel-lavender/50 text-[#4D3DB5]'
                    : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
                }`}
              >
                <div className="text-xs font-semibold">Score</div>
                <div className="text-[10px] text-ink-500 mt-0.5">Weighted score on rubric</div>
              </button>
            </div>
          </div>

          {/* Question Instructions */}
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">
              Question Instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. What is the emotional tone of this review?"
              rows={2}
              required
              className="w-full rounded-xl border border-ink-200 px-3 py-2 text-xs focus:border-[#7C66DC] focus:outline-none"
            />
          </div>

          {/* Criteria details per type */}
          {type === 'choice' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-ink-700">Options & Rubric</label>
                <button
                  type="button"
                  onClick={handleAddChoiceOption}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4D3DB5] hover:underline"
                >
                  <Plus size={12} /> Add Option
                </button>
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {choiceOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt.key}
                      onChange={(e) => {
                        const copy = [...choiceOptions];
                        copy[idx].key = e.target.value;
                        setChoiceOptions(copy);
                      }}
                      placeholder="option_key"
                      className="w-32 rounded-lg border border-ink-200 px-2.5 py-1 text-xs font-mono focus:border-[#7C66DC] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={opt.rubric}
                      onChange={(e) => {
                        const copy = [...choiceOptions];
                        copy[idx].rubric = e.target.value;
                        setChoiceOptions(copy);
                      }}
                      placeholder="Rubric description (optional)"
                      className="flex-1 rounded-lg border border-ink-200 px-2.5 py-1 text-xs focus:border-[#7C66DC] focus:outline-none"
                    />
                    {choiceOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveChoiceOption(idx)}
                        className="text-ink-400 hover:text-pastel-rose-text p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {type === 'noul' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  True Criterion (Yes, near 1.0)
                </label>
                <input
                  type="text"
                  value={noulTrueCriteria}
                  onChange={(e) => setNoulTrueCriteria(e.target.value)}
                  placeholder="e.g. Explicitly time-sensitive"
                  className="w-full rounded-lg border border-ink-200 px-2.5 py-1 text-xs focus:border-[#7C66DC] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  False Criterion (No, near 0.0)
                </label>
                <input
                  type="text"
                  value={noulFalseCriteria}
                  onChange={(e) => setNoulFalseCriteria(e.target.value)}
                  placeholder="e.g. No urgency expressed"
                  className="w-full rounded-lg border border-ink-200 px-2.5 py-1 text-xs focus:border-[#7C66DC] focus:outline-none"
                />
              </div>
            </div>
          )}

          {type === 'score' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-ink-700">Ordered Levels (2 to 10)</label>
                {scoreLevels.length < 10 && (
                  <button
                    type="button"
                    onClick={handleAddScoreLevel}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4D3DB5] hover:underline"
                  >
                    <Plus size={12} /> Add Level
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {scoreLevels.map((lvl, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-8 text-center text-xs font-mono font-semibold text-ink-500">
                      #{idx}
                    </span>
                    <input
                      type="text"
                      value={lvl}
                      onChange={(e) => {
                        const copy = [...scoreLevels];
                        copy[idx] = e.target.value;
                        setScoreLevels(copy);
                      }}
                      placeholder={`Level ${idx} description`}
                      className="flex-1 rounded-lg border border-ink-200 px-2.5 py-1 text-xs focus:border-[#7C66DC] focus:outline-none"
                    />
                    {scoreLevels.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveScoreLevel(idx)}
                        className="text-ink-400 hover:text-pastel-rose-text p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Color theme selection */}
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1.5">Pastel Badge Color</label>
            <div className="flex flex-wrap gap-2">
              {pastelColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`rounded-full p-0.5 border ${
                    color === c ? 'ring-2 ring-ink-900 border-transparent' : 'border-transparent'
                  }`}
                >
                  <PastelBadge color={c} size="sm">
                    {c}
                  </PastelBadge>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-ink-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#4D3DB5] hover:bg-[#3D2FA0] px-4 py-1.5 text-xs font-medium text-white transition shadow-soft-sm"
            >
              Save Dimension
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
