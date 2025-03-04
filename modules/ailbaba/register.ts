import {
  delay,
  waitForElement,
  simulateMouseClick,
  simulateType,
} from '../../utils'
import {
  getSliderFrame,
  simulateSliderDrag,
  checkSliderExists,
} from './index'
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

    await delay(1000);

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
      await delay(300);
    }

    await simulateMouseClick('input[name="memberAgreement"]')
    await delay(1000)
    await simulateMouseClick('button.RP-form-submit')

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    logger.error('填写注册表单失败: ' + errorMessage)
    throw new Error('填写注册表单失败: ' + errorMessage)
  }
}

// 处理注册滑块验证
export const handleRegistrationSlider = async () => {
  try {
    const frame = await getSliderFrame('https://login.alibaba.com//reg/pageRefresh.do');
    if (!frame || !frame.contentDocument) {
      throw new Error('未找到滑块 iframe');
    }

    await delay(3000)

    const hasSlider = await checkSliderExists(frame, '.nc_scale .btn_slide')

    if (!hasSlider) return logger.error('滑块验证不存在')
    const frameDocument = frame.contentDocument;
    const sliderHandle = frameDocument.querySelector('.nc_scale .btn_slide') as HTMLDivElement
    const sliderContainer = frameDocument.querySelector('.nc_wrapper') as HTMLDivElement

    if (!sliderHandle || !sliderContainer) {
      throw new Error('未找到滑块或滑块容器')
    }

    for (let retryCount = 0; retryCount < 10; retryCount++) {
      const sliderHandle = frameDocument.querySelector('.nc_scale .btn_slide') as HTMLDivElement
      const sliderContainer = frameDocument.querySelector('.nc_wrapper') as HTMLDivElement
      await simulateSliderDrag(sliderHandle, sliderContainer)
      await delay(600)
      const errWrapper = frameDocument.querySelector('.nc_wrapper .errloading');
      console.log('-- errWrapper', errWrapper)
      const result = errWrapper ? 'fail' : 'success';

      if (result === 'success') {
        return true
      } else if (result === 'fail') {
        await simulateMouseClick('div.custom-dialog-wrapper')
        await delay(1000)
      }

      if (retryCount === 9) {
        throw new Error('滑块验证重试次数过多')
      }
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    logger.error('处理滑块验证失败: ' + error)
    throw new Error('处理滑块验证失败: ' + error)
  }
}

// 处理邮箱验证码
export const handleVerificationCode = async (verificationCode: string) => {
  try {
    if (verificationCode) {
      await simulateType('input[name="emailVerifyCode"]', verificationCode)
      await delay(600)

      await waitForElement('.RP-modal-item:nth-child(3) button.RP-modal-button')
        .then(async (element) => {
          const registerBtn = element as HTMLButtonElement;
          console.log('-- registerBtn', registerBtn)
          await delay(6000);
          registerBtn.click();
        })
        .catch((error) => {
          logger.error('Failed to find submit button:', error);
        });

      // 等待登录完成
      await waitForElement('.new-header-search-tab', 30000)
      await delay(3000)
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    logger.error('处理验证码失败: ' + error)
    throw new Error('处理验证码失败: ' + error)
  }
}

