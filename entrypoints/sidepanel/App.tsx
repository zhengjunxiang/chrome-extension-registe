import {browser} from "wxt/browser";
import { useState } from 'react';
import './App.css';

function App() {
  const [emails, setEmails] = useState(
    'urvtylzllg486@outlook.com----hul033166----9e5f94bc-e8a4-4e73-b8be-63364c29d753----M.C562_SN1.0.U.-CqS*grIDtPKha3FKk7JJxhIyvMTxNoo614vuQjFylZBx8uUByQtS9fQmETpepRXYYaIfxE5Ra7WWrdnwS*p!7odOtYoUq94iuFtRbdXIl0jKfeJR!0dzrYnDGzChoOkPgnYCLadqEOVmd1GVCaZp*66WkTYK31rz2oQqSg!bBlcUf7Q3IeWEGHyQD1kn8bOFs4D74gKCgEVyorlEUz2lGYg2wIUj9nILtsUQ5fmolssq2kaDso*UdPBmH4jSSeWjkG2ZQocGjSSsNdbNV3dopxfMInUz!xI2fEfu3IZWuLQSENKRyy3YYRQZJf6SqdonRoPNwgy1avbtqJHHcdTH5zMrFUwDkT7UD2ZdVy1cKpeEWKEaCpkTI3xmdPi8bVGCow$$'
  )
  const [maxTabsNum] = useState(2)
  const [currentIndexNum, setCurrentIndexNum] = useState(0)
  const [runningTasks, setRuningTasks] = useState<any[]>([])

  const start = async () => {
    setCurrentIndexNum(0)
    setRuningTasks([])

    // Split emails into array and remove empty lines
    const emailList = emails.split('\n').filter(email => email.trim());

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
          browser.tabs.sendMessage(tab.id!, {
            type: 'SET_EMAILS',
            data: email
          })
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
