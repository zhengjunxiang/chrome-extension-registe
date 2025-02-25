import logger from '../../utils/logger'
import { delay } from '../../utils'

// 确认是否为 美国 IP
export const isUSIP = async (page) => {
  try {
    await page.goto('https://ipinfo.io/json', {
      waitUntil: ['domcontentloaded']
    })
    // 提取页面返回的 IP 信息
    const ipInfo = await page.evaluate(() => JSON.parse(document.body.innerText))

    if (ipInfo && ipInfo.country === 'US') {
      logger.info('当前IP为美国IP')
    }
    return ipInfo

    // throw new Error('查询IP失败: ' + '非 US IP')
  } catch (err) {
    logger.error('查询IP失败: ' + err.message)
    throw new Error('查询IP失败: ' + err.message)
  }
}

// 获取滑块 iframe
export const getSliderFrame = async (page, url, maxRetries = 10, delayMs = 2000) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const frame = page.frames().find((frame) => frame.url().includes(url))
    if (frame) return frame
    logger.info(`Retrying to find slider iframe, attempt ${attempt + 1}`)
    await delay(delayMs)
  }
  throw new Error('获取 iframe 失败')
}
