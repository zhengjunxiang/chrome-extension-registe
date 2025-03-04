import {browser} from "wxt/browser";
import { useState } from 'react';
import './App.css';

function App() {
  const [emails, setEmails] = useState(
    // 'jewn2488506@outlook.com----ereodjns2167962----dbc8e03a-b00c-46bd-ae65-b683e7707cb0----M.C516_BAY.0.U.-CjDKC0!UPPLjmgG!ugxFXGoeUsFrrnd*wYZ5Wx2qW8y6K1h8vojGDOfw6ftwQjXsLAcNRIWu03J8d9cqgrs5*x8CEdG4u40N6y0YHu6LzgGpUzioO3E0jYxZBMi8DtpbUA6y!fIkfFOqAV3vwAcMgt18rdhuSDH3A11avC6tzByc6uSJ2mVi6n0uvhUKy8Xaafq4uu95B1FjWfZp5w0vFp2ovyYiFi8jMAIhb8YO1CtIXtyM4Bvbgj44gmcDvrGNQPYULM!A6pgmS1IijFNdt!bbeBSEbG48mWOTzsptHpaNMRGZS90JWY6b2VoGvzTvrgSN1v*23msIltwSOuTJsNcaUugvisA3rKs6NMo17n*WTGg!9WSls4wBZ4XnBc3q*A$$'
    // `kmhthrhjt822@outlook.com----ptw601583----dbc8e03a-b00c-46bd-ae65-b683e7707cb0----M.C545_SN1.0.U.-CjMrNwS*sW*zij3u1UexyAOIO*1!j80Ktel1zTlxuIF9A7815EZY0j0MN2qSRgOgH6lKHKgwzfdaH0GVrXX8RbrRIGllD1n*rni05qjZIsF4pz16hTb3ym9uwB3IYx83ff8!*LseuAl2De0FIKkwyeGT1zJ5e1a1heeSWtLrsZpbDsURbUEtHulHCJRrP2axQGRplDvgfKiG9IL0qL!2WW!LxpzkLM4NUuYHwo6wxg*QwvUiSA04o3aMKvuibIFdOy0RZfWvYkebEmSRmygzP8AjJ3QM!HNLJeda7VvMWBs11zQ61SQ6roHSRhFaPu67Bv8JzgjTY3HUR*wYRDFdYQFAfaT0Fj4GT50YQR5mL1zFlu909N2mwgmeLqAoP4OicA$$`
    `bjojx35@outlook.com----yue166062----dbc8e03a-b00c-46bd-ae65-b683e7707cb0----M.C546_SN1.0.U.-CizLIyxryn0nBtY6WNQoORTZaahKFISAJDU7FlWHgeVCbvgF1IvrdXQRDz2B5Oc9QZVPzXdG*5lmmV5AKTCKRYekBBf7cLsXuZJLgdBFJ*qEpVdJPXHl4QJJi1R2nj2kSXluH5*KYgYNwTYZP*WQpSsMUN5sNfsU4qET2ARdWtfIkqMOZ2etLIf!0GG!d459yh8HR5ISo2hnFQrVCq7gWjMdmnmyThUtpSfOWmWHG5HQAuGGoETMfOrWeNop1s8ajW7KCMICLah0gqpPZ9x4bUCdWkT9siB8stTZYTCDDVyGItOY1xW4ZcoML041IGGC12SUcssBbHQ1H0D979Ynkgz5ITlX7bjHKE*V3LReH7m7A9T5tGULXbdyK3o1x4IhFQ$$`
  )
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
          console.log('-- SET_EMAILS', email)
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
