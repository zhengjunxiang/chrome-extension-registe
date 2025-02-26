import { useState } from 'react';
import './App.css';

function App() {
  const [tabNum, setTabNum] = useState('0');
  const [emails, setEmails] = useState('qweqwe11@qwq.com');

  const start = async () => {
    const num = parseInt(tabNum);
    if (isNaN(num) || num <= 0) {
      alert('请输入有效的数字！');
      return;
    }

    // Split emails into array and remove empty lines
    const emailList = emails.split('\n').filter(email => email.trim());

    // 打开新标签页并发送消息
    for (let i = 0; i < num; i++) {
      const tab = await chrome.tabs.create({
        url: 'https://www.alibaba.com',
        active: false
      });

      // 等待页面加载完成后发送消息
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          // Add timeout to ensure content script is loaded
          setTimeout(() => {
            if (!tab.id) return;
            chrome.tabs.sendMessage(
              tab.id,
              { type: 'SET_EMAILS', data: emailList },
              (response) => {
                if (chrome.runtime.lastError) {
                  logger.error('Error sending message:', chrome.runtime.lastError);
                  return;
                }
                logger.info('Message sent successfully:', response);
              }
            );
          }, 1200);

          // 移除监听器
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    }
  }

  const onChangeTabNum = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTabNum(e.target.value);
  }

  const onChangeEmails = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEmails(e.target.value);
  }

  return (
    <>
      <h1>WXT + React</h1>
      <div className="card">
        <textarea
          value={emails}
          onChange={onChangeEmails}
          placeholder="输入邮箱"
        />
        <input
          type="number"
          min="1"
          value={tabNum}
          onChange={onChangeTabNum}
          placeholder="输入要打开的标签页数量"
        />
        <button onClick={start}>
          确定
        </button>
      </div>
    </>
  );
}

export default App;
