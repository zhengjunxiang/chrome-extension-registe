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
    console.log('-- App emailList', emailList)
    const emailListLength = emailList.length > maxTabsNum ? maxTabsNum : emailList.length;

    emailList.forEach(async (email, index) => {
      setCurrentIndexNum(index)
      const tab = await browser.tabs.create({
        url: 'https://www.alibaba.com',
        active: false
      });

      // 等待页面加载完成
      await new Promise((resolve) => {
        browser.tabs.onUpdated.addListener(function listener(tabId, info) {
          if (tabId === tab.id && info.status === 'complete') {
            browser.tabs.onUpdated.removeListener(listener);
            setTimeout(resolve, 1000); // 额外等待 1 秒确保 content script 加载
          }
        });
      });

      if (tab.id) {
        setRuningTasks([...runningTasks, tab])
        try {
          const response = await browser.tabs.sendMessage(tab.id, {
            type: 'SET_EMAILS',
            data: email
          });
          console.log('-- App Message sent successfully:', response);
        } catch (error) {
          console.error('-- App Error sending message:', error);
        }
      }
    });
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
