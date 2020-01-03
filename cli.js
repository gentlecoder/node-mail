#!/usr/bin/env node
const meow = require("meow");
const prompts = require("prompts");
const nanoid = require("nanoid");
const makeDir = require("make-dir");
// const shell = require("shelljs")
const exec = require("child_process").exec;

exec("rm -rf configs", function(err, stdout, srderr) {
	if (err) {
		console.log(srderr);
	} else {
		console.log(stdout);
	}
});

// Meow configuration
const cli = meow(
	`
	Usage
	  $ mail <options>
	Options
	  --config, -cfg   		Config node mail
	Examples
	  $ mail --config
`,
	{
		flags: {
			config: {
				type: "boolean",
				alias: "c"
			}
		}
	}
);

if (cli.flags.config) {
	(async () => {
		const configs = [
			{
				type: "date",
				name: "startDay",
				message: "Choose a day that is memorable:",
				initial: new Date(),
				mask: "YYYY/MM/DD",
				validate: date => (date > Date.now() ? "Not in the future" : true)
			},
			{
				type: "select",
				name: "oneUrl",
				message: "Select article source url:",
				choices: [{ title: "OneUrl", value: "http://wufazhuce.com/" }],
				initial: 0
			},
			{
				type: "select",
				name: "weatherUrl",
				message: "Select weather info source url:",
				choices: [
					{
						title: "Mo Ji Tian Qi",
						value: "https://tianqi.moji.com/weather/china/jiangsu/"
					}
				],
				initial: 0
			},
			{
				type: "text",
				name: "weatherCity",
				message: "Which citys weather information do you need?",
				initial: "nanjing"
			},
			{
				type: "select",
				name: "sayLoveUrl",
				message: "Select say love interface url.",
				choices: [
					{
						title: "Tian xin Api",
						value: "http://api.tianapi.com/txapi/saylove"
					}
				],
				initial: 0
			},
			{
				type: "password",
				name: "sayLoveKey",
				message: "Tian xin api secret key."
			},
			{
				type: "text",
				name: "emailSubject",
				message: "Email subject.",
				initial: "小豚の精からの挨拶"
			},
			{
				type: "number",
				name: "emailHour",
				message: "When do you want to send the email? (hour)",
				initial: 8
			},
			{
				type: "number",
				name: "emailMinute",
				message: "When do you want to send the email? (minute)",
				initial: 30
			},
			{
				type: "text",
				name: "name",
				message: "Email sender name.",
				initial: "小猪精"
			},
			{
				type: "text",
				name: "user",
				message: "Sender email address.",
				initial: "610249080@qq.com",
				validate: address =>
					/^([A-Za-z0-9_\-\.\u4e00-\u9fa5])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/.test(
						address
					)
						? true
						: "Please input correct email address"
			},
			{
				type: "password",
				name: "pass",
				message: "Sender email SMTP password.",
				validate: password => (!password ? "Please input password" : true)
			},
			{
				type: "text",
				name: "receiverAddress",
				message: "Receiver email address.",
				initial: "779896265@qq.com",
				validate: address =>
					/^([A-Za-z0-9_\-\.\u4e00-\u9fa5])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/.test(
						address
					)
						? true
						: "Please input correct email address"
			},
			{
				type: "toggle",
				name: "sendImmediately",
				message: "Send Immediately?",
				initial: true,
				active: "yes",
				inactive: "no"
			}
		];

		const response = await prompts(configs);
		let fileName = "";

		await makeDir("./configs").then(async path => {
			const low = require("lowdb");
			const FileSync = require("lowdb/adapters/FileSync");
			fileName = `${path}/${nanoid(10)}.json`;
			const adapter = await new FileSync(fileName);
			const db = low(adapter);

			db.defaults({
				startDay: new Date(response.startDay).toLocaleDateString(), // 纪念日时间
				oneUrl: response.oneUrl, // one的地址
				weatherUrl: response.weatherUrl, // weather的地址
				weatherCity: response.weatherCity, // 天气城市
				sayLoveUrl: response.sayLoveUrl, // 天行url
				sayLoveKey: response.sayLoveKey, // 天行API
				emailSubject: response.emailSubject, // 邮件标题
				emailHour: response.emailHour, // 邮件定时任务小时
				emailMinute: response.emailMinute, // 邮件定时任务分钟
				senderInfo: {
					name: response.name, // 邮件发送者名称
					emailAuth: {
						user: response.user, // 邮件发送者地址
						pass: response.pass // 邮件SMTP授权码
					}
				},
				receiverAddress: response.receiverAddress, // 邮件接收者邮箱地址
				sendImmediately: response.sendImmediately // 是否立即发送
			}).write();
		});
		exec("node main " + fileName, function(err, stdout, srderr) {
			if (err) {
				console.log(srderr);
			} else {
				console.log(stdout);
			}
		});
	})();
} else {
	exec("node cli --help", function(err, stdout, stderr) {
		if (err) throw err;
		console.log(stdout);
	});
}

process.on("unhandledRejection", () => {
	debugger;
});
