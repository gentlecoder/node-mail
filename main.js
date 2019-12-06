const superagent = require("superagent"); //发送网络请求获取DOM
const cheerio = require("cheerio"); //能够像Jquery一样方便获取DOM节点
const nodemailer = require("nodemailer"); //发送邮件的node插件
const ejs = require("ejs"); //ejs模版引擎
const fs = require("fs"); //文件读写
const path = require("path"); //路径配置
const schedule = require("node-schedule"); //定时器任务库
//配置项
const {
  startDay,
  oneUrl,
  weatherUrl,
  sayLoveUrl,
  sayLoveKey,
  emailSubject,
  emailHour,
  emailMinute,
  senderInfo,
  receiverAddress
} = require("./config");

// 获取ONE内容
function getOneData() {
  let p = new Promise(function(resolve, reject) {
    superagent.get(oneUrl).end(function(err, res) {
      if (err) {
        reject(err);
      }
      let $ = cheerio.load(res.text);
      let selectItem = $("#carousel-one .carousel-inner .item");
      let todayOne = selectItem[0];
      let todayOneData = {
        imgUrl: $(todayOne)
          .find(".fp-one-imagen")
          .attr("src"),
        type: $(todayOne)
          .find(".fp-one-imagen-footer")
          .text()
          .replace(/(^\s*)|(\s*$)/g, ""),
        text: $(todayOne)
          .find(".fp-one-cita")
          .text()
          .replace(/(^\s*)|(\s*$)/g, "")
      };
      resolve(todayOneData);
    });
  });
  return p;
}

// 获取天气提醒
function getWeatherTips() {
  let p = new Promise(function(resolve, reject) {
    superagent.get(weatherUrl).end(function(err, res) {
      if (err) {
        reject(err);
      }
      let threeDaysData = [];
      let weatherTip = "";
      let $ = cheerio.load(res.text);
      $(".wea_tips").each(function(i, elem) {
        weatherTip = $(elem)
          .find("em")
          .text();
      });
      resolve(weatherTip);
    });
  });
  return p;
}

// 获取天气预报
function getWeatherData() {
  let p = new Promise(function(resolve, reject) {
    superagent.get(weatherUrl).end(function(err, res) {
      if (err) {
        reject(err);
      }
      let threeDaysData = [];
      let weatherTip = "";
      let $ = cheerio.load(res.text);
      $(".forecast .days").each(function(i, elem) {
        const SingleDay = $(elem).find("li");
        threeDaysData.push({
          Day: $(SingleDay[0])
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          WeatherImgUrl: $(SingleDay[1])
            .find("img")
            .attr("src"),
          WeatherText: $(SingleDay[1])
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          Temperature: $(SingleDay[2])
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          WindDirection: $(SingleDay[3])
            .find("em")
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          WindLevel: $(SingleDay[3])
            .find("b")
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          Pollution: $(SingleDay[4])
            .text()
            .replace(/(^\s*)|(\s*$)/g, ""),
          PollutionLevel: $(SingleDay[4])
            .find("strong")
            .attr("class")
        });
      });
      resolve(threeDaysData);
    });
  });
  return p;
}

function getLoveWord() {
  let p = new Promise(function(resolve, reject) {
    superagent.get(sayLoveUrl + "?key=" + sayLoveKey).end(function(err, res) {
      if (err) {
        reject(err);
      }
      let content = JSON.parse(res.text);
      if (content.code === 200) {
        let sweet = content.newslist[0].content;
        let str = sweet.replace("\r\n", "<br>");
        resolve(str);
      } else {
        console.log("获取接口失败", content.msg);
      }
    });
  });
  return p;
}

// 发送邮件
function sendMail(HtmlData) {
  const template = ejs.compile(
    fs.readFileSync(path.resolve(__dirname, "email.ejs"), "utf8")
  );
  const html = template(HtmlData);

  let transporter = nodemailer.createTransport({
    service: senderInfo.emailAuth.user.split("@")[1].split(".")[0],
    port: 465,
    secureConnection: true,
    auth: senderInfo.emailAuth
  });

  let mailOptions = {
    from: `"${senderInfo.name}" ${senderInfo.emailAuth.user}`,
    to: receiverAddress,
    subject: emailSubject,
    html: html
  };

  transporter.sendMail(mailOptions, (error, info = {}) => {
    if (error) {
      console.log(error);
      sendMail(HtmlData); //再次发送
    }
    console.log("邮件发送成功", info.messageId);
    console.log("静等下一次发送");
  });
}

// 聚合
function getAllDataAndSendMail() {
  let HtmlData = {};
  // how long with
  let today = new Date();
  console.log(today);
  let initDay = new Date(startDay);
  let lastDay = Math.floor((today - initDay) / 1000 / 60 / 60 / 24);
  let todaystr =
    today.getFullYear() +
    " / " +
    (today.getMonth() + 1) +
    " / " +
    today.getDate();
  HtmlData["lastDay"] = lastDay;
  HtmlData["todaystr"] = todaystr;

  Promise.all([getOneData(), getWeatherTips(), getWeatherData(), getLoveWord()])
    .then(function(data) {
      HtmlData["todayOneData"] = data[0];
      HtmlData["weatherTip"] = data[1];
      HtmlData["threeDaysData"] = data[2];
      HtmlData["sayLove"] = data[3];
      sendMail(HtmlData);
    })
    .catch(function(err) {
      getAllDataAndSendMail(); //再次获取
      console.log("获取数据失败： ", err);
    });
}

let rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 6)];
rule.hour = emailHour;
rule.minute = emailMinute;
console.log("NodeMail: 开始等待目标时刻...");
let j = schedule.scheduleJob(rule, function() {
  console.log("执行任务");
  getAllDataAndSendMail();
});
