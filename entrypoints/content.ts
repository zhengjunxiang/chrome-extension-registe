import { waitForElement, delay } from '../utils';
import logger from '../utils/logger';
import { fillRegistrationForm } from '@/modules/ailbaba/register';

export default defineContentScript({
  matches: ['*://*.alibaba.com/*'],
  runAt: 'document_end',
  main: async () => {
    const hostname = window.location.hostname;

    if (hostname.includes('www.alibaba.com')) {
      // 在主页点击注册按钮
      waitForElement('.tnh-button.tnh-sign-up')
        .then(async (element) => {
          const registerBtn = element as HTMLButtonElement;
          console.log('registerBtn', registerBtn)
          await delay(2000);
          registerBtn.click();
        })
        .catch((error) => {
          logger.error('Failed to find register button:', error);
        });
    } else if (hostname.includes('login.alibaba.com')) {
      // 在注册页面填写表单
      fillRegistrationForm({
        email: 'qweqwe@qwq.com',
        password: 'qweqwe',
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