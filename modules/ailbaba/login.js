import { getRandomNumber, delay } from '../../utils'
import logger from '../../utils/logger'
import { getSliderFrame } from './index'

// 导航到 ug.alibaba 网站
export const navigateToLoginPage = async (page) => {
  await delay(6000)
  try {
    // 跳转到 ug 进行用户设置
    await page.goto('https://ug.alibaba.com/?wx_navbar_transparent=true', {
      waitUntil: 'networkidle0',
      timeout: 120000
    })
  } catch (err) {
    logger.error('导航到登录页面失败: ' + err.message)
    throw new Error(err.message)
  }
}

// 检查是否在登录页
export const checkInLoginPage = async (page) => {
  await delay(1000)
  const accountInp = await page.$("input[name='account']")
  return !!accountInp
}

// 填写登录表单
export const fillLoginForm = async (page, email) => {
  const password = email.split('@')[0]

  const moveMouseToElement = async (selector) => {
    const element = await page.$(selector)
    if (!element) throw new Error(`元素 ${selector} 未找到`)
    const boundingBox = await element.boundingBox()
    if (!boundingBox) throw new Error(`无法获取元素 ${selector} 的边界框`)

    const { x, y, width, height } = boundingBox
    const targetX = x + width / 2 + getRandomNumber(-10, 10) // 随机偏移
    const targetY = y + height / 2 + getRandomNumber(-10, 10)

    const steps = getRandomNumber(20, 50) // 随机分步移动次数
    for (let i = 0; i <= steps; i++) {
      const moveX = x + (targetX - x) * (i / steps)
      const moveY = y + (targetY - y) * (i / steps)
      await page.mouse.move(moveX, moveY, { steps: 1 })
      await delay(getRandomNumber(5, 15)) // 每步移动间隔
    }
  }

  try {
    // 模拟窗口打开
    await page.goto('https://ug.alibaba.com/?wx_navbar_transparent=true', {
      waitUntil: 'networkidle0',
      timeout: 120000
    }) // 替换为实际登录页面 URL
    await delay(getRandomNumber(1000, 2000))

    // 鼠标移动到 "账号" 输入框并点击
    await moveMouseToElement("input[name='account']")
    await delay(getRandomNumber(200, 500))
    await page.click("input[name='account']")
    await delay(getRandomNumber(200, 500))

    // 键盘输入账号
    for (const char of email) {
      await page.keyboard.type(char, { delay: getRandomNumber(50, 150) })
    }

    await delay(getRandomNumber(600, 1000))

    // 鼠标移动到 "密码" 输入框并点击
    await moveMouseToElement("input[name='password']")
    await delay(getRandomNumber(200, 500))
    await page.click("input[name='password']")
    await delay(getRandomNumber(200, 500))

    // 键盘输入密码
    for (const char of password) {
      await page.keyboard.type(char, { delay: getRandomNumber(50, 150) })
    }

    await delay(getRandomNumber(2000, 3000))

    // 鼠标移动到登录按钮并点击
    await moveMouseToElement('button.sif_form-submit')
    await delay(getRandomNumber(500, 1000))
    await page.click('button.sif_form-submit')

    // 等待一段时间以观察登录是否成功
    await delay(5000)

    // 检查是否存在错误提示
    const errorTip = await page.$('.sif_form-tips .sif_form-error')
    if (errorTip) {
      throw new Error('登录失败: 请求接口失败')
    }
  } catch (err) {
    logger.error('登录操作失败: ' + err.message)
    throw new Error(err.message)
  }
}

// 拖动滑块
export const handleLoginSlider = async (page) => {
  const url = 'https://login.alibaba.com//newlogin/login.do'
  try {
    // 滑动验证
    const runSlider = async () => {
      const frame = await getSliderFrame(page, url)
      await delay(600)
      await frame.waitForSelector('.nc_scale .btn_slide', { timeout: 60000 })
      await delay(600)

      const sliderContainer = await frame.$('.nc_scale')
      const sliderHandle = await frame.$('.nc_scale .btn_slide')

      const silderContainerBox = await sliderContainer.boundingBox()
      const sliderHadnleBox = await sliderHandle.boundingBox()

      if (!sliderHadnleBox || !silderContainerBox) {
        throw new Error('Failed to retrieve bounding boxes for slider elements')
      }

      const startX = sliderHadnleBox.x + sliderHadnleBox.width / getRandomNumber(2, 4)
      const startY = sliderHadnleBox.y + sliderHadnleBox.height / getRandomNumber(2, 4)
      const endY = sliderHadnleBox.y - sliderHadnleBox.height * getRandomNumber(3, 10)
      const endX =
        sliderHadnleBox.x +
        silderContainerBox.width +
        sliderHadnleBox.width * getRandomNumber(5, 10)

      // 模拟拖动滑块
      await page.mouse.move(startX, startY, { steps: getRandomNumber(5, 20) })
      await delay(getRandomNumber(300, 500))
      await page.mouse.down()
      await delay(getRandomNumber(300, 500))
      await page.mouse.move(endX, endY, { steps: getRandomNumber(1, 2) }) // 多步拖动模拟人为操作
      await delay(getRandomNumber(500, 1000))
      await page.mouse.up()

      await delay(2000) // 等待验证结果加载
    }

    // 检查滑块验证结果
    const checkSliderResult = async (maxRetries = 30, delayMs = 300) => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        await delay(delayMs)
        const frame = await getSliderFrame(page, url)

        // 检查验证状态
        const errWrapper = await frame.$('.nc_wrapper .errloading')
        const okWrapper = await frame.$('.nc_wrapper .btn_ok')

        if (errWrapper) {
          return 'fail'
        }
        if (okWrapper) {
          return 'success'
        }
      }
      return 'timeout'
    }

    // 循环尝试滑块验证
    for (let retryCount = 0; retryCount < 10; retryCount++) {
      logger.info(`Starting slider verification attempt #${retryCount + 1}`)
      // 判断页面是否还在登录页
      let isHasAccountInp1 = await page.$("input[name='account']")
      if (!isHasAccountInp1) return true
      await delay(600)
      await runSlider()
      await delay(1000)
      let isHasAccountInp2 = await page.$("input[name='account']")
      if (!isHasAccountInp2) return true
      const result = await checkSliderResult()
      if (result === 'success') {
        page.waitForNavigation({ waitUntil: 'networkidle2' })
        return true
      } else if (result === 'fail') {
        const frame = await getSliderFrame(page, url)
        await frame.click('.nc_wrapper .errloading') // 点击重新加载
      } else if (result === 'timeout') {
        throw new Error('滑动验证超时')
      }
      if (retryCount >= 9) {
        throw new Error('滑动验证重试太多')
      }
    }
  } catch (err) {
    logger.error('登录滑块验证失败: ' + err.message)
    throw new Error('登录滑块验证失败: ' + err.message)
  }
}

// 选择操作
export const handleUnlockStage = async (page) => {
  await delay(5000)
  await page.waitForSelector('.mb-header-button', { timeout: 60000 })
  await delay(3000)
  await page.click('.mb-header-button')

  // 等待并获取 iframe 展示
  // await page.waitForSelector('.mb-dialog-content', { timeout: 30000 })
  await delay(5000)
  function getFrime() {
    return page.frames().find((frame) => {
      return frame.url().includes('https://air.alibaba.com/app')
    })
  }
  let frame = getFrime()
  let count = 0
  while (!frame && count < 10) {
    count++
    await delay(1000)
    frame = getFrime()
  }
  await delay(2000)
  // 等待滑块展示
  await frame.waitForSelector(
    '#upgradeToDialog .business-identify-group .business-identify-type .type-item-chose',
    { timeout: 60000 }
  )

  // 进行第一步选择
  await delay(2000)
  const businessTypeSelector = '.business-identify-group .business-identify-type .type-item-title'

  // 查找匹配文本为 "other" 的元素
  const targetElementHandle = await frame.evaluateHandle(
    (selector, text) => {
      const elements = Array.from(document.querySelectorAll(selector))
      return elements.find((el) => el.textContent.trim() === text)
    },
    businessTypeSelector,
    'Other'
  )

  const businessTypeBox = await targetElementHandle.boundingBox()

  const startX1 = businessTypeBox.x + businessTypeBox.width / 2
  const startY1 = businessTypeBox.y + businessTypeBox.height / 2
  await page.mouse.move(startX1, startY1, {
    steps: getRandomNumber(50, 100)
  })
  await page.mouse.down()
  await delay(300)
  await page.mouse.up()
  await delay(1000)
  await frame.click('#upgradeToDialog .layout-footer .footer-button')

  // 进行第二步选择
  await delay(5000)
  // await frame.waitForSelector('input#street', { timeout: 60000 })
  // await frame.type('input#street', 'New York', { delay: 100 })
  await frame.locator('input#street').fill('New York')
  await delay(3000)
  await frame.click('input#street')
  await delay(3000)
  await frame.waitForSelector('.next-overlay-wrapper .next-menu-item:first-child', {
    timeout: 60000
  })
  await delay(1000)
  await frame.click('.next-overlay-wrapper .next-menu-item:first-child')

  await delay(2000)
  await frame.click('#upgradeToDialog .clause-box .fold-box .fold-box-checkbox')
  await delay(1000)
  await frame.click('#upgradeToDialog .layout-footer .footer-button')
  await delay(2000)
}
