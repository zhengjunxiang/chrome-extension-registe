import { getRandomNumber, delay, waitForElement } from '../../utils'
import logger from '../../utils/logger'

interface Account {
  email: string
  password: string
  country: string
  company: string
  firstName: string
  lastName: string
  phoneAreaCode: string
  phoneNumber: string
}

// 填写注册表单
export const fillRegistrationForm = async (account: Account) => {
  try {
    await delay(1000)
    const countrySelect = await waitForElement('div[name="countryCode"]')
    console.log('countrySelect:', countrySelect)

    // 模拟真实的鼠标移动和点击
    const simulateMouseClick = async (element: HTMLElement) => {
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

      logger.info(`Clicking at coordinates: (${x}, ${y})`)
    }

    // 模拟真实的键盘输入
    const simulateTyping = async (element: HTMLElement, text: string) => {
      element.focus()
      await delay(getRandomNumber(100, 300))

      for (const char of text) {
        // 按键按下事件
        element.dispatchEvent(new KeyboardEvent('keydown', {
          key: char,
          code: `Key${char.toUpperCase()}`,
          bubbles: true
        }))

        // 输入字符
        element.dispatchEvent(new InputEvent('beforeinput', {
          bubbles: true,
          data: char,
          inputType: 'insertText'
        }))

        const input = element as HTMLInputElement
        input.value += char

        element.dispatchEvent(new Event('input', { bubbles: true }))

        // 按键释放事件
        element.dispatchEvent(new KeyboardEvent('keyup', {
          key: char,
          code: `Key${char.toUpperCase()}`,
          bubbles: true
        }))

        await delay(getRandomNumber(100, 300))
      }

      element.dispatchEvent(new Event('change', { bubbles: true }))
      await delay(getRandomNumber(100, 200))
      element.blur()
    }

    const simulateGlobalTyping = async (text: string) => {
      await delay(getRandomNumber(100, 300))

      for (const char of text) {
        // 按键按下事件
        document.dispatchEvent(new KeyboardEvent('keydown', {
          key: char,
          code: `Key${char.toUpperCase()}`,
          bubbles: true,
          composed: true
        }))

        // 输入字符事件
        document.dispatchEvent(new InputEvent('beforeinput', {
          bubbles: true,
          composed: true,
          data: char,
          inputType: 'insertText'
        }))

        // 模拟文本输入
        document.dispatchEvent(new Event('input', {
          bubbles: true,
          composed: true
        }))

        // 按键释放事件
        document.dispatchEvent(new KeyboardEvent('keyup', {
          key: char,
          code: `Key${char.toUpperCase()}`,
          bubbles: true,
          composed: true
        }))

        await delay(getRandomNumber(100, 300))
      }

      await delay(getRandomNumber(100, 200))
    }

    async function simulateType(elementSelector: string, text: string, options = {delay: 100}) {
      // 1. 获取目标元素
      const element = document.querySelector(elementSelector) as HTMLElement;
      console.log('element:', element)
      if (!element) throw new Error('Element not found');

      // 2. 聚焦元素
      element.focus();

      // 3. 判断元素类型
      const isContentEditable = element.getAttribute('contenteditable') === 'true';
      const isInput = element.tagName.toLowerCase() === 'input';
      const isTextarea = element.tagName.toLowerCase() === 'textarea';

      // 4. 逐个字符输入
      for (const char of text) {
        console.log('char:', char)
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
          await new Promise(resolve =>
              setTimeout(resolve, options.delay)
          );
      }

      // 5. 触发最终变化事件
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // 使用新的模拟点击方法
    await simulateMouseClick(countrySelect)
    await delay(1000)

    // 寻找并使用实际的搜索输入框
    await simulateType('div[name="countryCode"] input.ant-select-selection-search-input', account.country)

    await delay(2000)

    return;

    // 选择国家
    const options = document.querySelectorAll('.rc-virtual-list .ant-select-item.ant-select-item-option .il-select-item > span')
    const option = Array.from(options).find(opt =>
      opt.textContent === account.country || opt.textContent?.includes(account.country)
    )
    if (option) {
      (option as HTMLElement).click()
    }

    // 选择 trade role
    const tradeRole = await waitForElement('.ant-radio-group .ant-radio-wrapper:nth-child(1)')
    tradeRole.click()

    // 填写表单字段
    const formFields = {
      'email': account.email,
      'password': account.password,
      'confirmPassword': account.password,
      'companyName': account.company,
      'firstName': account.firstName,
      'lastName': account.lastName,
      'phoneAreaCode': account.phoneAreaCode,
      'phoneNumber': account.phoneNumber
    }

    for (const [name, value] of Object.entries(formFields)) {
      const input = await waitForElement(`input[name="${name}"]`) as HTMLInputElement
      await simulateTyping(input, value)
    }

    logger.info('表单填写完成')
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    logger.error('填写注册表单失败: ' + errorMessage)
    throw new Error('填写注册表单失败: ' + errorMessage)
  }
}
