import { faker } from '@faker-js/faker'

// 模拟真实的鼠标移动和点击
export const simulateMouseClick = async (elementSelector: string | any) => {
  const element = typeof elementSelector === 'string'
    ? await waitForElement(elementSelector) as HTMLInputElement
    : elementSelector
  if (!element) throw new Error('Element not found');
  const rect = element.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2

  console.log('element:', element)

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

/**
 * 模拟用户在输入框中输入文本
 * @param selector 输入框的CSS选择器
 * @param text 要输入的文本
 */
export async function simulateType(elementSelector: string | HTMLInputElement, text: string, options = {delay: 100}) {
  // 1. 获取目标元素
  const element = typeof elementSelector === 'string'
    ? await waitForElement(elementSelector) as HTMLInputElement
    : elementSelector
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
    await delay(100);
  }

  // 5. 触发最终变化事件
  element.dispatchEvent(new Event('change', { bubbles: true }));
  await delay(100);
  element.blur();
}

export const waitForElement = (selector: string, timeout = 60000): Promise<HTMLElement> => {
  return new Promise((resolve, reject) => {
    const elements = document.querySelectorAll(selector)
    const element = elements[elements.length - 1]
    if (element) {
      return resolve(element as HTMLElement)
    }

    const observer = new MutationObserver(() => {
      const elements = document.querySelectorAll(selector)
      const element = elements[elements.length - 1]
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

// 动态生成用户数据
export function generateAccounts(numAccounts: number) {
  const accounts = []

  for (let i = 0; i < numAccounts; i++) {
    accounts.push({
      company: faker.company.name(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phoneAreaCode: faker.helpers.arrayElement(['1', '44', '86', '33', '49']),
      address: faker.location.streetAddress(),
      phoneNumber: faker.number.int({ min: 1000000, max: 9999999 }).toString()
    })
  }

  return accounts
}

// 动态生成 User-Agent
export const generateUserAgent = () => {
  const osOptions = [
    { name: 'Windows NT', versions: [10, 11], weight: 60 }, // Windows 10/11
    { name: 'Macintosh; Intel Mac OS X', versions: [10, 11, 12, 13, 14], weight: 40 } // macOS Catalina 到 Sonoma
  ]

  // 根据权重随机选择操作系统
  const operatingSystem = (() => {
    const totalWeight = osOptions.reduce((sum, os) => sum + os.weight, 0)
    let randomWeight = Math.random() * totalWeight

    for (const os of osOptions) {
      if (randomWeight < os.weight) return os
      randomWeight -= os.weight
    }
    return osOptions[0] // fallback to first option
  })()

  // 动态生成操作系统版本号
  const osVersion = (() => {
    const version =
      operatingSystem.versions[Math.floor(Math.random() * operatingSystem.versions.length)]
    const minorVersion = Math.floor(Math.random() * 6) // 次版本号范围 0-5
    return operatingSystem.name === 'Windows NT'
      ? `${version}.0` // Windows 的版本号格式
      : `${version}_${minorVersion}` // macOS 的版本号格式
  })()

  // 动态生成浏览器版本号
  const majorVersion = Math.floor(Math.random() * (118 - 114 + 1)) + 114 // 主版本号范围
  const minorVersion = Math.floor(Math.random() * 4) // 次版本号范围
  const buildVersion = Math.floor(Math.random() * 4000) + 2000 // 构建号范围
  const browserVersion = `${majorVersion}.${minorVersion}.${buildVersion}.0`

  return `Mozilla/5.0 (${operatingSystem.name} ${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion} Safari/537.36`
}