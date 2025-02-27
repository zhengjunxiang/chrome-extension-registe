import {browser} from "wxt/browser";

export default defineBackground(() => {

  // 在插件后台输出日志
  browser.runtime.onMessage.addListener(async (message, sender, sendResponse: (message: any) => void) => {
    console.log('-- background browser.runtime.onMessage message:', message);
    sendResponse({ success_background: true })
  });

  // 清理标签页数据
  // const cleanupTabData = async (tabId: number) => {
  //   const result = await browser.storage.local.get('tab_emails');
  //   const tabEmails: any = result.tab_emails || {};
  //   delete tabEmails[tabId];
  //   await browser.storage.local.set({ tab_emails: tabEmails });
  // };

  // browser.tabs.onRemoved.addListener((tabId) => {
  //   cleanupTabData(tabId);
  // });

  // 创建代理配置生成函数
  // const getProxyConfig = () => ({
  //   host: 'brd.superproxy.io',
  //   port: '33335',
  //   username: 'brd-customer-hl_9c8905e7-zone-registers01',
  //   password: '9zy8ae3ctuvy'
  // });

  // 应用代理设置的函数
  // const applyProxySettings = () => {
  //   const proxyConfig = getProxyConfig();

  //   const config = {
  //     mode: "fixed_servers",
  //     rules: {
  //       singleProxy: {
  //         scheme: "http",
  //         host: proxyConfig.host,
  //         port: parseInt(proxyConfig.port)
  //       },
  //       bypassList: []
  //     }
  //   };

  //   // 移除之前的认证监听器
  //   if (chrome.webRequest.onAuthRequired.hasListener(authHandler)) {
  //     chrome.webRequest.onAuthRequired.removeListener(authHandler);
  //   }

  //   // 设置新的认证信息
  //   const authHandler = (details: any, callbackFn: any) => {
  //     callbackFn({
  //       authCredentials: {
  //         username: proxyConfig.username,
  //         password: proxyConfig.password
  //       }
  //     });
  //   };

  //   // 添加新的认证监听器
  //   chrome.webRequest.onAuthRequired.addListener(
  //     authHandler,
  //     { urls: ["<all_urls>"] },
  //     ['asyncBlocking']
  //   );

  //   // 应用新的代理设置
  //   return new Promise((resolve) => {
  //     chrome.proxy.settings.set(
  //       { value: config, scope: 'regular' },
  //       () => {
  //         console.log('New proxy settings applied');
  //         resolve(true);
  //       }
  //     );
  //   });
  // };

  // 监听标签页创建事件
  // chrome.tabs.onCreated.addListener(async (tab) => {
  //   console.log(`New tab created with id: ${tab.id}`);
  //   await applyProxySettings();
  // });

  // // 监听标签页更新事件（可选：当标签页URL改变时也更新代理）
  // chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  //   if (changeInfo.url) {
  //     console.log(`Tab ${tabId} navigated to: ${changeInfo.url}`);
  //     await applyProxySettings();
  //   }
  // });

  // 初始应用代理设置
  // applyProxySettings();

  // console.log('Background script main function completed'); // 添加完成日志

  // 原有的消息监听代码
  // browser.runtime.onMessage.addListener((message) => {
  //   if (message.action === 'getTime') {
  //     return Promise.resolve({ time: new Date() })
  //   }
  // });
});
