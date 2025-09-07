// netlify/functions/chat.js
exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const message = (payload.message || '').toString().trim();
    if (!message) return { statusCode: 400, body: JSON.stringify({ error: 'Empty message' }) };

    const API_KEY = process.env.SAMBANOVA_API_KEY; // set in Netlify
    const MODEL = process.env.SAMBANOVA_MODEL || 'Llama-4-Maverick-17B-128E-Instruct';
    const API_URL = 'https://api.sambanova.ai/v1/chat/completions';

    if (!API_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'Missing SAMBANOVA_API_KEY' }) };

    const body = {
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are Horizon AI, a friendly Andaman Islands travel companion. Provide clear, practical travel tips and local suggestions.' },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    };

    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const data = await resp.json();

    let reply = '';
    if (data?.choices?.[0]?.message?.content) {
      reply = data.choices[0].message.content;
    } else if (data?.output) {
      reply = typeof data.output === 'string' ? data.output : JSON.stringify(data.output);
    } else {
      reply = JSON.stringify(data);
    }

    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reply }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err.message || err) }) };
  }
};