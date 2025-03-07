import {browser} from "wxt/browser";
import {generateUserAgent} from "../utils";

export default defineBackground(() => {
  // 在插件后台输出日志
  browser.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
    if (message.type === 'GET_TAB_ID') {
      sendResponse({ tabId: sender.tab?.id });
    }
    return true;
  });

  // 清理标签页数据
  const cleanupTabData = async (tabId: number) => {
    const result = await browser.storage.local.get('tab_emails');
    const tabEmails: any = result.tab_emails || {};
    delete tabEmails[tabId];
    await browser.storage.local.set({ tab_emails: tabEmails });

    tabUserAgents.delete(tabId);
  };

  browser.tabs.onRemoved.addListener((tabId) => {
    cleanupTabData(tabId);
  });

  // 创建代理配置生成函数
  const getProxyConfig = () => ({
    host: 'brd.superproxy.io',
    port: '33335',
    username: 'brd-customer-hl_9c8905e7-zone-registers01',
    password: '9zy8ae3ctuvy'
  });

  // 应用代理设置的函数
  const applyProxySettings = () => {
    const proxyConfig = getProxyConfig();

    const config = {
      mode: "fixed_servers",
      rules: {
        singleProxy: {
          scheme: "http",
          host: proxyConfig.host,
          port: parseInt(proxyConfig.port)
        },
        bypassList: ["127.0.0.1", "localhost"] // 添加本地地址绕过
      }
    };

    // 设置认证处理函数
    const authHandler = (details: chrome.webRequest.WebAuthenticationChallengeDetails, callback: (response: chrome.webRequest.AuthCredentials) => void) => {
      if (details.isProxy) {
        callback({
          authCredentials: {
            username: proxyConfig.username,
            password: proxyConfig.password
          }
        });
      } else {
        callback({cancel: false});
      }
    };

    // 清理并重新设置认证监听器
    if (chrome.webRequest.onAuthRequired.hasListeners()) {
      chrome.webRequest.onAuthRequired.removeListener(authHandler);
    }

    chrome.webRequest.onAuthRequired.addListener(
      authHandler,
      { urls: ["<all_urls>"] },
      ['asyncBlocking']
    );

    // 应用新的代理设置
    return new Promise<void>((resolve, reject) => {
      chrome.proxy.settings.clear({}, () => {
        chrome.proxy.settings.set(
          { value: config, scope: 'regular' },
          () => {
            if (chrome.runtime.lastError) {
              console.error('Proxy settings error:', chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
            } else {
              console.log('Proxy settings applied successfully');
              resolve();
            }
          }
        );
      });
    });
  };

  // 监听标签页创建事件
  chrome.tabs.onCreated.addListener(async (tab) => {
    console.log(`New tab created with id: ${tab.id}`);
    try {
      await applyProxySettings();
      console.log(`Proxy settings applied for tab: ${tab.id}`);
    } catch (error) {
      console.error(`Failed to apply proxy settings for tab ${tab.id}:`, error);
    }

    if (tab.id) {
      setTabUserAgent(tab.id);
      console.log(`Set User-Agent for tab ${tab.id}:`, tabUserAgents.get(tab.id));
    }
  });

  // Debug监听器
  // chrome.webRequest.onBeforeRequest.addListener(
  //   (details) => {
  //     console.log('Request intercepted:', details.url);
  //   },
  //   { urls: ["<all_urls>"] }
  // );

  // 添加错误处理监听器
  // chrome.webRequest.onErrorOccurred.addListener(
  //   (details) => {
  //     console.error('Request error:', {
  //       url: details.url,
  //       error: details.error,
  //       timeStamp: details.timeStamp
  //     });
  //   },
  //   { urls: ["<all_urls>"] }
  // );

  // 每10秒检查一次代理状态
  setInterval(() => {
    chrome.proxy.settings.get({}, (settings) => {
      console.log('Current proxy status:', settings);
    });
  }, 10000);

  // 设置 User-Agent 列表
  // 存储每个标签页的 User-Agent
  const tabUserAgents = new Map<number, string>();

  // 为标签页设置随机 User-Agent
  const setTabUserAgent = (tabId: number) => {
    const randomUA = generateUserAgent();
    tabUserAgents.set(tabId, randomUA);
    return randomUA;
  };

  // 监听 webRequest 以修改 User-Agent
  browser.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      if (details.tabId === -1) return; // 忽略非标签页请求

      let userAgent = tabUserAgents.get(details.tabId);
      if (!userAgent) {
        userAgent = setTabUserAgent(details.tabId);
      }

      const headers = details.requestHeaders || [];
      const uaIndex = headers.findIndex(h => h.name.toLowerCase() === 'user-agent');

      if (uaIndex > -1) {
        headers[uaIndex].value = userAgent;
      } else {
        headers.push({ name: 'User-Agent', value: userAgent });
      }

      return { requestHeaders: headers };
    },
    { urls: ['<all_urls>'] },
    ['requestHeaders', 'blocking']
  );
});
