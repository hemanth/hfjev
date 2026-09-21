import React, { useState, useEffect } from 'react';
import { Key, Check, AlertCircle, ExternalLink, X, ShieldCheck, Eye, EyeOff, Cpu } from 'lucide-react';
import { PastelBadge } from './PastelBadge';
import { evaluateRow, type ExecutionEngine } from '../services/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  hfToken: string;
  onSaveHfToken: (token: string) => void;
  isSimulated: boolean;
  onToggleSimulated: (simulate: boolean) => void;
  engineMode?: ExecutionEngine;
  onChangeEngineMode?: (mode: ExecutionEngine) => void;
  webmlModel?: string;
  onChangeWebmlModel?: (model: string) => void;
  initialTab?: 'typesafe' | 'huggingface';
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  hfToken,
  onSaveHfToken,
  isSimulated,
  onToggleSimulated,
  engineMode = 'simulated',
  onChangeEngineMode,
  webmlModel = 'qwen3-0.6b',
  onChangeWebmlModel,
  initialTab = 'typesafe',
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [inputHfToken, setInputHfToken] = useState(hfToken);
  const [activeTab, setActiveTab] = useState<'typesafe' | 'huggingface'>(initialTab);
  const [showKey, setShowKey] = useState(false);
  const [showHfToken, setShowHfToken] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputKey(apiKey);
      setInputHfToken(hfToken);
      setActiveTab(initialTab);
      setTestResult(null);
    }
  }, [isOpen, apiKey, hfToken, initialTab]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    onSaveHfToken(inputHfToken.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const data = await evaluateRow({
        state: 'Test health check ping',
        questions: {
          ping: {
            type: 'choice',
            instructions: 'Is this a test?',
            criteria: { yes: null, no: null }
          }
        },
        apiKey: inputKey.trim(),
        simulate: false
      });

      if (data.answers?.ping) {
        setTestResult({ ok: true, message: `Connected! Model: ${data.model} (${data.latencyMs}ms)` });
      } else {
        setTestResult({ ok: false, message: 'No response from model' });
      }
    } catch (err: any) {
      setTestResult({ ok: false, message: err.message || 'Connection failed' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-soft-lg border border-ink-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pastel-lavender text-pastel-lavender-text shadow-soft-sm">
            <Key size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink-900">API Keys &amp; Credentials</h3>
            <p className="text-xs text-ink-500">Stored locally in your browser (localStorage). Never sent to third parties.</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-ink-100 mb-4 text-xs font-mono">
          <button
            onClick={() => {
              setActiveTab('typesafe');
              setTestResult(null);
            }}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'typesafe'
                ? 'border-[#7C66DC] text-[#4D3DB5] font-semibold'
                : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            <span>Jev API Key</span>
            <span className={`w-2 h-2 rounded-full ${inputKey ? 'bg-emerald-500' : 'bg-ink-300'}`}></span>
          </button>
          <button
            onClick={() => {
              setActiveTab('huggingface');
              setTestResult(null);
            }}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'huggingface'
                ? 'border-peach-600 text-peach-800 font-semibold'
                : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            <span>Hugging Face Token</span>
            <span className={`w-2 h-2 rounded-full ${inputHfToken ? 'bg-emerald-500' : 'bg-ink-300'}`}></span>
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === 'typesafe' ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-ink-800">
                    System One API Key
                  </label>
                  <a
                    href="https://typesafe.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4D3DB5] hover:underline"
                  >
                    <span>Get Key</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="ts_live_..."
                    className="w-full rounded-xl border border-ink-200 pl-3 pr-10 py-2.5 text-xs font-mono focus:border-[#7C66DC] focus:ring-2 focus:ring-[#EEF0FD] focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                  >
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-ink-500 leading-relaxed font-sans">
                  Direct requests are sent with Authorization Bearer header directly to <code className="bg-ink-100 px-1 py-0.5 rounded text-[10px] font-mono">api.typesafe.ai/v1/systemone</code>.
                </p>
              </div>

              {/* Execution Engine Selector */}
              <div className="rounded-xl bg-pastel-lavender/40 border border-pastel-lavender-border p-4 space-y-3">
                <div>
                  <div className="text-xs font-bold text-ink-900">Execution Engine</div>
                  <div className="text-[11px] text-ink-600 mt-0.5">
                    Select how dataset samples will be evaluated and classified.
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-ink-800 cursor-pointer p-2 rounded-lg bg-white border border-ink-100 hover:border-pastel-lavender-border transition">
                    <input
                      type="radio"
                      name="engineMode"
                      value="simulated"
                      checked={engineMode === 'simulated'}
                      onChange={() => {
                        onChangeEngineMode?.('simulated');
                        onToggleSimulated(true);
                      }}
                      className="text-[#7C66DC] focus:ring-[#7C66DC]"
                    />
                    <div>
                      <div className="font-semibold">Simulated (Default / Offline)</div>
                      <div className="text-[10px] text-ink-500">Deterministic calibrated semantic heuristics running 100% offline.</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-ink-800 cursor-pointer p-2 rounded-lg bg-white border border-ink-100 hover:border-pastel-lavender-border transition">
                    <input
                      type="radio"
                      name="engineMode"
                      value="webml-kit"
                      checked={engineMode === 'webml-kit'}
                      onChange={() => {
                        onChangeEngineMode?.('webml-kit');
                        onToggleSimulated(false);
                      }}
                      className="text-[#7C66DC] focus:ring-[#7C66DC]"
                    />
                    <div className="flex-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <Cpu size={13} className="text-[#4D3DB5]" />
                        <span>webml-kit (In-Browser WebGPU / OpenJev)</span>
                      </div>
                      <div className="text-[10px] text-ink-500">Executes real OpenJev models directly in browser via WebGPU / WASM.</div>
                    </div>
                  </label>

                  {engineMode === 'webml-kit' && (
                    <div className="pl-6 pt-1 flex items-center gap-2">
                      <span className="text-[11px] text-ink-600 font-mono">Model:</span>
                      <select
                        value={webmlModel}
                        onChange={(e) => onChangeWebmlModel?.(e.target.value)}
                        className="text-xs font-mono px-2 py-1 rounded-md border border-pastel-lavender-border bg-white text-ink-800 focus:outline-none focus:ring-1 focus:ring-[#7C66DC]"
                      >
                        <option value="qwen3-0.6b">qwen3-0.6b (Fast / 480MB)</option>
                        <option value="minicpm5-2b">minicpm5-2b (Desktop / 1.2GB)</option>
                      </select>
                    </div>
                  )}

                  <label className="flex items-center gap-2.5 text-xs text-ink-800 cursor-pointer p-2 rounded-lg bg-white border border-ink-100 hover:border-pastel-lavender-border transition">
                    <input
                      type="radio"
                      name="engineMode"
                      value="cloud-api"
                      checked={engineMode === 'cloud-api'}
                      onChange={() => {
                        onChangeEngineMode?.('cloud-api');
                        onToggleSimulated(false);
                      }}
                      className="text-[#7C66DC] focus:ring-[#7C66DC]"
                    />
                    <div>
                      <div className="font-semibold">TypeSafe Cloud API</div>
                      <div className="text-[10px] text-ink-500">Connects to remote high-capacity TypeSafe Jev System One endpoints.</div>
                    </div>
                  </label>
                </div>
              </div>

              {testResult && (
                <div
                  className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
                    testResult.ok
                      ? 'bg-pastel-mint text-pastel-mint-text border border-pastel-mint-border'
                      : 'bg-pastel-rose text-pastel-rose-text border border-pastel-rose-border'
                  }`}
                >
                  {testResult.ok ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-ink-800">
                    Hugging Face User Access Token (Read)
                  </label>
                  <a
                    href="https://huggingface.co/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-peach-700 hover:underline"
                  >
                    <span>Generate Token</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showHfToken ? 'text' : 'password'}
                    value={inputHfToken}
                    onChange={(e) => setInputHfToken(e.target.value)}
                    placeholder="hf_..."
                    className="w-full rounded-xl border border-ink-200 pl-3 pr-10 py-2.5 text-xs font-mono focus:border-peach-600 focus:ring-2 focus:ring-peach-100 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowHfToken(!showHfToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                  >
                    {showHfToken ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-ink-500 leading-relaxed font-sans">
                  Passed to <code className="bg-ink-100 px-1 py-0.5 rounded text-[10px] font-mono">datasets-server.huggingface.co</code> for authenticated requests.
                </p>
              </div>

              <div className="rounded-xl bg-peach-50 border border-peach-200 p-3.5 text-xs text-peach-900 leading-relaxed">
                <div className="font-semibold mb-1 flex items-center gap-1.5 text-peach-800">
                  <ShieldCheck size={15} className="text-peach-700" />
                  <span>When is a Hugging Face Token required?</span>
                </div>
                <p className="text-[11px] text-ink-700 leading-relaxed">
                  A token is required when importing <strong>gated datasets</strong> (such as LLaMA, Gemma, or Mistral community datasets) or private organization repositories, or to bypass anonymous Hugging Face rate limits.
                </p>
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-ink-100">
            <div className="text-[11px] text-ink-500 font-mono">
              {saved ? 'Changes saved locally.' : 'Saved to browser localStorage.'}
            </div>

            <div className="flex gap-2">
              {activeTab === 'typesafe' && inputKey && (
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testing}
                  className="rounded-xl border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 transition disabled:opacity-50"
                >
                  {testing ? 'Testing...' : 'Test Connection'}
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-xl bg-ink-900 hover:bg-ink-800 px-4 py-1.5 text-xs font-semibold text-white transition shadow-soft-sm"
              >
                {saved ? <Check size={14} className="text-emerald-400" /> : null}
                <span>{saved ? 'Saved!' : 'Save Credentials'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
