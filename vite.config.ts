import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function eventLivenessPlugin(): Plugin {
  return {
    name: 'event-liveness-plugin',
    configureServer(server) {
      server.middlewares.use('/api/check-url', async (req, res) => {
        const parsedUrl = new URL(req.url || '', 'http://localhost:3000');
        const targetUrl = parsedUrl.searchParams.get('url');

        if (!targetUrl) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ available: false, error: 'Missing url parameter' }));
          return;
        }

        try {
          const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(6000)
          });

          // 404 Not Found or 410 Gone means definitely removed
          if (response.status === 404 || response.status === 410) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              available: false, 
              status: response.status, 
              reason: `Source page returned HTTP ${response.status} (Removed by host)` 
            }));
            return;
          }

          // Check if redirected to a 404 page (e.g. lu.ma/404)
          const finalUrl = response.url.toLowerCase();
          if (finalUrl.includes('/404') || finalUrl.includes('/not-found') || finalUrl.includes('error=404')) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              available: false, 
              status: 404, 
              reason: 'Source redirected to 404 page (Event delisted)' 
            }));
            return;
          }

          // Inspect text snippet for takedown notices
          const text = (await response.text()).slice(0, 10000).toLowerCase();
          const takedownPhrases = [
            'this event has been deleted',
            'this event is no longer available',
            'event not found',
            'we couldn\'t find that page',
            'this page could not be found',
            'event has been cancelled',
            'registration closed and event removed'
          ];

          const foundTakedown = takedownPhrases.find(p => text.includes(p));
          if (foundTakedown) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              available: false, 
              status: 200, 
              reason: `Event marked removed by organizer ("${foundTakedown}")` 
            }));
            return;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ available: true, status: response.status }));
        } catch (err: any) {
          // If DNS fails (ENOTFOUND or domain dead)
          const errMsg = err?.message || '';
          if (errMsg.includes('ENOTFOUND') || errMsg.includes('getaddrinfo')) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              available: false, 
              reason: 'Host domain not reachable or expired' 
            }));
            return;
          }

          // In case of transient network timeout, default to available so we don't accidentally prune on slow Wi-Fi
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ available: true, warning: errMsg }));
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eventLivenessPlugin()],
  server: {
    port: 3000,
    open: false,
    host: true,
    allowedHosts: true
  }
});
