import React, { useState } from 'react';
import { ArrowDown, Copy, Check, Sparkles, Database, Zap, ShieldCheck, Layers, Cpu, Code2, Terminal } from 'lucide-react';

interface HeroSectionProps {
  onScrollToStudio: () => void;
  datasetCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToStudio, datasetCount }) => {
  const [copied, setCopied] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'fetch' | 'curl' | 'sdk'>('fetch');

  const fetchCode = `// Zero-dependency native fetch to TypeSafe System One
const res = await fetch("https://api.typesafe.ai/v1/systemone", {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${process.env.TYPESAFE_API_KEY}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "jev-latest",
    state: hfRow.text,
    questions: {
      sentiment: { instructions: "Tone?", criteria: { pos: null, neg: null } },
      is_urgent: { instructions: "Urgent?" },
      quality: { instructions: "Depth?", criteria: ["Low", "High"] }
    }
  })
});
const { answers } = await res.json();`;

  const curlCode = `curl -s -X POST https://api.typesafe.ai/v1/systemone \\
  -H "Authorization: Bearer $TYPESAFE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "jev-latest",
    "state": "The cinematography was breathtaking...",
    "questions": {
      "sentiment": { "instructions": "Tone?", "criteria": { "pos": null, "neg": null } },
      "is_urgent": { "instructions": "Urgent?" },
      "quality": { "instructions": "Depth?", "criteria": ["Low", "High"] }
    }
  }'`;

  const sdkCode = `import { TypeSafeClient, choice, noul, score } from "@typesafe-ai/sdk";

const client = new TypeSafeClient();
const { answers } = await client.systemOne({
  state: hfRow.text,
  questions: {
    sentiment: choice("Tone?", { pos: null, neg: null }),
    is_urgent: noul("Urgent?"),
    quality: score("Depth?", ["Low", "High"])
  }
});`;

  const getActiveCode = () => {
    switch (activeCodeTab) {
      case 'curl': return curlCode;
      case 'sdk': return sdkCode;
      default: return fetchCode;
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
                  {activeCodeTab === 'fetch' ? 'evaluate.ts' : activeCodeTab === 'curl' ? 'request.sh' : 'typesafe.ts'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveCodeTab('fetch')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                    activeCodeTab === 'fetch' ? 'bg-ink-100 text-ink-900 font-semibold' : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  fetch
                </button>
                <button
                  onClick={() => setActiveCodeTab('curl')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                    activeCodeTab === 'curl' ? 'bg-ink-100 text-ink-900 font-semibold' : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setActiveCodeTab('sdk')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                    activeCodeTab === 'sdk' ? 'bg-ink-100 text-ink-900 font-semibold' : 'text-ink-500 hover:text-ink-800'
                  }`}
                >
                  SDK
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
              {activeCodeTab === 'fetch' && (
                <pre className="text-ink-100">
                  <span className="text-ink-400">// Zero-dependency native fetch to TypeSafe System One</span>{'\n'}
                  <span className="text-blue-400">const</span> res = <span className="text-purple-400">await</span> <span className="text-yellow-300">fetch</span>(<span className="text-amber-300">"https://api.typesafe.ai/v1/systemone"</span>, &#123;{'\n'}
                  {'  '}method: <span className="text-amber-300">"POST"</span>,{'\n'}
                  {'  '}headers: &#123;{'\n'}
                  {'    '}<span className="text-amber-300">"Authorization"</span>: <span className="text-amber-300">`Bearer $&#123;process.env.TYPESAFE_API_KEY&#125;`</span>,{'\n'}
                  {'    '}<span className="text-amber-300">"Content-Type"</span>: <span className="text-amber-300">"application/json"</span>{'\n'}
                  {'  '}&#125;,{'\n'}
                  {'  '}body: JSON.<span className="text-yellow-300">stringify</span>(&#123;{'\n'}
                  {'    '}model: <span className="text-amber-300">"jev-latest"</span>,{'\n'}
                  {'    '}state: hfRow.<span className="text-sky-300">text</span>,{'\n'}
                  {'    '}questions: &#123;{'\n'}
                  {'      '}sentiment: &#123; instructions: <span className="text-amber-300">"Tone?"</span>, criteria: &#123; pos: <span className="text-red-400">null</span>, neg: <span className="text-red-400">null</span> &#125; &#125;,{'\n'}
                  {'      '}is_urgent: &#123; instructions: <span className="text-amber-300">"Urgent?"</span> &#125;,{'\n'}
                  {'      '}quality: &#123; instructions: <span className="text-amber-300">"Depth?"</span>, criteria: [<span className="text-amber-300">"Low"</span>, <span className="text-amber-300">"High"</span>] &#125;{'\n'}
                  {'    '}&#125;{'\n'}
                  {'  '}&#125;){'\n'}
                  &#125;);{'\n'}
                  <span className="text-blue-400">const</span> &#123; answers &#125; = <span className="text-purple-400">await</span> res.<span className="text-yellow-300">json</span>();
                </pre>
              )}

              {activeCodeTab === 'curl' && (
                <pre className="text-ink-100">
                  <span className="text-yellow-300">curl</span> -s -X POST https://api.typesafe.ai/v1/systemone \{'\n'}
                  {'  '}-H <span className="text-amber-300">"Authorization: Bearer $TYPESAFE_API_KEY"</span> \{'\n'}
                  {'  '}-H <span className="text-amber-300">"Content-Type: application/json"</span> \{'\n'}
                  {'  '}-d <span className="text-emerald-300">&#39;&#123;</span>{'\n'}
                  {'    '}<span className="text-sky-300">"model"</span>: <span className="text-amber-300">"jev-latest"</span>,{'\n'}
                  {'    '}<span className="text-sky-300">"state"</span>: <span className="text-amber-300">"The cinematography was breathtaking..."</span>,{'\n'}
                  {'    '}<span className="text-sky-300">"questions"</span>: &#123;{'\n'}
                  {'      '}<span className="text-sky-300">"sentiment"</span>: &#123; <span className="text-sky-300">"instructions"</span>: <span className="text-amber-300">"Tone?"</span>, <span className="text-sky-300">"criteria"</span>: &#123; <span className="text-sky-300">"pos"</span>: <span className="text-red-400">null</span> &#125; &#125;,{'\n'}
                  {'      '}<span className="text-sky-300">"is_urgent"</span>: &#123; <span className="text-sky-300">"instructions"</span>: <span className="text-amber-300">"Urgent?"</span> &#125;,{'\n'}
                  {'      '}<span className="text-sky-300">"quality"</span>: &#123; <span className="text-sky-300">"instructions"</span>: <span className="text-amber-300">"Depth?"</span>, <span className="text-sky-300">"criteria"</span>: [<span className="text-amber-300">"Low"</span>, <span className="text-amber-300">"High"</span>] &#125;{'\n'}
                  {'    '}&#125;{'\n'}
                  {'  '}<span className="text-emerald-300">&#125;&#39;</span>
                </pre>
              )}

              {activeCodeTab === 'sdk' && (
                <pre className="text-emerald-400">
                  <span className="text-purple-400">import</span> &#123; TypeSafeClient, choice, noul, score &#125; <span className="text-purple-400">from</span> <span className="text-amber-300">"@typesafe-ai/sdk"</span>;{'\n\n'}
                  <span className="text-ink-400">// Evaluate in single parallel System One call:</span>{'\n'}
                  <span className="text-blue-400">const</span> client = <span className="text-blue-400">new</span> <span className="text-yellow-300">TypeSafeClient</span>();{'\n'}
                  <span className="text-blue-400">const</span> &#123; answers &#125; = <span className="text-purple-400">await</span> client.<span className="text-yellow-300">systemOne</span>(&#123;{'\n'}
                  {'  '}state: hfRow.<span className="text-sky-300">text</span>,{'\n'}
                  {'  '}questions: &#123;{'\n'}
                  {'    '}sentiment: <span className="text-yellow-300">choice</span>(<span className="text-amber-300">"Tone?"</span>, &#123; pos: <span className="text-red-400">null</span>, neg: <span className="text-red-400">null</span> &#125;),{'\n'}
                  {'    '}is_urgent: <span className="text-yellow-300">noul</span>(<span className="text-amber-300">"Urgent?"</span>),{'\n'}
                  {'    '}quality: <span className="text-yellow-300">score</span>(<span className="text-amber-300">"Depth"</span>, [<span className="text-amber-300">"Low"</span>, <span className="text-amber-300">"High"</span>]){'\n'}
                  {'  '}&#125;{'\n'}
                  &#125;);
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
