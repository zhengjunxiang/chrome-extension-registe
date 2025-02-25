import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    manifest_version: 3,
    name: 'Auto Tab Opener',
    version: '1.0',
    permissions: [
      "activeTab", "scripting", "sidePanel", "storage", "tabs",
    "proxy",
    "webRequest",
    "webRequestAuthProvider",
    "<all_urls>"],
    // host_permissions: ['*://*.alibaba.com/*'],
    host_permissions: ["*://*/*"],
  },
  vite: () => ({
    build: { minify: false }
  })
});
