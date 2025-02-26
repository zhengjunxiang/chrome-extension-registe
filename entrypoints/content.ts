import { waitForElement, delay } from '../utils';
import logger from '../utils/logger';
import { fillRegistrationForm } from '@/modules/ailbaba/register';

const getEmails = () => {
  const stored = localStorage.getItem('alibaba_emails');
  return stored ? JSON.parse(stored) : [];
};

let emailList: string[] = [];

// Add message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  logger.info('Content script received message:', message);

  if (message.type === 'SET_EMAILS') {
    emailList = message.data;
    // Store emails in localStorage
    localStorage.setItem('alibaba_emails', JSON.stringify(emailList));
    logger.info('Updated email list:', emailList);
    sendResponse({ success: true });
  }

  // Return true to indicate async response
  return true;
});

export default defineContentScript({
  matches: ['*://*.alibaba.com/*'],
  runAt: 'document_idle',
  main: async () => {
    const hostname = window.location.hostname;
    logger.info('Current hostname:', hostname);
    logger.info('Current email list:', emailList);

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

      emailList = getEmails(); // Refresh emails from storage
      logger.info('Retrieved email list:', emailList);
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