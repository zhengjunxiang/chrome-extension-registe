export default defineContentScript({
  matches: ['*://*.alibaba.com/*'],
  main() {
    console.log('Hello content111.');
    const links = document.querySelectorAll('a')
    links.forEach(link => {
      link.style.outline = '2px solid #4CAF50'
    })

    // 与后台服务通信示例
    browser.runtime.sendMessage({ action: 'getTime' })
      .then(response => console.log('Current time:', response.time))
  },
});