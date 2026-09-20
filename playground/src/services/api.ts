import { HFDatasetMeta } from '../types';

export function simulateJevEvaluation(state: any, questions: Record<string, any>) {
  const stateStr = typeof state === 'string' ? state.toLowerCase() : JSON.stringify(state).toLowerCase();
  const answers: Record<string, any> = {};

  let totalInputTokens = Math.max(20, Math.floor(stateStr.length / 3.8));
  let totalOutputTokens = 0;

  for (const [qId, qDef] of Object.entries(questions)) {
    const qType = qDef.type;
    const instructions = (typeof qDef.instructions === 'string' ? qDef.instructions : JSON.stringify(qDef.instructions)).toLowerCase();

    if (qType === 'choice') {
      const criteria = qDef.criteria || {};
      const options = Object.keys(criteria);
      if (options.length === 0) {
        options.push('default', 'other');
      }

      const rawScores: Record<string, number> = {};
      let totalAffinity = 0;

      for (const opt of options) {
        const optLower = opt.toLowerCase();
        let affinity = 0.5 + Math.random() * 0.4;

        if (optLower.includes('pos') && (stateStr.includes('good') || stateStr.includes('great') || stateStr.includes('love') || stateStr.includes('excellent') || stateStr.includes('best') || stateStr.includes('amazing'))) affinity += 3.0;
        if (optLower.includes('neg') && (stateStr.includes('bad') || stateStr.includes('worst') || stateStr.includes('terrible') || stateStr.includes('poor') || stateStr.includes('awful') || stateStr.includes('hate'))) affinity += 3.0;
        if (optLower.includes('neu') && (!stateStr.includes('!') && !stateStr.includes('love') && !stateStr.includes('hate'))) affinity += 1.5;
        if (optLower.includes('high') && stateStr.length > 100) affinity += 1.2;
        if (optLower.includes('tech') && (stateStr.includes('code') || stateStr.includes('ai') || stateStr.includes('software') || stateStr.includes('data') || stateStr.includes('model') || stateStr.includes('api'))) affinity += 3.0;
        if (optLower.includes('business') && (stateStr.includes('market') || stateStr.includes('price') || stateStr.includes('revenue') || stateStr.includes('money') || stateStr.includes('stock'))) affinity += 2.5;
        if (optLower.includes('bug') && (stateStr.includes('error') || stateStr.includes('fail') || stateStr.includes('crash') || stateStr.includes('broken'))) affinity += 3.2;

        rawScores[opt] = Math.max(0.01, affinity);
        totalAffinity += rawScores[opt];
      }

      const probabilities: Record<string, number> = {};
      let maxProb = 0;
      let winningChoice = options[0];

      for (const opt of options) {
        const prob = parseFloat((rawScores[opt] / totalAffinity).toFixed(2));
        probabilities[opt] = prob;
        if (prob > maxProb) {
          maxProb = prob;
          winningChoice = opt;
        }
      }

      const sum = Object.values(probabilities).reduce((a, b) => a + b, 0);
      if (sum > 0) {
        const diff = parseFloat((1 - sum).toFixed(2));
        probabilities[winningChoice] = Math.max(0, parseFloat((probabilities[winningChoice] + diff).toFixed(2)));
      }

      const confidence = parseFloat(Math.min(0.98, Math.max(0.55, maxProb * 1.05)).toFixed(2));

      answers[qId] = {
        type: 'choice',
        choice: winningChoice,
        probabilities,
        confidence
      };
      totalOutputTokens += 32;

    } else if (qType === 'noul') {
      let probYes = 0.2 + Math.random() * 0.25;

      if (instructions.includes('toxic') || instructions.includes('offensive') || instructions.includes('abuse')) {
        if (stateStr.includes('kill') || stateStr.includes('idiot') || stateStr.includes('stupid') || stateStr.includes('hate') || stateStr.includes('scam')) {
          probYes = 0.88 + Math.random() * 0.08;
        } else {
          probYes = 0.03 + Math.random() * 0.08;
        }
      } else if (instructions.includes('urg') || instructions.includes('critical') || instructions.includes('asap')) {
        if (stateStr.includes('urgent') || stateStr.includes('asap') || stateStr.includes('immediately') || stateStr.includes('emergency') || stateStr.includes('!')) {
          probYes = 0.85 + Math.random() * 0.12;
        } else {
          probYes = 0.15 + Math.random() * 0.15;
        }
      } else if (instructions.includes('commercial') || instructions.includes('purchase')) {
        if (stateStr.includes('buy') || stateStr.includes('price') || stateStr.includes('cost') || stateStr.includes('order')) {
          probYes = 0.82 + Math.random() * 0.14;
        } else {
          probYes = 0.18 + Math.random() * 0.15;
        }
      }

      const noulVal = parseFloat(Math.min(0.99, Math.max(0.01, probYes)).toFixed(2));

      answers[qId] = {
        type: 'noul',
        noul: noulVal
      };
      totalOutputTokens += 18;

    } else if (qType === 'score') {
      const criteria = Array.isArray(qDef.criteria) ? qDef.criteria : ['Low', 'Medium', 'High'];
      const numLevels = criteria.length;

      const legend: Record<string, string> = {};
      criteria.forEach((lvl, idx) => {
        legend[String(idx)] = typeof lvl === 'string' ? lvl : JSON.stringify(lvl);
      });

      let targetCenter = (numLevels - 1) * 0.5;
      if (instructions.includes('frustrat') || instructions.includes('angry')) {
        if (stateStr.includes('angry') || stateStr.includes('furious') || stateStr.includes('worst') || stateStr.includes('unacceptable')) {
          targetCenter = numLevels - 1;
        } else {
          targetCenter = 0.3;
        }
      } else if (instructions.includes('help') || instructions.includes('quality')) {
        if (stateStr.length > 200 || stateStr.includes('because') || stateStr.includes('example')) {
          targetCenter = (numLevels - 1) * 0.8;
        } else {
          targetCenter = (numLevels - 1) * 0.4;
        }
      }

      const probabilities: Record<string, number> = {};
      let totalP = 0;
      for (let lvl = 0; lvl < numLevels; lvl++) {
        const dist = Math.abs(lvl - targetCenter);
        const weight = Math.exp(-1.5 * dist * dist) + 0.05 + Math.random() * 0.05;
        probabilities[String(lvl)] = weight;
        totalP += weight;
      }

      let weightedScore = 0;
      let maxProb = 0;
      for (let lvl = 0; lvl < numLevels; lvl++) {
        const normProb = parseFloat((probabilities[String(lvl)] / totalP).toFixed(2));
        probabilities[String(lvl)] = normProb;
        weightedScore += lvl * normProb;
        if (normProb > maxProb) maxProb = normProb;
      }

      const confidence = parseFloat(Math.min(0.95, Math.max(0.6, maxProb * 1.1)).toFixed(2));

      answers[qId] = {
        type: 'score',
        score: parseFloat(weightedScore.toFixed(2)),
        legend,
        probabilities,
        confidence
      };
      totalOutputTokens += 24;
    }
  }

  return {
    model: 'jev-1.13.0-simulated',
    answers,
    usage: {
      input_tokens: totalInputTokens,
      output_tokens: totalOutputTokens
    }
  };
}

export async function searchHfDatasets(query: string, hfToken?: string): Promise<{ datasets: HFDatasetMeta[] }> {
  if (!query.trim()) return { datasets: [] };

  // Try local express proxy first
  try {
    const res = await fetch(`/api/hf/search?q=${encodeURIComponent(query)}`, {
      headers: { ...(hfToken ? { 'x-hf-token': hfToken } : {}) }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.datasets) return data;
    }
  } catch {
    // Fallback to direct HF search
  }

  // Direct client-side Hugging Face search API (with CORS)
  const hfUrl = `https://huggingface.co/api/datasets?search=${encodeURIComponent(query)}&limit=15&full=true`;
  const response = await fetch(hfUrl, {
    headers: {
      'User-Agent': 'HF-Jev-Classifier/1.0',
      ...(hfToken ? { 'Authorization': `Bearer ${hfToken}` } : {})
    }
  });

  if (!response.ok) {
    throw new Error(`HF search failed with status ${response.status}`);
  }

  const data = await response.json();
  const datasets = (Array.isArray(data) ? data : []).map((item: any) => ({
    id: item.id || item._id,
    author: item.author || (item.id ? item.id.split('/')[0] : 'unknown'),
    description: item.description ? item.description.slice(0, 180) + (item.description.length > 180 ? '...' : '') : 'No description provided.',
    likes: item.likes || 0,
    downloads: item.downloads || item.trendingScore || 0,
    tags: (item.tags || []).slice(0, 5),
    private: item.private || false,
    gated: item.gated || false
  }));

  return { datasets };
}

export async function fetchHfRows(
  datasetId: string,
  config: string = 'default',
  split: string = 'train',
  limit: number = 10,
  hfToken?: string
) {
  // Try local express proxy first
  try {
    const res = await fetch(
      `/api/hf/rows?dataset=${encodeURIComponent(datasetId)}&config=${encodeURIComponent(config)}&split=${encodeURIComponent(split)}&offset=0&length=${limit}`,
      {
        headers: { ...(hfToken ? { 'x-hf-token': hfToken } : {}) }
      }
    );
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback to direct client-side fetch
  }

  // Direct client-side datasets-server fetch (with CORS)
  const rowsUrl = `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(datasetId)}&config=${encodeURIComponent(config)}&split=${encodeURIComponent(split)}&offset=0&length=${limit}`;
  const response = await fetch(rowsUrl, {
    headers: {
      'User-Agent': 'HF-Jev-Classifier/1.0',
      ...(hfToken ? { 'Authorization': `Bearer ${hfToken}` } : {})
    }
  });

  const data = await response.json();
  if (!response.ok) {
    const isAuthError = response.status === 401 ||
      response.status === 403 ||
      (data.error && (
        data.error.includes('authentication') ||
        data.error.includes('gated') ||
        data.error.includes('private') ||
        data.error.includes('does not exist')
      ));

    throw new Error(
      isAuthError
        ? 'This dataset is private, gated, or requires a Hugging Face User Access Token.'
        : (data.error || `Failed to fetch dataset rows (${response.status})`)
    );
  }

  const features = (data.features || []).map((f: any) => ({
    name: f.feature_idx || f.name,
    type: typeof f.type === 'string' ? f.type : (f.type?.dtype || f.type?._type || 'string')
  }));

  const candidateNames = ['text', 'sentence', 'review', 'instruction', 'prompt', 'content', 'input', 'question', 'body'];
  const candidateTextColumns = features
    .filter((f: any) => candidateNames.includes(f.name.toLowerCase()) || f.type === 'string')
    .map((f: any) => f.name);

  return {
    dataset: datasetId,
    config,
    split,
    features,
    candidateTextColumns,
    rows: data.rows || []
  };
}

export async function evaluateRow(options: {
  state: any;
  questions: Record<string, any>;
  model?: string;
  apiKey?: string;
  simulate?: boolean;
  signal?: AbortSignal;
}) {
  const { state, questions, model = 'jev-latest', apiKey, simulate = false, signal } = options;
  const startTime = performance.now();

  // Try local express endpoint first if not explicitly simulating
  try {
    const res = await fetch('/api/typesafe/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, questions, model, apiKey, simulate }),
      signal
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback to client-side evaluation
  }

  // Live direct API call if user entered API key
  if (apiKey && !simulate) {
    const apiRes = await fetch('https://api.typesafe.ai/v1/systemone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({ state, model, questions }),
      signal
    });

    const data = await apiRes.json();
    if (!apiRes.ok) {
      throw new Error(data.error || data.message || `TypeSafe API HTTP ${apiRes.status}`);
    }

    const latencyMs = Math.round(performance.now() - startTime);
    return {
      model: data.model || model,
      answers: data.answers || {},
      usage: data.usage || { input_tokens: 0, output_tokens: 0 },
      latencyMs,
      isSimulated: false
    };
  }

  // In-browser simulation
  await new Promise(r => setTimeout(r, 60));
  const sim = simulateJevEvaluation(state, questions);
  const latencyMs = Math.round(performance.now() - startTime);

  return {
    ...sim,
    latencyMs,
    isSimulated: true
  };
}
