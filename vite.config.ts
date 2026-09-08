import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

const BUILD_TIMESTAMP = Date.now().toString();

const versionPlugin = (buildId: string): Plugin => {
  return {
    name: 'version-emit-plugin',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({
          buildId,
          version: '1.1.0',
          avatarVersion: 'v2',
          updatedAt: new Date().toISOString(),
        }),
      });
    },
  };
};

export default defineConfig(() => {
  return {
    base: './',
    define: {
      __APP_BUILD_ID__: JSON.stringify(BUILD_TIMESTAMP),
    },
    plugins: [react(), tailwindcss(), versionPlugin(BUILD_TIMESTAMP)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
