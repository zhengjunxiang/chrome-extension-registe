export default defineBackground({
  main: () => {
    console.log('Hello background!');
    browser.runtime.onMessage.addListener((message) => {
      if (message.action === 'getTime') {
        return Promise.resolve({ time: new Date() })
      }
    })
  }
});
