import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';

export default defineConfig(({ mode }) => {
  // Load platform environment variables from .env.[mode] or process.env
  const env = loadEnv(mode, process.cwd(), '');
  const platform = (env.VITE_PLATFORM || process.env.VITE_PLATFORM || '').toLowerCase().trim();

  // Plugin to inject the platform-specific SDK script tag into index.html
  const platformSdkPlugin: Plugin = {
    name: 'platform-sdk-injector',
    transformIndexHtml(html) {
      let sdkScript = '';

      if (platform === 'facebook') {
        sdkScript = '    <!-- Facebook Instant Games SDK -->\n    <script src="https://connect.facebook.net/en_US/fbinstant.7.1.js"></script>';
      } else if (platform === 'youtube') {
        sdkScript = '    <!-- YouTube Playables SDK -->\n    <script src="https://www.youtube.com/game_api/v1"></script>';
      }

      // If a platform SDK script is defined, inject it right before </head>
      if (sdkScript) {
        return html.replace('</head>', `${sdkScript}\n  </head>`);
      }

      return html;
    },
  };

  return {
    base: './',
    plugins: [react(), tailwindcss(), platformSdkPlugin],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
