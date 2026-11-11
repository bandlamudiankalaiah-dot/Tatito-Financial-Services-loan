import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function silencePreviewWebSocketPlugin() {
  return {
    name: 'silence-preview-websocket',
    transform(code: string, id: string) {
      if (id.includes('vite/dist/client/client.mjs')) {
        const shim = `
const WebSocket = function(url, protocols) {
  const target = new EventTarget();
  target.url = String(url || '');
  target.protocol = Array.isArray(protocols) ? (protocols[0] || 'vite-hmr') : (protocols || 'vite-hmr');
  target.readyState = 1;
  target.send = function() {};
  target.close = function() { target.readyState = 3; };
  setTimeout(function() {
    try {
      const openEvt = new Event('open');
      if (typeof target.onopen === 'function') target.onopen(openEvt);
      target.dispatchEvent(openEvt);
      const msgEvt = new MessageEvent('message', { data: JSON.stringify({ type: 'connected' }) });
      if (typeof target.onmessage === 'function') target.onmessage(msgEvt);
      target.dispatchEvent(msgEvt);
    } catch (e) {}
  }, 5);
  return target;
};
`;
        return { code: shim + code, map: null };
      }
      return null;
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      silencePreviewWebSocketPlugin(),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),
      },
    },
    server: {
      hmr: false,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
