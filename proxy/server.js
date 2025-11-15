const express = require('express');
const cors = require('cors');
const fetch = require('cross-fetch');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 8787;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'tngtech/deepseek-r1t2-chimera:free';
const OPENROUTER_TEMPERATURE = Number(process.env.OPENROUTER_TEMPERATURE || 0.8);
const REFERER = process.env.REFERER || 'http://localhost:8787';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',').map(origin => origin.trim()).filter(Boolean);

if (!OPENROUTER_API_KEY) {
  console.warn('Warning: OPENROUTER_API_KEY is not set. Requests will fail until you add it to proxy/.env.');
}

const app = express();

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked request from origin ${origin}`);
      callback(new Error('Origin not allowed by IIC Career Advisor proxy'));
    }
  }
}));

app.use(express.json());

app.post('/api/advice', async (req, res) => {
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'Server is missing OPENROUTER_API_KEY. Set it in proxy/.env.' });
  }

  const { summary, trigger, score, best, deaths, lives, difficulty } = req.body || {};
  if (!summary || !trigger) {
    return res.status(400).json({ error: 'summary and trigger are required' });
  }

  const userPrompt = `Game summary: ${summary} | Score ${score} | Best ${best} | Lives ${lives} | Deaths ${deaths} | Difficulty ${difficulty}. Trigger: ${trigger}. Give one concise motivating action.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': REFERER,
        'X-Title': 'Neon Cross IIC Career Advisor'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        temperature: OPENROUTER_TEMPERATURE,
        messages: [
          {
            role: 'system',
            content: 'You are the IIC Career Advisor for the Neon Cross arcade. Give concise (<=2 sentences) motivational guidance that links dodging traffic with preparing for interviews.'
          },
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || response.statusText });
    }

    const advice = data.choices?.[0]?.message?.content?.trim();
    return res.json({ advice, model: OPENROUTER_MODEL });
  } catch (error) {
    console.error('Advisor proxy error:', error);
    return res.status(502).json({ error: 'Failed to contact OpenRouter', details: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`IIC Career Advisor proxy listening on http://localhost:${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});
