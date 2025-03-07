import {
  delay, waitForElement, simulateMouseClick, simulateType,
} from '../../utils';
import logger from '../../utils/logger';

// 导航到 ug.alibaba 网站
export const navigateToLoginPage = async () => {
  await delay(3000);
  try {
    // 跳转到 ug 进行用户设置
    window.location.href = 'https://ug.alibaba.com/?wx_navbar_transparent=true';
  } catch (err) {
    logger.error('导航到登录页面失败: ' + err.message);
    throw new Error(err.message);
  }
};

// 选择操作
export const handleUnlockStage = async () => {
  try {
    // 进行第一步选择
    await delay(2000);
    const businessTypes = document.querySelectorAll(
      '.business-identify-group .business-identify-type .type-item-title'
    );
    const otherType = Array.from(businessTypes).find(
      el => el.textContent?.trim() === 'Other'
    );

    if (!otherType) {
      throw new Error('Other business type option not found');
    }

    // 模拟点击 Other 选项
    await simulateMouseClick(otherType as HTMLElement);
    await delay(1000);

    // 点击下一步按钮
    await simulateMouseClick('#upgradeToDialog .layout-footer .footer-button');

    // 进行第二步选择
    await delay(5000);
    await simulateMouseClick('input#street');
    await delay(2000);
    await simulateType('input#street', 'New York');
    await delay(2000);
    await simulateMouseClick('input#street');
    await delay(5000);
    // 等待并选择第一个选项
    await simulateMouseClick('.next-overlay-wrapper .next-menu-item:first-child');

    await delay(2000);
    // 勾选协议
    await simulateMouseClick('.clause-box .fold-box .fold-box-checkbox');
    await delay(1000);

    // 最后点击提交按钮
    await simulateMouseClick('.layout-footer .footer-button');
    await delay(2000);
  } catch (error) {
    logger.error('处理解锁阶段失败:', error);
    throw error;
  }
};
