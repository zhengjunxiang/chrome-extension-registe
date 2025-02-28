import {browser} from "wxt/browser";
import { waitForElement, delay } from '../utils';
import logger from '../utils/logger';
import { fillRegistrationForm } from '@/modules/ailbaba/register';

// 获取当前标签页的 email
// const getStoredEmail = async () => {
//   const tabId = await getCurrentTabId();
//   const result = await browser.storage.local.get('tab_emails');
//   const tabEmails: any = result.tab_emails;
//   return tabEmails[tabId] || '';
// };

// 保存 email 到对应的标签页
// const saveEmail = async (email: string) => {
//   const tabId = await getCurrentTabId();
//   console.log('-- content saveEmail tabId:', tabId)
//   alert('content saveEmail tabId:' + tabId)
//   const result = await browser.storage.local.get('tab_emails');
//   const tabEmails: any = result.tab_emails || {};
//   tabEmails[tabId] = email;
//   await browser.storage.local.set({ tab_emails: tabEmails });
// };


// 获取当前标签页 ID
const getCurrentTabId = (): Promise<number> => {
  return new Promise((resolve) => {
    browser.runtime.sendMessage({ type: 'GET_TAB_ID' }, (response) => {
      console.log('--response', response)
      if (response && response.tabId) {
        logger.info('Got tab ID:', response.tabId);
        resolve(response.tabId);
      } else {
        logger.error('Failed to get tab ID');
        resolve(0);
      }
    });
  });
};
let email: string = '';

browser.runtime.onMessage.addListener(async (message: any, sender, sendResponse: (message: any) => void) => {
  if (message.type === 'SET_EMAILS') {
    email = message.data
    // await saveEmail(email);
    console.log('-- content Received email:', email)
    sendResponse({ success: true, message: 'Email received' })
  }
  // 必须返回 true 以支持异步响应
  return true
});

export default defineContentScript({
  matches: ['*://*.alibaba.com/*'],
  runAt: 'document_idle',
  main: async () => {
    const hostname = window.location.hostname;

    const tabId = await getCurrentTabId();

    alert(hostname + 'content tabId:' + tabId)

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
      await delay(2000);

      // 从存储中获取当前标签页的 email
      // email = await getStoredEmail();
      // console.log('-- content email from storage:', email);

      // if (!email) {
      //   logger.error('No email found in storage for this tab');
      //   return;
      // }

      // 在注册页面填写表单
      fillRegistrationForm({
        email: 'qweqwe11@qwq.com',
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
    }
  },
});