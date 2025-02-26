import {browser} from "wxt/browser";
import { useState } from 'react';
import './App.css';

function App() {
  const [emails, setEmails] = useState('qweqwe11@qwq.com');
  const [maxTabsNum] = useState(2)
  const [currentIndexNum, setCurrentIndexNum] = useState(0)
  const [runningTasks, setRuningTasks] = useState<any[]>([])

  const start = async () => {
    setCurrentIndexNum(0)
    setRuningTasks([])

    // Split emails into array and remove empty lines
    const emailList = emails.split('\n').filter(email => email.trim());
    console.log('emailList', emailList)
    const emailListLength = emailList.length > maxTabsNum ? maxTabsNum : emailList.length;

    emailList.forEach(async (email, index) => {
      setCurrentIndexNum(index)
      const tab = await browser.tabs.create({
        url: 'https://www.alibaba.com',
        active: false
      });
      if (tab.id) {
        setRuningTasks([...runningTasks, tab])
        await browser.tabs.sendMessage(tab.id, {
          type: 'SET_EMAILS',
          data: email // 发送邮箱列表
        });
      }
    });

    // 打开新标签页并发送消息
    // for (let i = 0; i < emailListLength; i++) {
    //   const tab = await browser.tabs.create({
    //     url: 'https://www.alibaba.com',
    //     active: false
    //   });

    //   // let response = await browser.runtime.sendMessage({
    //   //   eventType: 'SET_EMAILS11',
    //   //   content: emailList
    //   // });
    //   // console.log('-- App browser.runtime.sendMessage response:', response);

    //   // 等待页面加载完成后发送消息
    //   // chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
    //   //   if (tabId === tab.id && info.status === 'complete') {
    //   //     // Add timeout to ensure content script is loaded
    //   //     setTimeout(() => {
    //   //       if (!tab.id) return;
    //   //       console.log('-- App chrome.tabs.sendMessage tabId:', tabId);
    //   //       console.log('-- App chrome.tabs.sendMessage info:', info);
    //   //       chrome.tabs.sendMessage(
    //   //         tab.id,
    //   //         { type: 'SET_EMAILS', data: emailList },
    //   //         (response) => {
    //   //           if (chrome.runtime.lastError) {
    //   //             logger.error('Error sending message:', chrome.runtime.lastError);
    //   //             return;
    //   //           }
    //   //           console.log('-- App Message sent successfully:', response);
    //   //         }
    //   //       );
    //   //       // 移除监听器
    //   //       chrome.tabs.onUpdated.removeListener(listener);
    //   //     }, 1200);
    //   //   }
    //   // });
    // }
  }

  const onChangeEmails = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEmails(e.target.value);
  }

  return (
    <>
      <h1>WXT + React</h1>
      <div>当前处理的索引：{currentIndexNum}</div>
      <div className="card">
        <textarea
          value={emails}
          onChange={onChangeEmails}
          placeholder="输入邮箱"
        />
        <button onClick={start}>
          确定
        </button>
      </div>
    </>
  );
}

export default App;
