import {
  delay,
  waitForElement,
  simulateMouseClick,
  simulateType,
} from '../../utils'
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
    logger.info('表单填写开始')
    await delay(1000)

    // 使用新的模拟点击方法
    await simulateMouseClick('div[name="countryCode"]')
    await delay(1000)

    // 寻找并使用实际的搜索输入框
    await simulateType('div[name="countryCode"] input.ant-select-selection-search-input', account.country)

    await delay(1000);

    // 选择国家
    (Array.from(document.querySelectorAll('.rc-virtual-list .ant-select-item.ant-select-item-option .il-select-item > span')).find(opt =>
      opt.textContent === account.country || opt.textContent?.includes(account.country)
    ) as HTMLElement)?.click()

    // 选择 trade role
    const tradeRole = await waitForElement('.ant-radio-group .ant-radio-wrapper:nth-child(1)')
    tradeRole?.click()

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
      await simulateType(`input[name="${name}"]`, value)
    }

    await simulateMouseClick('input[name="memberAgreement"]')
    await delay(1000)
    await simulateMouseClick('button.RP-form-submit')

    logger.info('表单填写完成')
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    logger.error('填写注册表单失败: ' + errorMessage)
    throw new Error('填写注册表单失败: ' + errorMessage)
  }
}
