# IIC Career Advisor Proxy

This folder contains a minimal Express server that keeps your OpenRouter key off the client. Deploy it anywhere (Render, Railway, Fly, Vercel, etc.) and point the game to its /api/advice endpoint.

## Local development

1. cd proxy
2. 
pm install
3. Copy .env.example to .env and set OPENROUTER_API_KEY (and optionally tweak allowed origins or model).
4. 
pm start
5. In the browser run the game from the repo root and ensure window.__ADVISOR_PROXY__ is pointing at http://localhost:8787/api/advice (the default for localhost).

## Deploying

- Push this folder to any Node-friendly platform.
- Set the environment variables shown in .env.example.
- Note the public URL (e.g., https://advisor.yourdomain.com/api/advice).
- In index.html, set window.__ADVISOR_PROXY__ before the game script loads (e.g., <script>window.__ADVISOR_PROXY__=\"https://advisor.yourdomain.com/api/advice\";</script>).

The frontend will refuse to call OpenRouter directly—everything routes through this proxy so your key stays private and OpenRouter trusts the requests.
