# adt-checkin
# 基于 Autox.js 的钉钉自动化打卡脚本

## 特性

1. 自动判断上下班时间及打卡班次
2. 根据上下班时间提前及延后随机时间
3. 自动点亮屏幕
4. 打卡结果微信通知
5. 跳过节假日
6. ......

## 用法

环境见 https://github.com/kkevsekk1/AutoX
在 `config.json` 中修改参数，参数解释如下：

```json
{

  "txApiKey": "", #天行API接口，自己申请，用于查节假日，如果不传则默认每天都是工作日
  "pushoverApiKey": "" #pushOver，用于推送打卡结果，不填则不推
}
{
  "sbHour": 9, #上班时间的小时
  "sbMinute": 0, #上班时间的分钟
  "sbSecond": 0, #上班时间的秒数
  "sbEarly": 1200, #提前上班打卡的时间，秒
  "xbHour": 18, #下班时间的小时
  "xbMinute": 0, #下班时间的分钟
  "xbSecond": 0, #下班时间的秒数
  "xbDelay": 1800, #延后下班打卡的时间，秒
  "workTitle": "工作台", #钉钉主界面中间按钮的文字，一般为“工作台”
  "randomMin": -9, #在设定时间上的随机偏移时差最小值
  "randomMax": 9, #在设定时间上的随机偏移时差最大值
  "account": "", # 手机号
  "dingPassword": "above required", # 密码
  "txApiKey": "", # 见"http://wxpusher.zjiecode.com"
  "wxpusherUids": [""],
  "wxpusherToken": "",
  "pushoverApiKey": "" # 另一个推送
}
```

手机不要有密码
