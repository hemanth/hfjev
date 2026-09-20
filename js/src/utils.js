import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Fetch rows and schema from Hugging Face Datasets Server API.
 */
export async function fetchHuggingFaceRows(datasetId, options = {}) {
  const {
    config = 'default',
    split = 'train',
    limit = 10,
    offset = 0,
    hfToken = process.env.HF_TOKEN || ''
  } = options;

  const headers = {
    'User-Agent': 'hfjev/0.1.0'
  };
  if (hfToken) {
    headers['Authorization'] = `Bearer ${hfToken}`;
  }

  const url = `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(datasetId)}&config=${encodeURIComponent(config)}&split=${encodeURIComponent(split)}&offset=${offset}&length=${limit}`;

  let res;
  try {
    res = await fetch(url, { headers });
  } catch (err) {
    throw new Error(`Failed to connect to Hugging Face datasets server: ${err.message}`);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const isAuthError = res.status === 401 ||
      res.status === 403 ||
      (data.error && (
        data.error.includes('authentication') ||
        data.error.includes('gated') ||
        data.error.includes('private') ||
        data.error.includes('does not exist')
      ));

    if (isAuthError) {
      throw new Error(
        `Dataset "${datasetId}" requires authentication (private or gated). Pass 'hfToken' in options or set process.env.HF_TOKEN: https://huggingface.co/settings/tokens`
      );
    }

    throw new Error(data.error || data.message || `Hugging Face API returned HTTP ${res.status}`);
  }

  const features = (data.features || []).map(f => ({
    name: f.feature_idx || f.name,
    type: typeof f.type === 'string' ? f.type : (f.type?.dtype || f.type?._type || 'string')
  }));

  const rows = (data.rows || []).map((r, i) => ({
    index: r.row_idx !== undefined ? r.row_idx : i,
    data: r.row || {}
  }));

  // Auto-detect best text column
  const candidateNames = ['text', 'sentence', 'review', 'instruction', 'prompt', 'content', 'input', 'body', 'question'];
  let textColumn = candidateNames.find(c => features.some(f => f.name === c));
  if (!textColumn && features.length > 0) {
    const stringFeature = features.find(f => f.type === 'string');
    textColumn = stringFeature ? stringFeature.name : features[0].name;
  }

  return { rows, features, textColumn: textColumn || 'text' };
}

/**
 * Read local dataset file (JSON, JSONL, or CSV).
 */
export async function readLocalDataset(filePath) {
  const fullPath = path.resolve(process.cwd(), filePath);
  const content = await fs.readFile(fullPath, 'utf-8');

  let rows = [];
  if (filePath.endsWith('.jsonl') || (content.trim().startsWith('{') && content.includes('\n{'))) {
    rows = content.split('\n').filter(l => l.trim()).map((line, i) => {
      try {
        return { index: i, data: JSON.parse(line) };
      } catch {
        return null;
      }
    }).filter(Boolean);
  } else if (filePath.endsWith('.json')) {
    const parsed = JSON.parse(content);
    const array = Array.isArray(parsed) ? parsed : (parsed.rows || [parsed]);
    rows = array.map((r, i) => ({ index: i, data: r }));
  } else if (filePath.endsWith('.csv')) {
    const lines = content.split(/\r?\n/).filter(l => l.trim());
    if (lines.length > 0) {
      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
      rows = lines.slice(1).map((line, i) => {
        const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
        const obj = {};
        headers.forEach((h, idx) => { obj[h] = parts[idx] || ''; });
        return { index: i, data: obj };
      });
    }
  }

  const sample = rows[0]?.data || {};
  const features = Object.keys(sample).map(name => ({ name, type: 'string' }));
  const candidateNames = ['text', 'sentence', 'review', 'instruction', 'prompt', 'content', 'input', 'body'];
  const textColumn = candidateNames.find(c => Object.prototype.hasOwnProperty.call(sample, c)) || Object.keys(sample)[0] || 'text';

  return { rows, features, textColumn };
}

/**
 * Dynamically adapt classification dimensions to match dataset domain.
 */
export function getDynamicDimensions(datasetId = '') {
  const id = datasetId.toLowerCase();

  if (id.includes('movie') || id.includes('film') || id.includes('rotten_tomatoes') || id.includes('imdb')) {
    return {
      pack: 'Film & Media Reviews',
      dimensions: [
        { id: 'sentiment', type: 'choice', instructions: 'What is the critical verdict of this review?', criteria: { fresh: 'Positive praise', rotten: 'Negative critique' } },
        { id: 'is_spoiler', type: 'noul', instructions: 'Does this text reveal major plot twists or endings?' },
        { id: 'depth', type: 'score', instructions: 'Rate analytical depth of the critique', criteria: ['Superficial', 'Moderate', 'Masterclass'] }
      ]
    };
  }

  if (id.includes('news') || id.includes('article') || id.includes('headline')) {
    return {
      pack: 'News & Media Beats',
      dimensions: [
        { id: 'topic', type: 'choice', instructions: 'What primary journalistic beat does this article belong to?', criteria: { tech: 'Technology', business: 'Markets & Business', sports: 'Sports', world: 'Global Affairs' } },
        { id: 'sensationalism', type: 'noul', instructions: 'Is this headline clickbait or sensationalized?' },
        { id: 'density', type: 'score', instructions: 'Evaluate factual reporting density', criteria: ['Lightweight', 'Moderate', 'High-Density Report'] }
      ]
    };
  }

  if (id.includes('alpaca') || id.includes('instruction') || id.includes('prompt') || id.includes('dolly')) {
    return {
      pack: 'LLM Instruction Tuning',
      dimensions: [
        { id: 'task_type', type: 'choice', instructions: 'What type of task does this prompt request?', criteria: { generation: 'Creative text', coding: 'Code generation', reasoning: 'Logic & Math', extraction: 'Extraction' } },
        { id: 'is_adversarial', type: 'noul', instructions: 'Does this prompt attempt to bypass safety constraints?' },
        { id: 'clarity', type: 'score', instructions: 'How unambiguous and well-specified is the task?', criteria: ['Vague', 'Actionable', 'Exemplary Specification'] }
      ]
    };
  }

  if (id.includes('banking') || id.includes('support') || id.includes('ticket')) {
    return {
      pack: 'Support Intent & Escalation',
      dimensions: [
        { id: 'is_urgent', type: 'noul', instructions: 'Does this customer query require urgent tier-1 intervention?' },
        { id: 'frustration', type: 'score', instructions: 'Rate customer distress level', criteria: ['Calm', 'Inconvenienced', 'Severe Escalation'] },
        { id: 'is_actionable', type: 'noul', instructions: 'Does the query provide sufficient details to act?' }
      ]
    };
  }

  // General fallback
  return {
    pack: 'General Semantic Dimensions',
    dimensions: [
      { id: 'sentiment', type: 'choice', instructions: 'Overall emotional tone of the text', criteria: { positive: 'Positive', neutral: 'Neutral', negative: 'Negative' } },
      { id: 'is_urgent', type: 'noul', instructions: 'Does this convey immediate urgency or priority?' },
      { id: 'quality', type: 'score', instructions: 'Rate quality and clarity', criteria: ['Poor', 'Fair', 'Exceptional'] }
    ]
  };
}

/**
 * Evaluate a single row across multiple dimensions in a single parallel System One call.
 */
export async function evaluateRowWithJev(text, dimensions, options = {}) {
  const {
    apiKey = process.env.TYPESAFE_API_KEY || '',
    model = 'jev-latest',
    apiUrl = 'https://api.typesafe.ai/v1/systemone',
    simulate = false
  } = options;

  // Build speculative fan-out questions map
  const questions = {};
  for (const dim of dimensions) {
    questions[dim.id] = {
      instructions: dim.instructions,
      ...(dim.criteria ? { criteria: dim.criteria } : {})
    };
  }

  // If apiKey is provided and not in simulate mode, execute live System One call
  if (apiKey && !simulate) {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'hfjev/0.1.0'
      },
      body: JSON.stringify({
        model,
        state: text,
        questions
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `TypeSafe API HTTP ${res.status}`);
    }

    const json = await res.json();
    return {
      answers: json.answers || {},
      confidence: json.confidence !== undefined ? json.confidence : 0.9,
      model: json.model || model,
      simulated: false
    };
  }

  // Calibrated simulation engine when offline or no API key
  const answers = {};
  const lower = (text || '').toLowerCase();

  for (const dim of dimensions) {
    if (dim.type === 'noul') {
      const positiveCue = lower.includes('urgent') || lower.includes('asap') || lower.includes('twist') || lower.includes('fail') || lower.includes('help');
      const p = positiveCue ? 0.88 : (0.15 + (text.length % 30) / 100);
      answers[dim.id] = { noul: parseFloat(p.toFixed(3)) };
    } else if (dim.type === 'score') {
      const levels = Array.isArray(dim.criteria) ? dim.criteria : ['Low', 'High'];
      const maxScore = levels.length - 1;
      const scoreVal = Math.min(maxScore, Math.max(0, (text.length % 10) / 3));
      answers[dim.id] = {
        score: parseFloat(scoreVal.toFixed(2)),
        confidence: 0.85
      };
    } else {
      const keys = dim.criteria ? Object.keys(dim.criteria) : ['positive', 'negative'];
      const pick = keys[Math.abs(text.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % keys.length];
      const probs = {};
      keys.forEach((k, idx) => {
        probs[k] = k === pick ? 0.76 : parseFloat(((1 - 0.76) / (keys.length - 1)).toFixed(2));
      });
      answers[dim.id] = {
        choice: pick,
        probabilities: probs,
        confidence: 0.82
      };
    }
  }

  return {
    answers,
    confidence: 0.84,
    model: `${model}-simulated`,
    simulated: true
  };
}
