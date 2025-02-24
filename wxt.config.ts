import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    manifest_version: 3,
    name: 'Auto Tab Opener',
    version: '1.0',
    permissions: ['tabs', 'scripting'],
    host_permissions: ['*://*.alibaba.com/*'],
    action: {
      default_popup: 'popup.html',
    },
  },
  vite: () => ({
    build: { minify: false }
  })
});
