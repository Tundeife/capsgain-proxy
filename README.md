# Capsgain Proxy

Lightweight proxy server that fetches Zoho published sheets server-side,
bypassing browser CORS restrictions.

## Deploy to Render

1. Push this folder to a GitHub repo called `capsgain-proxy`
2. Go to render.com → New → Web Service
3. Connect the repo
4. Settings:
   - Build Command: (leave empty)
   - Start Command: node server.js
   - Instance Type: Free
5. Deploy

## Usage

Once deployed at e.g. https://capsgain-proxy.onrender.com

Fetch any Zoho sheet:
GET /fetch?url=YOUR_ZOHO_PUBLISHED_URL

Health check:
GET /
