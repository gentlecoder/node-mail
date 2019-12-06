module.exports = {
  startDay: "2019/10/02", // 纪念日时间
  oneUrl: "http://wufazhuce.com/", // one的地址
  weatherUrl: "https://tianqi.moji.com/weather/china/jiangsu/nanjing", // weather的地址 后缀根据城市来改
  sayLoveUrl: "http://api.tianapi.com/txapi/saylove", // 天行url
  sayLoveKey: "dc84************9bb2c4", // 天行API https://www.tianapi.com/console/ 去申请
  weatherLocal: "jiangsu/nanjing", // 天气地址
  emailSubject: "小豚の精からの挨拶", // 邮件标题
  emailHour: 8, // 邮件定时任务小时
  emailMinute: 30, // 邮件定时任务分钟
  senderInfo: {
    name: "小猪精", // 邮件发送者名称
    emailAuth: {
      user: "xxx@qq.com", // 邮件发送者地址
      pass: "xxxxxx" // 邮件SMTP授权码
    }
  },
  receiverAddress: 'xxxxx@qq.com"' // 邮件接收者邮箱地址
};
