export 
const waitForElement = (selector: string, timeout = 60000): Promise<HTMLElement> => {
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