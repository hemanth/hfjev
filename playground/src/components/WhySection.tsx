import React from 'react';
import { Check, X, Zap, ShieldCheck, Cpu, Code2, Layers, Sparkles, Filter, Database } from 'lucide-react';

export const WhySection: React.FC = () => {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-ink-200/60">
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-peach-800 font-semibold mb-2">
          Architecture &amp; Methodology
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink-900">
          The Semantic Decision Gap in Data Pipelines
        </h2>
        <p className="text-ink-700 text-base mt-2 leading-relaxed font-sans">
          Evaluating thousands of raw rows from Hugging Face has traditionally forced teams into an unacceptable tradeoff: crude regexes that miss nuance, or bloated generative LLMs that waste time generating free-form prose.
        </p>
      </div>

      {/* Comparative Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {/* Generative LLM Trap */}
        <div className="rounded-2xl border border-coral-200 bg-coral-50/30 p-6 shadow-soft-sm">
          <div className="flex items-center gap-2 text-coral-800 text-xs font-mono font-semibold uppercase mb-3">
            <X size={15} />
            <span>The Generative LLM Bottleneck</span>
          </div>
          <h3 className="text-base font-semibold text-ink-900 mb-2">
            Free-Form Prompt &amp; Parse Pipelines
          </h3>
          <p className="text-xs text-ink-600 mb-4 leading-relaxed">
            Instructing chat models to generate markdown JSON with explanations for every row.
          </p>

          <ul className="space-y-3 text-xs text-ink-700 font-sans">
            <li className="flex items-start gap-2.5">
              <X size={14} className="text-coral-700 mt-0.5 shrink-0" />
              <span><strong>Slow Latencies (1,500ms – 4,000ms):</strong> Generates hundreds of discarded explanation tokens before reaching the classification.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <X size={14} className="text-coral-700 mt-0.5 shrink-0" />
              <span><strong>Brittle Parsing Failures:</strong> JSON truncation, hallucinated markdown code fences, and unexpected key deviations that crash batch pipelines.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <X size={14} className="text-coral-700 mt-0.5 shrink-0" />
              <span><strong>Uncalibrated Confidence:</strong> LLMs generate arbitrary numbers for confidence that cannot be used to reliably threshold automated decisions.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <X size={14} className="text-coral-700 mt-0.5 shrink-0" />
              <span><strong>Cost Multiplication:</strong> Repetitive system instructions sent per question inflate API token budgets.</span>
            </li>
          </ul>
        </div>

        {/* Solution */}
        <div className="rounded-2xl border border-sage-200 bg-sage-50/30 p-6 shadow-soft-sm">
          <div className="flex items-center gap-2 text-sage-800 text-xs font-mono font-semibold uppercase mb-3">
            <Check size={15} />
            <span>The Speculative Paradigm</span>
          </div>
          <h3 className="text-base font-semibold text-ink-900 mb-2">
            Calibrated Decision Engine
          </h3>
          <p className="text-xs text-ink-600 mb-4 leading-relaxed">
            Typed judgments and calibrated probabilities returned directly to code in a single round-trip.
          </p>

          <ul className="space-y-3 text-xs text-ink-700 font-sans">
            <li className="flex items-start gap-2.5">
              <Check size={14} className="text-sage-700 mt-0.5 shrink-0" />
              <span><strong>Sub-Millisecond Execution:</strong> Fast semantic judgments returning only the typed decision with zero extraneous text tokens.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check size={14} className="text-sage-700 mt-0.5 shrink-0" />
              <span><strong>Typed Decision Primitives:</strong> Direct Choice, Noul, and Score responses guaranteed by schema—no regex or JSON parsing required.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check size={14} className="text-sage-700 mt-0.5 shrink-0" />
              <span><strong>Calibrated Probabilities:</strong> Real mathematical confidence distributions that allow programmatic thresholding and edge-case isolation.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check size={14} className="text-sage-700 mt-0.5 shrink-0" />
              <span><strong>Speculative Fan-out:</strong> Bundle all active questions into a single parallel evaluation over each dataset row.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Primitives Section */}
      <div id="primitives" className="scroll-mt-20 pt-6">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-sage-800 font-semibold mb-2">
            Core Building Blocks
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Three Typed Primitives
          </h2>
          <p className="text-ink-700 text-sm mt-1">
            Choose the primitive that matches what your downstream code or data pipeline needs to consume:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Choice */}
          <div className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-pastel-lavender text-pastel-lavender-text border border-pastel-lavender-border">
                choice(...)
              </span>
              <span className="text-[11px] font-mono text-ink-400">1 of N options</span>
            </div>
            <h4 className="text-sm font-semibold text-ink-900 mb-1">Categorical Selection</h4>
            <p className="text-xs text-ink-600 leading-relaxed mb-3">
              Selects the single most applicable option from a defined rubric. Returns the winning choice, normalized probabilities for each option, and confidence.
            </p>
            <div className="rounded-lg bg-ink-50 p-2.5 font-mono text-[11px] text-ink-700 border border-ink-100">
              <div className="text-ink-400 text-[10px] mb-0.5">// Example output:</div>
              &#123; choice: "positive", probabilities: &#123; pos: 0.88, neg: 0.12 &#125;, confidence: 0.85 &#125;
            </div>
          </div>

          {/* Noul */}
          <div className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-pastel-mint text-pastel-mint-text border border-pastel-mint-border">
                noul(...)
              </span>
              <span className="text-[11px] font-mono text-ink-400">P(Yes) ∈ [0, 1]</span>
            </div>
            <h4 className="text-sm font-semibold text-ink-900 mb-1">Condition Probability</h4>
            <p className="text-xs text-ink-600 leading-relaxed mb-3">
              Evaluates whether a condition holds true. Returns the exact probability that the answer is yes, suitable for moderation gates or urgency flags.
            </p>
            <div className="rounded-lg bg-ink-50 p-2.5 font-mono text-[11px] text-ink-700 border border-ink-100">
              <div className="text-ink-400 text-[10px] mb-0.5">// Example output:</div>
              &#123; noul: 0.94 &#125; <span className="text-ink-400">// 94% probability condition is true</span>
            </div>
          </div>

          {/* Score */}
          <div className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-soft-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-pastel-peach text-pastel-peach-text border border-pastel-peach-border">
                score(...)
              </span>
              <span className="text-[11px] font-mono text-ink-400">Ordered Levels</span>
            </div>
            <h4 className="text-sm font-semibold text-ink-900 mb-1">Continuous Level Rating</h4>
            <p className="text-xs text-ink-600 leading-relaxed mb-3">
              Rates content along 2 to 10 ordered, descriptive levels. Returns a continuous probability-weighted score across the rubric and certainty score.
            </p>
            <div className="rounded-lg bg-ink-50 p-2.5 font-mono text-[11px] text-ink-700 border border-ink-100">
              <div className="text-ink-400 text-[10px] mb-0.5">// Example output:</div>
              &#123; score: 2.14, legend: &#123; "0": "Low", ... &#125;, confidence: 0.91 &#125;
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Blueprint Diagram */}
      <div id="blueprint" className="scroll-mt-20 pt-12">
        <div className="max-w-3xl mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-ink-600 font-semibold mb-2">
            System Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
            Execution &amp; Speculative Fan-Out Blueprint
          </h2>
          <p className="text-ink-700 text-sm mt-1">
            End-to-end pipeline topology: from Hugging Face ingestion to dynamic adaptation, System One speculative fan-out, and typed exports.
          </p>
        </div>

        <div className="rounded-2xl border border-ink-200/80 bg-white p-4 sm:p-6 shadow-soft-sm overflow-x-auto">
          <img
            src="./flow-diagram.svg"
            alt="HFJEV System Architecture Blueprint"
            className="w-full h-auto min-w-[700px] rounded-lg"
          />
        </div>
      </div>
    </section>
  );
};
