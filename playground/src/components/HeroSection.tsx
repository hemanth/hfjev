import React, { useState } from 'react';
import { ArrowDown, Copy, Check, Sparkles, Database, Zap, ShieldCheck, Layers, Cpu, Code2, Terminal } from 'lucide-react';

interface HeroSectionProps {
  onScrollToStudio: () => void;
  datasetCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToStudio, datasetCount }) => {
  const [copied, setCopied] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'ts' | 'py' | 'cli'>('ts');

  const tsCode = `import hfjev from 'hfjev';

// Load dataset with auto-adapted rubrics
const dataset = await hfjev('cornell-movie-review-data/rotten_tomatoes');
const results = await dataset.classify({ limit: 10 });

for (const row of results) {
  console.log(row.text);
  console.log(row.answers);
  // { sentiment: { choice: 'positive', confidence: 0.94 },
  //   recommendation: { choice: 'must_watch', confidence: 0.91 }, ... }
}`;

  const pyCode = `import hfjev

# Load dataset with auto-adapted rubrics
dataset = hfjev('cornell-movie-review-data/rotten_tomatoes')
results = dataset.classify(limit=10)

for row in results:
    print(row['text'])
    print(row['answers'])
    # {'sentiment': {'choice': 'positive', 'confidence': 0.94},
    #  'recommendation': {'choice': 'must_watch', 'confidence': 0.91}, ...}`;

  const cliCode = `# Node.js CLI
npx hfjev cornell-movie-review-data/rotten_tomatoes --limit 10

# Python CLI
hfjev cornell-movie-review-data/rotten_tomatoes --limit 10`;

  const getActiveCode = () => {
    switch (activeCodeTab) {
      case 'py': return pyCode;
      case 'cli': return cliCode;
      default: return tsCode;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="hero" className="pt-10 sm:pt-14 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headline & Value Proposition */}
        <div className="lg:col-span-7">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-50 text-peach-800 border border-peach-200 text-xs font-mono font-medium mb-5">
            <span className="w-2 h-2 rounded-full bg-peach-700 animate-pulse"></span>
            <span>Multidimensional Dataset Intelligence · TypeSafe Jev</span>
          </div>

          {/* Editorial Display Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink-900 leading-[1.08]">
            Semantic classification for <span className="font-display italic font-normal text-peach-700">Hugging Face</span>.
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-ink-700 leading-relaxed max-w-2xl font-normal">
            Triage, label, and score real-world datasets across multiple typed dimensions simultaneously. Powered by TypeSafe Jev System One models with calibrated probabilities, speculative fan-out, and zero hallucinated tokens.
          </p>

          {/* Actions */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={onScrollToStudio}
              className="micro-sheen inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-ink-900 text-white font-semibold text-xs shadow-soft-md hover:bg-ink-800 active:scale-[0.98] transition-all"
            >
              <span>Launch Classifier Studio</span>
              <ArrowDown size={14} />
            </button>

            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-ink-800 font-medium text-xs border border-ink-200 hover:bg-ink-50 transition-all shadow-soft-sm"
            >
              <span>How System One Works</span>
            </a>
          </div>

          {/* Feature Badges */}
          <div className="mt-8 flex flex-wrap items-center gap-2 pt-3 border-t border-ink-200/60">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-sage-100 text-sage-800 border border-sage-200">
              <span className="w-1.5 h-1.5 rounded-full bg-sage-700"></span>
              Single-Call Speculative Fan-out
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-peach-100 text-peach-800 border border-peach-200">
              <span className="w-1.5 h-1.5 rounded-full bg-peach-700"></span>
              Calibrated Confidence [0, 1]
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-100 text-amber-800 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-700"></span>
              Choice · Noul · Score Primitives
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-sky-100 text-sky-800 border border-sky-200">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-700"></span>
              Dynamic Dataset Adaptation
            </span>
          </div>
        </div>

        {/* Right Column: Interactive Code & Architecture Preview */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-ink-200/80 bg-white p-4 shadow-soft-md">
            <div className="flex items-center justify-between border-b border-ink-100 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-ink-200"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-ink-200"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-ink-200"></div>
                </div>
                <span className="text-[11px] font-mono text-ink-500 ml-1">
                  {activeCodeTab === 'ts' ? 'evaluate.ts' : activeCodeTab === 'py' ? 'evaluate.py' : 'terminal.sh'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveCodeTab('ts')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                    activeCodeTab === 'ts' ? 'bg-ink-100 text-ink-900 font-semibold' : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  TypeScript
                </button>
                <button
                  onClick={() => setActiveCodeTab('py')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                    activeCodeTab === 'py' ? 'bg-ink-100 text-ink-900 font-semibold' : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  Python
                </button>
                <button
                  onClick={() => setActiveCodeTab('cli')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                    activeCodeTab === 'cli' ? 'bg-ink-100 text-ink-900 font-semibold' : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  CLI
                </button>
                <button
                  onClick={handleCopyCode}
                  className="ml-2 inline-flex items-center gap-1 rounded bg-ink-50 hover:bg-ink-100 px-2 py-0.5 text-[10px] font-mono text-ink-700 border border-ink-200 transition"
                  title="Copy code"
                >
                  {copied ? <Check size={11} className="text-sage-700" /> : <Copy size={11} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-ink-900 p-3.5 font-mono text-[11px] leading-relaxed text-ink-100 overflow-x-auto max-h-64">
              {activeCodeTab === 'ts' && (
                <pre className="text-ink-100">
                  <span className="text-purple-400">import</span> hfjev <span className="text-purple-400">from</span> <span className="text-amber-300">&#39;hfjev&#39;</span>;{'\n\n'}
                  <span className="text-ink-400">// Load dataset &amp; auto-adapt rubrics</span>{'\n'}
                  <span className="text-blue-400">const</span> dataset = <span className="text-purple-400">await</span> <span className="text-yellow-300">hfjev</span>(<span className="text-amber-300">&#39;cornell-movie-review-data/rotten_tomatoes&#39;</span>);{'\n'}
                  <span className="text-blue-400">const</span> results = <span className="text-purple-400">await</span> dataset.<span className="text-yellow-300">classify</span>(&#123; limit: <span className="text-emerald-400">10</span> &#125;);{'\n\n'}
                  <span className="text-purple-400">for</span> (<span className="text-blue-400">const</span> row <span className="text-purple-400">of</span> results) &#123;{'\n'}
                  {'  '}console.<span className="text-yellow-300">log</span>(row.<span className="text-sky-300">text</span>);{'\n'}
                  {'  '}console.<span className="text-yellow-300">log</span>(row.<span className="text-sky-300">answers</span>);{'\n'}
                  {'  '}<span className="text-ink-400">// &#123; sentiment: &#123; choice: &#39;positive&#39;, confidence: 0.94 &#125;, ... &#125;</span>{'\n'}
                  &#125;
                </pre>
              )}

              {activeCodeTab === 'py' && (
                <pre className="text-ink-100">
                  <span className="text-purple-400">import</span> hfjev{'\n\n'}
                  <span className="text-ink-400"># Load dataset &amp; auto-adapt rubrics</span>{'\n'}
                  dataset = hfjev.<span className="text-yellow-300">hfjev</span>(<span className="text-amber-300">&#39;cornell-movie-review-data/rotten_tomatoes&#39;</span>){'\n'}
                  results = dataset.<span className="text-yellow-300">classify</span>(limit=<span className="text-emerald-400">10</span>){'\n\n'}
                  <span className="text-purple-400">for</span> row <span className="text-purple-400">in</span> results:{'\n'}
                  {'    '}<span className="text-yellow-300">print</span>(row[<span className="text-amber-300">&#39;text&#39;</span>]){'\n'}
                  {'    '}<span className="text-yellow-300">print</span>(row[<span className="text-amber-300">&#39;answers&#39;</span>]){'\n'}
                  {'    '}<span className="text-ink-400"># &#123;&#39;sentiment&#39;: &#123;&#39;choice&#39;: &#39;positive&#39;, &#39;confidence&#39;: 0.94&#125;, ...&#125;</span>
                </pre>
              )}

              {activeCodeTab === 'cli' && (
                <pre className="text-ink-100">
                  <span className="text-ink-400"># Node.js CLI (npm install -g hfjev or npx)</span>{'\n'}
                  <span className="text-yellow-300">npx</span> hfjev cornell-movie-review-data/rotten_tomatoes --limit <span className="text-emerald-400">10</span>{'\n\n'}
                  <span className="text-ink-400"># Python CLI (pip install hfjev)</span>{'\n'}
                  <span className="text-yellow-300">hfjev</span> cornell-movie-review-data/rotten_tomatoes --limit <span className="text-emerald-400">10</span>
                </pre>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-ink-500 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>jev-latest</span>
              </span>
              <span>1 Request · All Dimensions Evaluated</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
