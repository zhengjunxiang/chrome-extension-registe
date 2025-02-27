// 模拟真实的鼠标移动和点击
export const simulateMouseClick = async (elementSelector: string) => {
  const element = await waitForElement(elementSelector) as HTMLInputElement
  if (!element) throw new Error('Element not found');
  const rect = element.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2

  // 在页面特定位置触发点击事件序列
  document.elementFromPoint(x, y)?.dispatchEvent(new MouseEvent('mouseover', {
    bubbles: true,
    clientX: x,
    clientY: y,
    view: window
  }))
  await delay(getRandomNumber(100, 300))

  document.elementFromPoint(x, y)?.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true,
    clientX: x,
    clientY: y,
    view: window
  }))
  await delay(getRandomNumber(50, 150))

  document.elementFromPoint(x, y)?.dispatchEvent(new MouseEvent('mouseup', {
    bubbles: true,
    clientX: x,
    clientY: y,
    view: window
  }))

  document.elementFromPoint(x, y)?.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    clientX: x,
    clientY: y,
    view: window
  }))
}

// 生成随机延迟时间
const getRandomDelay = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 模拟用户在输入框中输入文本
 * @param selector 输入框的CSS选择器
 * @param text 要输入的文本
 */
export const simulateUserTyping = async (selector: string, text: string) => {
  const element = document.querySelector(selector) as HTMLInputElement;
  if (!element) {
    throw new Error(`Element with selector "${selector}" not found`);
  }

  // 触发焦点事件
  element.focus();
  await delay(getRandomDelay(100, 300));

  // 逐个字符输入
  for (const char of text) {
    // 按键按下事件
    element.dispatchEvent(new KeyboardEvent('keydown', {
      key: char,
      code: `Key${char.toUpperCase()}`,
      bubbles: true,
      cancelable: true
    }));

    // 输入事件
    element.dispatchEvent(new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      data: char,
      inputType: 'insertText'
    }));

    // 更新输入框的值
    element.value += char;

    // 触发输入改变事件
    element.dispatchEvent(new Event('input', { bubbles: true }));

    // 按键抬起事件
    element.dispatchEvent(new KeyboardEvent('keyup', {
      key: char,
      code: `Key${char.toUpperCase()}`,
      bubbles: true,
      cancelable: true
    }));

    // 随机延迟模拟真实输入速度
    await delay(getRandomDelay(50, 150));
  }
  // 触发change事件
  element.dispatchEvent(new Event('change', { bubbles: true }));

  // 失去焦点
  await delay(getRandomDelay(100, 200));
  element.blur();
};

export async function simulateType(elementSelector: string, text: string, options = {delay: 100}) {
  // 1. 获取目标元素
  const element = await waitForElement(elementSelector) as HTMLInputElement
  if (!element) throw new Error('Element not found');

  // 2. 聚焦元素
  element.focus();

  // 3. 判断元素类型
  const isContentEditable = element.getAttribute('contenteditable') === 'true';
  const isInput = element.tagName.toLowerCase() === 'input';
  const isTextarea = element.tagName.toLowerCase() === 'textarea';

  // 4. 逐个字符输入
  for (const char of text) {
    // 触发键盘事件
    const eventOpts = { bubbles: true };
    element.dispatchEvent(new KeyboardEvent('keydown', eventOpts));
    element.dispatchEvent(new KeyboardEvent('keypress', eventOpts));

    // 更新元素内容
    if (isInput || isTextarea) {
      (element as HTMLInputElement).value += char;
      element.dispatchEvent(new Event('input', eventOpts));
    } else if (isContentEditable) {
      element.textContent += char;
    }

    element.dispatchEvent(new KeyboardEvent('keyup', eventOpts));

    // 处理延迟
    await delay(getRandomDelay(100, 200));
  }

  // 5. 触发最终变化事件
  element.dispatchEvent(new Event('change', { bubbles: true }));
  await delay(getRandomDelay(100, 200));
  element.blur();
}

export const waitForElement = (selector: string, timeout = 60000): Promise<HTMLElement> => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector)
    if (element) {
      return resolve(element as HTMLElement)
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector)
      if (element) {
        observer.disconnect()
        resolve(element as HTMLElement)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    setTimeout(() => {
      observer.disconnect()
      reject(new Error(`等待元素超时: ${selector}`))
    }, timeout)
  })
}

export const delay = (time: number) => new Promise((resolve) => setTimeout(resolve, time))

export const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}