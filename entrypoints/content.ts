import {browser} from "wxt/browser";
import { waitForElement, delay, generateAccounts } from '../utils';
import logger from '../utils/logger';
import {
  fillRegistrationForm,
  handleRegistrationSlider,
  handleVerificationCode,
} from '@/modules/ailbaba/register';
import {
  getVerificationCodeFromOutlook,
  getSliderFrame,
  isUSIp,
} from '@/modules/ailbaba';
import { navigateToLoginPage } from '@/modules/ailbaba/ug';

// 获取当前标签页的 email
const getStoredEmail = async (maxRetries = 5, delayMs = 1000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const tabId = await getCurrentTabId();
      const result: any = await browser.storage.local.get('tab_emails');

      if (result.tab_emails && result.tab_emails[tabId]) {
        return result.tab_emails[tabId];
      }

      // If not the last attempt, wait before retrying
      if (attempt < maxRetries - 1) {
        await delay(delayMs);
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      if (attempt === maxRetries - 1) {
        throw error;
      }
      await delay(delayMs);
    }
  }

  const error = `Failed to get email after ${maxRetries} attempts`;
  logger.error(error);
  throw new Error(error);
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

browser.runtime.onMessage.addListener((message: any, sender, sendResponse: (message: any) => void) => {
  if (message.type === 'SET_EMAILS') {
    // 使用 Promise 处理异步操作
    saveEmail(message.data)
      .then(() => {
        sendResponse({ success: true, message: 'Email received' });
      })
      .catch((error) => {
        console.error('Failed to save email:', error);
        sendResponse({ success: false, message: 'Failed to save email' });
      });
    return true;
  }
});

export default defineContentScript({
  matches: ['*://*.alibaba.com/*'],
  runAt: 'document_idle',
  main: async () => {
    const hostname = window.location.hostname;
    console.log('-- hostname', hostname)

    if (hostname.includes('www.alibaba.com')) {
      await delay(2000);
      isUSIp()

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

      // 登录后进行level1
      waitForElement('.tnh-loggedin .tnh-ma')
        .then(async (element) => {
          if (element) {
            navigateToLoginPage()
          }
        })
        .catch((error) => {
          logger.error('Failed to find register button:', error);
        });
    } else if (hostname.includes('login.alibaba.com')) {
      await delay(2000);

      // 从存储中获取当前标签页的 email
      const email = await getStoredEmail();

      const result: string[] = email.split('----')

      if (!email) {
        logger.error('No email found in storage for this tab');
        return;
      }

      const account:{
        company: string,
        firstName: string,
        lastName: string,
        phoneAreaCode: string,
        address: string,
        phoneNumber: string
      } = generateAccounts(1)[0]
      // account.country = country

      // 在注册页面填写表单
      await fillRegistrationForm({
        password: result[1],
        email: result[0],
        country: 'United States',
        ...account
      }).catch((error) => {
        logger.error('Failed to fill registration form:', error);
      });

      await delay(3000);

      // 处理注册滑块验证
      let frame = null
      try {
        frame = await getSliderFrame('https://login.alibaba.com//reg/pageRefresh.do');
      } catch (error) {
        logger.error('Failed to get slider frame:', error);
      }
      if (frame) {
        // 处理注册滑块验证
        await handleRegistrationSlider().catch((error) => {
          logger.error('Failed to handle registration slider:', error);
        });
      }

      await delay(20000);

      // 获取验证码
      const verificationCode = await getVerificationCodeFromOutlook(
        result[0],
        result[2],
        result[3]
      )

      if (!verificationCode) {
        throw new Error('未能获取验证码')
      }

      // 处理验证码
      await handleVerificationCode(verificationCode)

      await delay(2500);

      let frameNext = null
      try {
        frameNext = await getSliderFrame('https://login.alibaba.com//reg/pageRefresh.do');
      } catch (error) {
        logger.error('Failed to get slider frame:', error);
      }
      if (frameNext) {
        // 处理注册滑块验证
        await handleRegistrationSlider().catch((error) => {
          logger.error('Failed to handle registration slider:', error);
        });
      }

      await delay(2000);

      await simulateMouseClick('button.RP-form-submit')
    } else if (hostname.includes('ug.alibaba.com')) {
      await delay(2000);
      await delay(5000);
      const headerButton = await waitForElement('.mb-header-button', 60000);
      await delay(3000);
      headerButton?.click();
    }
  },
});