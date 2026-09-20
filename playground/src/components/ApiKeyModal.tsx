import React, { useState } from 'react';
import { Key, Check, AlertCircle, ExternalLink, X, ShieldCheck } from 'lucide-react';
import { PastelBadge } from './PastelBadge';
import { evaluateRow } from '../services/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  hfToken: string;
  onSaveHfToken: (token: string) => void;
  isSimulated: boolean;
  onToggleSimulated: (simulate: boolean) => void;
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
  initialTab = 'typesafe',
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [inputHfToken, setInputHfToken] = useState(hfToken);
  const [activeTab, setActiveTab] = useState<'typesafe' | 'huggingface'>(initialTab);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

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
        setTestResult({ ok: true, message: `Connected! Model: ${data.model}` });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-soft-lg border border-ink-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pastel-lavender text-pastel-lavender-text">
            <Key size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink-900">API &amp; Access Tokens</h3>
            <p className="text-xs text-ink-500">Configure TypeSafe System One &amp; Hugging Face credentials</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-ink-100 mb-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('typesafe')}
            className={`pb-2 px-3 border-b-2 transition ${
              activeTab === 'typesafe'
                ? 'border-[#7C66DC] text-[#4D3DB5] font-semibold'
                : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            TypeSafe System One
          </button>
          <button
            onClick={() => setActiveTab('huggingface')}
            className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'huggingface'
                ? 'border-peach-600 text-peach-800 font-semibold'
                : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            <span>Hugging Face Token</span>
            {inputHfToken ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> : null}
          </button>
        </div>

        <div className="space-y-4">
          {activeTab === 'typesafe' ? (
            <>
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  TypeSafe API Key
                </label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="ts_live_..."
                  className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm font-mono focus:border-[#7C66DC] focus:ring-2 focus:ring-[#EEF0FD] focus:outline-none transition"
                />
                <p className="mt-1.5 text-[11px] text-ink-500 leading-relaxed">
                  Stored locally in your browser and used securely to query <code className="bg-ink-100 px-1 py-0.5 rounded text-[10px]">api.typesafe.ai/v1/systemone</code>.
                </p>
              </div>

              <div className="rounded-xl bg-pastel-lavender/50 border border-pastel-lavender-border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-ink-800">Calibrated Simulation Mode</div>
                    <div className="text-[11px] text-ink-600">Test immediately without consuming API credits</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSimulated}
                      onChange={(e) => onToggleSimulated(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-ink-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7C66DC]"></div>
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
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Hugging Face User Access Token
                </label>
                <input
                  type="password"
                  value={inputHfToken}
                  onChange={(e) => setInputHfToken(e.target.value)}
                  placeholder="hf_..."
                  className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm font-mono focus:border-peach-600 focus:ring-2 focus:ring-peach-100 focus:outline-none transition"
                />
                <p className="mt-1.5 text-[11px] text-ink-500 leading-relaxed">
                  Required for accessing <strong>gated datasets</strong> (such as LLaMA or Gemma) or private repositories.
                </p>
              </div>

              <div className="rounded-xl bg-peach-50 border border-peach-200 p-3 text-xs text-peach-900 leading-relaxed">
                <div className="font-semibold mb-1 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-peach-700" />
                  <span>Why is this needed?</span>
                </div>
                Certain datasets on Hugging Face require user agreements or gated permissions. Passing your token forwards an authenticated bearer header to the Hugging Face Datasets Server.
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-ink-100">
            {activeTab === 'typesafe' ? (
              <a
                href="https://typesafe.ai"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-ink-600 hover:text-ink-900 transition"
              >
                <span>Get TypeSafe Key</span>
                <ExternalLink size={12} />
              </a>
            ) : (
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-peach-700 hover:text-peach-900 font-medium transition"
              >
                <span>Get Hugging Face Token</span>
                <ExternalLink size={12} />
              </a>
            )}

            <div className="flex gap-2">
              {activeTab === 'typesafe' && inputKey && (
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="rounded-xl border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50 transition disabled:opacity-50"
                >
                  {testing ? 'Testing...' : 'Test Connection'}
                </button>
              )}
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#4D3DB5] hover:bg-[#3D2FA0] px-4 py-1.5 text-xs font-medium text-white transition shadow-soft-sm"
              >
                {saved ? <Check size={14} /> : null}
                {saved ? 'Saved!' : 'Save Credentials'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
