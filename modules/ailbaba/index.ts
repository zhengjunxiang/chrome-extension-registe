import axios from 'axios'
import logger from '../../utils/logger'
import { delay, getRandomNumber } from '../../utils'

// 确认是否为 美国 IP
// https://ipinfo.io/json
export const isUSIp = async () => {
  try {
    const response = await fetch('https://ipinfo.io/json');
    const data = await response.json();
    console.log('-- isUSIp data', data)
    return data.country === 'US';
  } catch (error) {
    logger.error('获取 IP 地址信息失败:', error);
    return false;
  }
};

// 获取滑块所在的 iframe
export const getSliderFrame = async (url: string, maxRetries = 5, delayMs = 2000): Promise<HTMLIFrameElement | null> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    logger.info(`获取滑块 iframe, 第 ${attempt + 1} 次尝试`);
    // 获取所有 iframe 元素
    const iframes = Array.from(document.querySelectorAll('iframe'));

    // 找到匹配 URL 的 iframe
    const targetFrame = iframes.find(frame => {
      try {
        return frame.src.includes(url);
      } catch {
        return false;
      }
    }) as HTMLIFrameElement;

    if (targetFrame) {
      logger.info('成功找到滑块 iframe');
      return targetFrame;
    }

    // 如果不是最后一次尝试，则等待后继续
    if (attempt < maxRetries - 1) {
      await delay(delayMs);
    }
  }

  logger.error(`在 ${maxRetries} 次尝试后未找到滑块 iframe`);

  throw new Error('获取滑块 iframe 失败');
};

// 生成非线性的移动轨迹
const generateMoveTrack = (distance: number, steps: number): number[] => {
  const track: number[] = [];
  let current = 0;
  let mid = distance * 4 / 5; // 减速点
  let rate = getRandomNumber(2, 3); // 加速度

  // 匀加速阶段
  for (let i = 0; i < steps / 2; i++) {
    const v = rate * i;
    current += v;
    if (current > mid) break;
    track.push(current);
  }

  // 匀减速阶段
  let remain = distance - current;
  let count = steps - track.length;

  for (let i = 0; i < count; i++) {
    const v = remain / (count - i);
    current += v;
    if (current > distance) current = distance;
    track.push(current);
  }

  return track;
};

// 模拟滑块拖动
export const simulateSliderDrag = async (sliderHandle: HTMLDivElement, sliderContainer: HTMLDivElement) => {
  try {
    // 获取滑块和容器的位置信息
    const sliderRect = sliderHandle.getBoundingClientRect()
    const containerRect = sliderContainer.getBoundingClientRect()

    // 计算滑动距离和起始位置
    const startX = sliderRect.left;
    const startY = sliderRect.top + sliderRect.height / 2;
    const distance = containerRect.width + sliderRect.width * getRandomNumber(1, 2);

    // 模拟鼠标移动
    sliderHandle.dispatchEvent(new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: startX,
      clientY: startY
    }));

    await delay(getRandomNumber(1000, 2000));

    // 生成非线性的移动轨迹
    const steps = getRandomNumber(10, 20);
    const movePoints = generateMoveTrack(distance, steps);

    // 执行移动
    for (let i = 0; i < movePoints.length; i++) {
      const currentX = startX + movePoints[i];

      // 添加随机的Y轴偏移，模拟真实人手的抖动
      const offsetY = getRandomNumber(-2, 2);
      const currentY = startY + offsetY;

      sliderHandle.dispatchEvent(new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: currentX,
        clientY: currentY
      }));

      await delay(getRandomNumber(100, 200));
    }
    await delay(2000)

    // 模拟鼠标松开
    sliderHandle.dispatchEvent(new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: startX + distance,
      clientY: startY
    }));

    await delay(2000)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error('滑块拖动失败:', errorMessage)
    throw new Error('滑块拖动失败: ' + errorMessage)
  }
}

// 检查滑块是否存在
export const checkSliderExists = async (frame: HTMLIFrameElement, selector: string): Promise<boolean> => {
  try {
    // 访问 iframe 内部的 DOM
    const frameDocument = frame.contentDocument;
    if (!frameDocument) return false;

    const slider = frameDocument.querySelector(selector);
    return !!slider;
  } catch {
    return false;
  }
};

export async function getVerificationCodeFromOutlook(emailName: string, clientId: string, refreshToken: string) {
  try {
    if (!emailName || !clientId || !refreshToken) {
      throw new Error('缺少必要的参数')
    }
    const response = await axios.get('https://nodejs-serverless-lems-projects-333c5fa8.vercel.app/api/v1/codeFromOutlook', {
      params: { emailName, clientId, refreshToken }
    });

    if (response.data && response.data.status === 200) {
      return response.data.data;
    }

    throw new Error('未找到验证码')
  } catch (error) {
    // 确保错误被正确传播
    throw error instanceof Error ? error : new Error(String(error))
  }
}
