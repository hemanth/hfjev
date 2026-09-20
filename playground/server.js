import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3080;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static frontend build if present
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'hf-jev-classifier', timestamp: new Date().toISOString() });
});

// Search Hugging Face datasets
app.get('/api/hf/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query) {
      return res.json({ datasets: [] });
    }

    const hfToken = req.headers['x-hf-token'] || process.env.HF_TOKEN || '';
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
    const datasets = (Array.isArray(data) ? data : []).map(item => ({
      id: item.id || item._id,
      author: item.author || (item.id ? item.id.split('/')[0] : 'unknown'),
      description: item.description ? item.description.slice(0, 180) + (item.description.length > 180 ? '...' : '') : 'No description provided.',
      likes: item.likes || 0,
      downloads: item.downloads || item.trendingScore || 0,
      tags: (item.tags || []).slice(0, 5),
      private: item.private || false,
      gated: item.gated || false
    }));

    res.json({ datasets });
  } catch (error) {
    console.error('Error searching HF datasets:', error);
    res.status(500).json({ error: error.message || 'Failed to search HF datasets' });
  }
});

// Get Dataset splits and configs
app.get('/api/hf/splits', async (req, res) => {
  try {
    const dataset = req.query.dataset;
    if (!dataset) {
      return res.status(400).json({ error: 'Missing dataset parameter' });
    }

    const hfToken = req.headers['x-hf-token'] || process.env.HF_TOKEN || '';
    const splitsUrl = `https://datasets-server.huggingface.co/splits?dataset=${encodeURIComponent(dataset)}`;
    const response = await fetch(splitsUrl, {
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

      // Check if dataset was renamed or has suggestions
      if (data.error && data.error.includes('renamed')) {
        return res.status(400).json({
          error: data.error,
          isRenamed: true,
          message: 'This dataset has been renamed on Hugging Face. Try searching for its current canonical name.'
        });
      }

      return res.status(response.status).json({
        error: data.error || 'Failed to fetch dataset splits',
        needsAuth: isAuthError,
        message: isAuthError
          ? 'This dataset is private, gated, or requires a Hugging Face User Access Token.'
          : (data.error || 'Failed to fetch dataset splits')
      });
    }

    // Format splits: group by config
    const configsMap = {};
    if (data.splits && Array.isArray(data.splits)) {
      for (const item of data.splits) {
        const configName = item.config || 'default';
        if (!configsMap[configName]) {
          configsMap[configName] = [];
        }
        configsMap[configName].push({
          split: item.split,
          num_rows: item.num_rows || item.num_examples || 0
        });
      }
    }

    res.json({
      dataset,
      configs: Object.keys(configsMap).map(name => ({
        name,
        splits: configsMap[name]
      }))
    });
  } catch (error) {
    console.error('Error fetching HF splits:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch dataset splits' });
  }
});

// Fetch rows for a dataset
app.get('/api/hf/rows', async (req, res) => {
  try {
    const { dataset, config = 'default', split = 'train', offset = 0, length = 20 } = req.query;
    if (!dataset) {
      return res.status(400).json({ error: 'Missing dataset parameter' });
    }

    const hfToken = req.headers['x-hf-token'] || process.env.HF_TOKEN || '';
    const rowsUrl = `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(dataset)}&config=${encodeURIComponent(config)}&split=${encodeURIComponent(split)}&offset=${offset}&length=${length}`;
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

      return res.status(response.status).json({
        error: data.error || data.message || `Failed to fetch rows (HTTP ${response.status})`,
        needsAuth: isAuthError,
        message: isAuthError
          ? 'This dataset is private, gated, or requires a Hugging Face User Access Token.'
          : (data.error || 'Failed to fetch rows')
      });
    }

    // Extract features and rows
    const features = (data.features || []).map(f => ({
      name: f.name || f.feature_idx,
      type: typeof f.type === 'string' ? f.type : (f.type?.dtype || f.type?._type || 'unknown'),
      rawType: f.type
    }));

    const rows = (data.rows || []).map((r, i) => ({
      row_idx: r.row_idx !== undefined ? r.row_idx : (parseInt(offset, 10) + i),
      row: r.row || {}
    }));

    // Detect candidate text columns
    const candidateTextColumns = features
      .filter(f => f.type === 'string' || f.type?.toLowerCase().includes('str') || f.name.toLowerCase().includes('text') || f.name.toLowerCase().includes('content') || f.name.toLowerCase().includes('review') || f.name.toLowerCase().includes('prompt'))
      .map(f => f.name);

    res.json({
      dataset,
      config,
      split,
      features,
      rows,
      candidateTextColumns: candidateTextColumns.length > 0 ? candidateTextColumns : (features[0] ? [features[0].name] : []),
      num_rows_total: data.num_rows_total || rows.length
    });
  } catch (error) {
    console.error('Error fetching HF rows:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch rows' });
  }
});

// Single row evaluation with TypeSafe System One (Jev)
app.post('/api/typesafe/evaluate', async (req, res) => {
  const startTime = Date.now();
  try {
    const { state, questions, model = 'jev-latest', apiKey: clientApiKey, simulate = false } = req.body;

    if (!state) {
      return res.status(400).json({ error: 'Missing required field: state' });
    }
    if (!questions || Object.keys(questions).length === 0) {
      return res.status(400).json({ error: 'Missing required field: questions (at least one question required)' });
    }

    const apiKey = clientApiKey || process.env.TYPESAFE_API_KEY;

    // If simulate requested or no API key, use calibrated simulator
    if (simulate || !apiKey) {
      const simulatedResult = simulateJevEvaluation(state, questions);
      const latencyMs = Math.max(120, Date.now() - startTime + Math.floor(Math.random() * 80));
      return res.json({
        ...simulatedResult,
        isSimulated: true,
        latencyMs
      });
    }

    // Call official TypeSafe System One API
    const typeSafeEndpoint = 'https://api.typesafe.ai/v1/systemone';
    const payload = {
      state,
      model,
      questions
    };

    const response = await fetch(typeSafeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      let errorMessage = responseData.error || responseData.message || `TypeSafe API error (status ${response.status})`;
      return res.status(response.status).json({
        error: errorMessage,
        status: response.status,
        details: responseData
      });
    }

    res.json({
      model: responseData.model || model,
      answers: responseData.answers || {},
      usage: responseData.usage || { input_tokens: 0, output_tokens: 0 },
      isSimulated: false,
      latencyMs
    });
  } catch (error) {
    console.error('TypeSafe evaluation error:', error);
    res.status(500).json({ error: error.message || 'Internal evaluation failure' });
  }
});

// Streaming Server-Sent Events batch evaluation
app.post('/api/typesafe/evaluate-stream', async (req, res) => {
  const { rows, textColumn, questions, model = 'jev-latest', apiKey: clientApiKey, simulate = false } = req.body;

  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'Missing or empty rows array' });
  }

  const apiKey = clientApiKey || process.env.TYPESAFE_API_KEY;
  const isSim = simulate || !apiKey;

  // Set headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Process rows sequentially or small concurrent chunks
  for (let i = 0; i < rows.length; i++) {
    const item = rows[i];
    const rowIdx = item.row_idx !== undefined ? item.row_idx : i;
    const rowData = item.row || item;

    // Prepare state from textColumn or entire row object
    let stateContent;
    if (textColumn && rowData[textColumn] !== undefined) {
      stateContent = String(rowData[textColumn]);
    } else if (typeof rowData === 'string') {
      stateContent = rowData;
    } else {
      stateContent = rowData;
    }

    const rowStartTime = Date.now();
    try {
      let evaluation;
      if (isSim) {
        evaluation = simulateJevEvaluation(stateContent, questions);
        // Small realistic delay for UI responsiveness
        await new Promise(r => setTimeout(r, 60));
      } else {
        const payload = { state: stateContent, model, questions };
        const apiRes = await fetch('https://api.typesafe.ai/v1/systemone', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`
          },
          body: JSON.stringify(payload)
        });

        const data = await apiRes.json();
        if (!apiRes.ok) {
          throw new Error(data.error || data.message || `HTTP ${apiRes.status}`);
        }
        evaluation = {
          model: data.model || model,
          answers: data.answers || {},
          usage: data.usage || { input_tokens: 0, output_tokens: 0 },
          isSimulated: false
        };
      }

      const latencyMs = Date.now() - rowStartTime;
      const eventPayload = {
        rowIdx,
        index: i,
        total: rows.length,
        status: 'completed',
        evaluation: {
          ...evaluation,
          latencyMs
        }
      };

      res.write(`data: ${JSON.stringify(eventPayload)}\n\n`);
    } catch (err) {
      const eventPayload = {
        rowIdx,
        index: i,
        total: rows.length,
        status: 'error',
        error: err.message || 'Row evaluation failed'
      };
      res.write(`data: ${JSON.stringify(eventPayload)}\n\n`);
    }
  }

  // Finished stream
  res.write(`data: ${JSON.stringify({ event: 'done' })}\n\n`);
  res.end();
});

// High-fidelity calibrated simulator for TypeSafe System One (Jev)
function simulateJevEvaluation(state, questions) {
  const stateStr = typeof state === 'string' ? state.toLowerCase() : JSON.stringify(state).toLowerCase();
  const answers = {};

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

      // Calculate semantic affinity scores based on text cues
      const rawScores = {};
      let totalAffinity = 0;

      for (const opt of options) {
        const optLower = opt.toLowerCase();
        let affinity = 0.5 + Math.random() * 0.4;

        // Keyword heuristics for realistic demo
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

      // Convert to normalized probabilities
      const probabilities = {};
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

      // Re-normalize so sum is 1.0
      const sum = Object.values(probabilities).reduce((a, b) => a + b, 0);
      if (sum > 0) {
        const diff = parseFloat((1 - sum).toFixed(2));
        probabilities[winningChoice] = Math.max(0, parseFloat((probabilities[winningChoice] + diff).toFixed(2)));
      }

      // Confidence calibrated from distribution sharpness
      const confidence = parseFloat(Math.min(0.98, Math.max(0.55, maxProb * 1.05)).toFixed(2));

      answers[qId] = {
        type: 'choice',
        choice: winningChoice,
        probabilities,
        confidence
      };
      totalOutputTokens += 32;

    } else if (qType === 'noul') {
      // Yes/No probability on [0, 1]
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

      const legend = {};
      criteria.forEach((lvl, idx) => {
        legend[String(idx)] = typeof lvl === 'string' ? lvl : JSON.stringify(lvl);
      });

      // Pick expected center based on state cues
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

      // Generate probability distribution peaking around targetCenter
      const probabilities = {};
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

// SPA fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`HF Jev Backend running on http://localhost:${PORT}`);
});
