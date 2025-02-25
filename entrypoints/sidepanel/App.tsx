import { useState } from 'react';
import './App.css';

function App() {
  const [tabNum, setTabNum] = useState('0');

  const start = async () => {
    const num = parseInt(tabNum);
    if (isNaN(num) || num <= 0) {
      alert('请输入有效的数字！');
      return;
    }

    // 打开指定数量的标签页
    for (let i = 0; i < num; i++) {
      chrome.tabs.create({
        url: 'https://www.alibaba.com',
        active: false // 在后台打开标签页
      });
    }
  }

  const onChangeTabNum = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTabNum(e.target.value);
  }

  return (
    <>
      <h1>WXT + React</h1>
      <div className="card">
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
