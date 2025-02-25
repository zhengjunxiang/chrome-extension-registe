import log from 'loglevel';
// import fs from 'fs';
import { format } from 'date-fns';

// 1. 设置日志级别
log.setLevel('info');

// 2. 自定义日志格式（添加时间戳和级别大写）
const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  return (...args) => {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const message = args.map(arg =>
      typeof arg === 'string' ? arg : JSON.stringify(arg)
    ).join(' ');

    // 控制台输出（保留原始颜色）
    rawMethod(`[${timestamp}] [${methodName.toUpperCase()}]: ${message}`);

    // 文件输出（无颜色代码）
    // writeToFile(`[${timestamp}] [${methodName.toUpperCase()}]: ${message}`);
  };
};

// 3. 重新注册日志方法
log.rebuild();

// 4. 文件写入功能
// function writeToFile(message) {
//   const today = format(new Date(), 'yyyy-MM-dd');
//   const logDir = 'logs';
//   const logFile = `${logDir}/${today}.log`;

//   // 创建日志目录
//   if (!fs.existsSync(logDir)) {
//     fs.mkdirSync(logDir, { recursive: true });
//   }

//   // 追加日志内容
//   fs.appendFileSync(logFile, message + '\n', 'utf8');
// }

// 导出日志记录器
export default log;