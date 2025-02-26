import {browser} from "wxt/browser";
import { waitForElement, delay } from '../utils';
import logger from '../utils/logger';
import { fillRegistrationForm } from '@/modules/ailbaba/register';

const getEmails = async () => {
  const stored = await browser.storage.local.get('alibaba_emails');
  return stored ? JSON.parse(stored.alibaba_emails as string) : [];
};

let emailList: string[] = [];

// Add message listener
// chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
//   if (message.type === 'SET_EMAILS') {
//     console.log('-- content chrome.runtime.onMessage message:', message);
//     emailList = message.data;
//     // Store emails in localStorage
//     await browser.storage.local.set({alibaba_emails: JSON.stringify(emailList)})
//     sendResponse({ success_content: true });
//   }

//   // Return true to indicate async response
//   return true;
// });

browser.runtime.onMessage.addListener(async (message, sender, sendResponse: (message: any) => void) => {
  console.log('-- content browser.runtime.onMessage message:', message);
  sendResponse({ success_content: true });
});

export default defineContentScript({
  matches: ['*://*.alibaba.com/*'],
  runAt: 'document_idle',
  main: async () => {
    const hostname = window.location.hostname;

    if (hostname.includes('www.alibaba.com')) {
      // 在主页点击注册按钮
      // waitForElement('.tnh-button.tnh-sign-up')
      //   .then(async (element) => {
      //     const registerBtn = element as HTMLButtonElement;
      //     await delay(2000);
      //     registerBtn.click();
      //   })
      //   .catch((error) => {
      //     logger.error('Failed to find register button:', error);
      //   });
    } else if (hostname.includes('login.alibaba.com')) {
      await delay(2000);

      emailList = await getEmails(); // Refresh emails from storage
      const email = emailList.shift();
      // 在注册页面填写表单
      fillRegistrationForm({
        email: email || '',
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

    // 与后台服务通信示例
    // browser.runtime.sendMessage({ action: 'getTime' })
    //   .then(response => console.log('Current time:', response.time))
  },
});