/*
 * Author: Kain·Altion <kain@foowala.com>
 * 邮件发送服务
 */

'use strict';

const config  = require('../../setting/config'),
nodemailer    = require('nodemailer'),
smtpTransport = require('nodemailer-smtp-transport'),
transporter = nodemailer.createTransport({
	service          : 'aliyun',
	host : 'smtp.mxhichina.com',
	port             : 465,
	secureConnection : true,
	auth             : {
        user: 'info@mybarrefitness.com',
        pass: 'Znbfitness2017'
    }
});

transporter.verify((error, success) => {
	if (error) {
		console.log(error);
	} else {
		console.log('Server is ready to take our messages');
	}
});

const help = {
	send : (email, password, callback) => {
		const mailOptions = {
			from    : 'MYbarre<info@mybarrefitness.com>', // 发送者
			to      : email, // 接受者,可以同时发送多个,以逗号隔开
			subject : 'MYbarre', // 标题
			text    : 'Registration through audit', // 文本
			html    : `<h2>Registration through audit</h2><h3>Your registration request has been passed and the login password is:<h1>${password}</h1></h3>`
		}
		console.log('邮件发送开始 ----')
		transporter.sendMail(mailOptions, (err, info) => {
			console.log('err', err)
			console.log('info', info);
			if (err) {
				callback(err)
				return;
			} else callback()
			console.log('发送成功', info.response);
		})
	}
}

 module.exports = help