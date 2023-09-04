// 1
let pjPath = "."
//读取配置文件
let file = files.read(pjPath + "/config.json");
let config = JSON.parse(file);

let sbHour = config.sbHour;
let sbMinute = config.sbMinute;
let sbSecond = config.sbSecond;
let xbHour = config.xbHour;
let xbMinute = config.xbMinute;
let xbSecond = config.xbSecond;
let menu = config.workTitle;
let sbEarly = config.sbEarly;
let xbDelay = config.xbDelay;
let txApiKey = config.txApiKey;
let pushoverApiKey = config.pushoverApiKey;
const ACCOUNT = config.account
const PASSWORD = config.dingPassword;
const wxpusherUids = config.wxpusherUids;
const wxpusherToken = config.wxpusherToken;
minNum = config.randomMin;
maxNum = config.randomMax;

const now = new Date();

const PACKAGE_ID_DD = "com.alibaba.android.rimet"           // 钉钉
const AUTOJS = "org.autojs.autoxjs.v6" // AutoJs
const CORP_ID = "ding3907becf13b2ca9c35c2f4657eb6378f" // 只加入一家公司,可以不填

// 1上班 2下班 0不打
let bc = 0;
let logMessage = ""
let $$init = {
  start() {
    return wakeUp();

    function fullChain() {
      openDingtalk();
      openDingtalk();
      attendKaoqin();
      signIn();
    }

    function setLocation() {
      let appName = "模拟定位助手"
      toastLog("启动" + appName);
      if (!app.launchApp(appName)) {
        logMessage += "没有找到可以打开的" + appName;
        return
      }

      const start = id("recycle_start");
      if (start.exists()) {
        start.click()
      } else {
        const startNew = id("recycle_start");
        const stop = id("recycle_stop")
        stop.click()
        startNew.waitFor()
        startNew.click()
      }

      while (id("tips_current_run_location").findOne().text() == "无") {
        sleep(100)
      }
    }

    function wakeUp() {
      while (!device.isScreenOn()) {
        toastLog("努力点亮手机");
        auto.waitFor();

        device.wakeUpIfNeeded();

        sleep(1000);
        swipe(400, 1600, 400, 1000, 300);
      }

      //注册退出事件
      events.on("exit", function () {
        console.log("退出了");
        home();
      });

      detectTimer();
      postMessage(logMessage);
    }

    function detectTimer() {
      let nextTime;
      const sbTime = generateDateByValue(now, sbHour, sbMinute, sbSecond);
      const xbTime = generateDateByValue(now, xbHour, xbMinute, xbSecond);
      try {

        const currentTime = new Date();
        console.log("当前时间: " + formatDateTime(currentTime))
        console.log("上班时间: " + formatDateTime(sbTime))
        console.log("下班时间: " + formatDateTime(xbTime))

        if (currentTime < sbTime) {
          bc = 1;
          console.log("上班:");

          fullChain();

          nextTime = generateDateByValue(currentTime, xbHour, xbMinute + randomNum(), xbSecond + xbDelay);
        } else if (currentTime < xbTime) {
          bc = 0;
          console.log("工作中:" + formatDateTime(currentTime))
          nextTime = generateDateByValue(currentTime, xbHour, xbMinute + randomNum(), xbSecond + xbDelay);
        } else if (currentTime > xbTime) {
          bc = 2;
          console.log("下班");

          fullChain();
          nextTime = generateDateByValue(getAvailableDate(currentTime), sbHour, sbMinute + randomNum(), sbSecond - sbEarly);
        }
      } catch (e) {
        console.error(e);
      } finally {
        let timer = require(pjPath + "/modules/ext-timers.js")(runtime, this);
        let task = timer.addDisposableTask({
          path: "main.js",
          date: nextTime,
        });

        logMessage += "下次打卡定时：" + formatDateTime(nextTime)
        shutdownDingtalk()
      }
    }

    function randomNum() {
      return random(minNum, maxNum);
    }

    function getAvailableDate(cTime) {
      const d = new Date(cTime);
      d.setDate(cTime.getDate() + 1);
      if (isHoliday(d)) {
        console.log("下一天是节假日:" + dateFormat("Y/mm/dd", d));
        return getAvailableDate(d);
      }

      console.log("下一天是:" + dateFormat("Y/mm/dd", d));
      return d;
    }

    function frontAutojs() {
      log("开始查找autoJs后台")
      return findAppSwitchFront(AUTOJS);
    }

    function findAppSwitchFront(appUrl) {
      let manager = context.getSystemService(context.ACTIVITY_SERVICE);
      let recentTasks = manager.getRunningTasks(java.lang.Integer.MAX_VALUE);
      let i = recentTasks.size();

      while (i > 0 &&
        recentTasks.get(--i).baseActivity.toShortString().indexOf(appUrl) > -1) {
        log("找到程序");
        //todo: 这个函数现在出现问题
        manager.moveTaskToFront(recentTasks.get(i).id, android.app.ActivityManager.MOVE_TASK_WITH_HOME);
        console.log("切换到前台")
        return true;
      }
      log("没有找到程序(可以已前台)");
      return false;
    }

    function openDingtalk() {

      frontAutojs()
      // setVolume(0) // 设备静音

      console.log("准备启动" + app.getAppName(PACKAGE_ID_DD))
      while (!app.launchPackage(PACKAGE_ID_DD)) {
        console.log("正在启动" + app.getAppName(PACKAGE_ID_DD) + "...")
        sleep(5000)
        wakeUp()
      }

      while (!textContains("协作").findOne(1000) && !text("欢迎使用钉钉").findOne(1000)) {
        console.log("启动中" + app.getAppName(PACKAGE_ID_DD) + "...")
      }

      // DINGDING_ACTIVITIVE = "com.alibaba.android.user.login.SignUpWithPwdActivity"
      // if (currentPackage() == PACKAGE_ID_DD && currentActivity() == DINGDING_ACTIVITIVE) {
      if (currentPackage() == PACKAGE_ID_DD && text("欢迎使用钉钉").findOne(1000)) {
        console.info("账号未登录")

        if (id("et_pwd_login").findOne(2000)) {
          var account = id("et_phone_input").findOne()
          account.setText(ACCOUNT)
          console.log("输入账号")

          var password = id("et_pwd_login").findOne()
          password.setText(PASSWORD)
          console.log("输入密码")

          var privacy = id("cb_privacy").findOne()
          privacy.click()
          console.log("同意隐私协议")

          var btn_login = id("btn_next").findOne()
          btn_login.click()
        }else {
          var account = id("et_phone").findOne()
          account.setText(ACCOUNT)
          console.log("输入账号")
  
          var next = id("btn_next").findOne()
          next.click()
          console.log("下一步")
  
          var privacy = id("cb_privacy").findOne()
          privacy.click()
          console.log("同意隐私协议")
            
          var next = id("btn_next").findOne()
          next.click()
          console.log("继续")
  
          var password = id("et_password").findOne()
          password.setText(PASSWORD)
          console.log("输入密码")
  
          var btn_login = id("btn_next").findOne()
          btn_login.click()         
        }

        console.log("正在登陆...")

        text("协作").findOne(3000)
      }

      if (currentPackage() == PACKAGE_ID_DD) {
        console.info("账号已登录")
        text("协作").findOne(1000)
      }
      
      console.log("已启动" + app.getAppName(PACKAGE_ID_DD))
    }

    /**
 * @description 使用 URL Scheme 进入考勤界面
 */
    function attendKaoqin() {

      var url_scheme = "dingtalk://dingtalkclient/page/link?url=https://attend.dingtalk.com/attend/index.html"

      if (CORP_ID != "") {
        url_scheme = url_scheme + "?corpId=" + CORP_ID
      }

      var a = app.intent({
        action: "VIEW",
        data: url_scheme,
        //flags: [Intent.FLAG_ACTIVITY_NEW_TASK]
      });
      app.startActivity(a);
      console.log("正在进入attendKaoqin勤界面...")


      if (!textContains("申请").findOne(10000)) {
        console.log("未找到申请页面")
        // // get wakeup lock
        // var pm = context.getSystemService(context.POWER_SERVICE);
        // var wakeLock = pm.newWakeLock(PowerManager.SCREEN_DIM_WAKE_LOCK, "Auto.js");
        // wakeLock.acquire();

        // console.log("正在唤醒屏幕...")
        // // unlock
        // if (wakeLock.isHeld()) {
        //   wakeLock.release();
        // }
      }
      
      console.info("attendKaoqin")
    }

    //点击打卡
    function signIn() {
      if (bc === 0) {
        logMessage += "未检测到能打的班次，取消打卡";
        return;
      }

      textContains("上班").waitFor();
      if (text("外勤打卡").exists() || text("迟到打卡").exists()) {
        logMessage += "当前处于外勤打卡或迟到打卡状态，请自己处理。"
        return;
      }

      if (bc === 2 && text("更新打卡").exists()) {
        logMessage += "打卡";
      } else if (bc == 1 && textContains("已打卡").exists()) {
        logMessage += "已打卡";
        return;
      }

      let iconType = "";
      if (bc == 1) {
        iconType = "上班打卡";
      } else if (bc == 2) {
        iconType = "下班打卡";
      } else {
        logMessage += "无需打卡";
        return;
      }

      toastLog("当前类型是" + bc + ",点击按钮" + iconType);
      dcard = text(iconType).findOne(10000);
      if (!dcard) {
        logMessage += "没有找到打卡相关按钮";
        return;
      }

      if (dcard.click()) {
        logMessage += true;
      } else {
        logMessage += false;
      }

    }

    function postMessage(result, title) {
      let messge;

      if (typeof result === "boolean") {
        if (result) {
          //打卡成功，推送
          message = "检测到打卡成功消息，打卡成功";
        } else {
          message = "未检测到打卡成功消息或打卡失败";
        }
      } else {
        message = result;
      }

      if (!title) {
        title = "打卡结果";
      }

      toastLog(message);
      pushOverService(title);
      pushMessageWeixin(message)

    }

    function pushOverService(title) {
      if (pushoverApiKey) {
        http.post("https://api.pushover.net/1/messages.json", {
          token: "ahwjzcaceimvz21qrexihcs9qn2dz7",
          user: pushoverApiKey,
          title: title,
          message: message,
        });
      }
    }

    function isHoliday(d) {
      //返回今天是不是节假日 
      const dater = dateFormat("Y-mm-dd", d)
      console.log("检查节假日:" + dater)
      if (!txApiKey) {
        return false;
      }


      url = "http://api.tianapi.com/txapi/jiejiari/index?key=" +
        txApiKey +
        "&date=" +
        dater;
      let res = http.get(url, {});

      const result = res.body.json();
      if (result["code"] !== 200) {
        console.log("请求失败");
        return false;
      }

      let data = result["newslist"][0];
      return !!data["isnotwork"];
    }


    // ===================== ↓↓↓ 功能函数 ↓↓↓ =======================

    function dateDigitToString(num) {
      return num < 10 ? '0' + num : num
    }

    function getCurrentTime() {
      var currentDate = new Date()
      var hours = dateDigitToString(currentDate.getHours())
      var minute = dateDigitToString(currentDate.getMinutes())
      var second = dateDigitToString(currentDate.getSeconds())
      var formattedTimeString = hours + ':' + minute + ':' + second
      return formattedTimeString
    }

    function getCurrentDate() {
      var currentDate = new Date()
      var year = dateDigitToString(currentDate.getFullYear())
      var month = dateDigitToString(currentDate.getMonth() + 1)
      var date = dateDigitToString(currentDate.getDate())
      var week = currentDate.getDay()
      var formattedDateString = year + '-' + month + '-' + date + '-' + WEEK_DAY[week]
      return formattedDateString
    }

    // 通知过滤器
    function filterNotification(bundleId, abstract, text) {
      var check = PACKAGE_ID_WHITE_LIST.some(function (item) { return bundleId == item })
      if (!NOTIFICATIONS_FILTER || check) {
        console.verbose(bundleId)
        console.verbose(abstract)
        console.verbose(text)
        console.verbose("---------------------------")
        return true
      }
      else {
        return false
      }
    }

    // 保存本地数据
    function setStorageData(name, key, value) {
      const storage = storages.create(name)  // 创建storage对象
      storage.put(key, value)
    }

    // 读取本地数据
    function getStorageData(name, key) {
      const storage = storages.create(name)
      if (storage.contains(key)) {
        return storage.get(key, "")
      }
      // 默认返回undefined
    }

    // 删除本地数据
    function delStorageData(name, key) {
      const storage = storages.create(name)
      if (storage.contains(key)) {
        storage.remove(key)
      }
    }

    // 获取应用版本号
    function getPackageVersion(bundleId) {
      importPackage(android.content)
      var pckMan = context.getPackageManager()
      var packageInfo = pckMan.getPackageInfo(bundleId, 0)
      return packageInfo.versionName
    }

    // 屏幕是否为锁定状态
    function isDeviceLocked() {
      importClass(android.app.KeyguardManager)
      importClass(android.content.Context)
      var km = context.getSystemService(Context.KEYGUARD_SERVICE)
      return km.isKeyguardLocked()
    }

    // 设置媒体和通知音量
    function setVolume(volume) {
      device.setMusicVolume(volume)
      device.setNotificationVolume(volume)
      console.verbose("媒体音量:" + device.getMusicVolume())
      console.verbose("通知音量:" + device.getNotificationVolume())
    }

    function pushMessageWeixin(message) {
      const url = "http://wxpusher.zjiecode.com/api/send/message"
      let res = http.postJson(url, {
        "appToken": wxpusherToken,
        "content": "Wxpusher",
        "summary": message,
        "contentType": 1,
        "topicIds": [],
        "uids": wxpusherUids,
        "url": "http://wxpusher.zjiecode.com"
      })

      if (res.statusCode == 200) {
        console.log("wxpusher 请求成功");
      } else {
        console.log("wxpusher 请求失败");
      }

      console.log(res.body.string());
    }

    function dateFormat(fmt, date) {
      if (!date) {
        console.trace('dateFormat')
        return
      }

      const opt = {
        "Y+": date.getFullYear().toString(), // 年
        "m+": (date.getMonth() + 1).toString(), // 月
        "d+": date.getDate().toString(), // 日
        "H+": date.getHours().toString(), // 时
        "M+": date.getMinutes().toString(), // 分
        "S+": date.getSeconds().toString(), // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
      };

      let ret;
      for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
          fmt = fmt.replace(
            ret[1],
            ret[1].length == 1 ? opt[k] : padStart(opt[k], ret[1].length, "0")
          );
        }
      }
      return fmt;
    }

    function padStart(string, targetLength, padString) {
      while (string.length < targetLength) {
        string = padString + string;
      }
      return string;
    }

    function formatDateTime(datetime) {
      return dateFormat("Y-mm-dd HH:MM:SS", datetime);
    }

    function generateDateByValue(date, hour, minute, second) {
      let d = new Date(date);
      d.setHours(hour);
      d.setMinutes(minute);
      d.setSeconds(second);
      return d;
    }

    function shutdownDingtalk() {
      const shutdown = "强行停止"
      const appName = "钉钉"
      let packageName = app.getPackageName(appName);
      app.openAppSetting(packageName);
      text(appName).waitFor();
      log(appName + "应用信息")
      let is_sure = textContains(shutdown).findOne(5000);

      if (is_sure.enabled()) {
        click(shutdown);
        const quit = textContains("确定").findOne(3000);
        if(quit.enabled()) {
          quit.click();
          log(app.getAppName(packageName) + "应用已被关闭");
        }
        return;
      } 
      
      log(app.getAppName(packageName) + "应用不能被正常关闭或不在后台运行");    
    }
  },

  bind() {
    return this;
  },
}.bind();

$$init.start();
