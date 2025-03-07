import { delay } from "../utils";
import { handleUnlockStage } from '@/modules/ailbaba/ug';

export default defineUnlistedScript(async () => {
  // 判断当前是否在 iframe 内
  if (window.self !== window.top) {
    console.log("当前在 iframe 内执行内容脚本");
    window.addEventListener("load", async (event) => {
      await delay(2000);
      handleUnlockStage();
    });
  } else {
    console.log("当前脚本在主页面执行");
  }
});
