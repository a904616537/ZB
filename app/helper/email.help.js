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
			subject : 'MYbarre Registration is Complete!', // 标题
			text    : 'Welcome to MYbarre!', // 文本
			html    : template(email, password)
		}
		console.log('邮件发送开始 ----')
		transporter.sendMail(mailOptions, (err, info) => {
			console.log('info', info);
			if (err) {
				console.error('err', err)
				callback(err)
				return;
			} else callback()
			console.log('发送成功', info.response);
		})
	}
}

const template = (email, password) => { return '<p>Welcome to MYbarre, your account has been officially approved!</p>'+
'<p>Please  login using the following password: ' + password + '</p>' + 
"You'll have access to everything you need to get started. We look forward to seeing you soon!";
}

 module.exports = help