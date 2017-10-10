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
	send : (user, email, password, callback) => {
		const mailOptions = {
			from    : 'MYbarre<info@mybarrefitness.com>', // 发送者
			to      : email, // 接受者,可以同时发送多个,以逗号隔开
			subject : 'MYbarre Registration is Complete!', // 标题
			text    : 'Welcome to MYbarre!', // 文本
			html    : template(user, email, password)
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

const template = (user, email, password) => { return '<p>Dear ' + user.first_name + '</p>'
+ '<p>Congratulations, you have made the 1st step to becoming a MYbarre Instructor.  You have been accepted into the following training course:</p>'
+ '<p>Dates: Friday 27th, Saturday 28th, Sunday 29th October 2017</p>'
+ '<p>Venue: Z&B Fitness, Golden Eagle Mall, 278 Shaanxi Road, 6th Floor, Shanghai. </p>'
+ '<p>With our 3 day comprehensive Instructor Training, you will learn how to inspire, motivate, and lead others safely and effectively through the MYbarre program. It is an open learning environment delivered in person by our MYbarre Master Trainers. Delivered through a mix of practical master classes, theory workshops, small group exercises, class teaching and practice presentations.</p>'
+ '<p>You will now have access to 2 videos on the MYbarre website.  You must spend time before the training weekend watching and learning these. You will be asked to present the warm up (along with other things you will learn) on the training.</p>'
+ '<p>Basic Moves of MYbarre</p>'
+ '<p>5 minute MYbarre warm up</p>'
+ '<p>Please revisit our website and login using the following password: ' + password + '</p>'
+ '<p>We will email you with more specific information about the weekend shortly, in the mean time please drop us an email with any questions.  We look forward to meeting you soon.</p>'
+ '<p>Kind regards,</p>'
+ '<p>MYbarre Master Training Team</p>';
}

 module.exports = help