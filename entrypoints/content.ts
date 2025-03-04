import {browser} from "wxt/browser";
import { waitForElement, delay } from '../utils';
import logger from '../utils/logger';
import {
  fillRegistrationForm,
  handleRegistrationSlider,
  handleVerificationCode,
} from '@/modules/ailbaba/register';
import {
  getVerificationCodeFromOutlook,
} from '@/modules/ailbaba';

// 获取当前标签页的 email
const getStoredEmail = async () => {
  console.log('-- getStoredEmail')
  const tabId = await getCurrentTabId();
  const result = await browser.storage.local.get('tab_emails');
  const tabEmails: any = result.tab_emails;
  return tabEmails[tabId] || '';
};

// 保存 email 到对应的标签页
const saveEmail = async (email: string) => {
  const tabId = await getCurrentTabId();
  const result = await browser.storage.local.get('tab_emails');
  const tabEmails: any = result.tab_emails || {};
  tabEmails[tabId] = email;
  await browser.storage.local.set({ tab_emails: tabEmails });
};

// 获取当前标签页 ID
const getCurrentTabId = (): Promise<number> => {
  return new Promise((resolve) => {
    browser.runtime.sendMessage({ type: 'GET_TAB_ID' }).then((response: any) => {
      if (response && response.tabId) {
        resolve(response.tabId);
      } else {
        logger.error('Failed to get tab ID');
        resolve(0);
      }
    });
  });
};

browser.runtime.onMessage.addListener(async (message: any, sender, sendResponse: (message: any) => void) => {
  if (message.type === 'SET_EMAILS') {
    sendResponse({ success: true, message: 'Email received' });
    // 使用 Promise 处理异步操作
    saveEmail(message.data)
      .catch((error) => {
        console.error('Failed to save email:', error);
      });
    return true; // 表明会异步调用 sendResponse
  }
});

// 在 background script 中执行登录
const getAccessToken = async (clientId: string): Promise<string> => {
  const response: any = await browser.runtime.sendMessage({
    type: 'LOGIN',
    clientId
  });

  if (!response.success) {
    throw new Error(response.error || 'Login failed');
  }

  return response.accessToken;
};

export default defineContentScript({
  matches: ['*://*.alibaba.com/*'],
  runAt: 'document_idle',
  main: async () => {
    const hostname = window.location.hostname;

    if (hostname.includes('www.alibaba.com')) {
      // 在主页点击注册按钮
      waitForElement('.tnh-button.tnh-sign-up')
        .then(async (element) => {
          const registerBtn = element as HTMLButtonElement;
          await delay(2000);
          registerBtn.click();
        })
        .catch((error) => {
          logger.error('Failed to find register button:', error);
        });
    } else if (hostname.includes('login.alibaba.com')) {
      await delay(5000);

      // 从存储中获取当前标签页的 email
      const email = await getStoredEmail();

      const result: {
        emailName: string,
        clientId: string,
        refreshToken: string
      }[] = Array.from(
        email.matchAll(
          /(.*?)----(.*?)----(.*?)----(.*?)\$\$/g
        ),
        (match: string[]) => ({
          emailName: match[1],
          clientId: match[3],
          refreshToken: match[4]
        })
      )

      console.log('-- result', result)

      if (!email) {
        logger.error('No email found in storage for this tab');
        return;
      }

      // 在注册页面填写表单
      await fillRegistrationForm({
        email: result[0].emailName,
        // email: 'jewn241564106@outlook.com',
        password: 'qweqwSqw2313',
        country: 'United States',
        company: 'asaasd',
        firstName: 'asasa',
        lastName: 'qwqwq',
        phoneAreaCode: '86',
        phoneNumber: '12321321',
      }).catch((error) => {
        logger.error('Failed to fill registration form:', error);
      });

      await delay(2000);

      await handleRegistrationSlider().catch((error) => {
        logger.error('Failed to handle registration slider:', error);
      });

      await delay(15000);

      const verificationCode = await getVerificationCodeFromOutlook(
        result[0].emailName,
        result[0].clientId,
        result[0].refreshToken
      )

      if (!verificationCode) {
        throw new Error('未能获取验证码')
      }

      console.log('-- verificationCode', verificationCode)

      await handleVerificationCode(verificationCode)
    }
  },
});