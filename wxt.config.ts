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
      "webRequestBlocking",
      "webNavigation",
      "scripting",
      "<all_urls>",
    ],
    host_permissions: [
      "<all_urls>",
      "https://*.alibaba.com/*",
      "https://*.superproxy.io/*"
    ],
    "content_scripts": [
      {
        "matches": ["https://air.alibaba.com/*"],
        "js": ["contentIframe.js"],
        "all_frames": true
      }
    ]
  },
  vite: () => ({
    build: { minify: false }
  })
});
