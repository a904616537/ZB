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
		console.log(' template(email, password)',  template(email, password))
		const mailOptions = {
			from    : 'MYbarre<info@mybarrefitness.com>', // 发送者
			to      : email, // 接受者,可以同时发送多个,以逗号隔开
			subject : 'MYbarre', // 标题
			text    : 'Registration through audit', // 文本
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

const template = (email, password) => `<h2>LOG IN ID AND PASSWORD</h2>
<p>Congratulations you are now officially a MYbarre Instructor in Training.</p>

<p>Here is your log in and ID</p>
<p>`+email+`</p>
<p>`+password+`</p>

<p>Once you have logged in on the website using Xx icon or click this link xxxxxxxxxx you can amend your password so you remember it.</p>

<p>This MYbarre Instructor Login will be your platform to receive information and video downloads pre and post course.</p>

<p>Our 3 day comprehensive Instructor Training, you will learn how to inspire, motivate, and lead others safely and effectively through the MYbarre program. It is an open learning environment delivered in person by our MYbarre Master Trainers. Delivered through a mix of practical master classes, theory workshops, small group exercises, class teaching and practice presentations.</p>

<p>You must spend time before the training weekend watching and learning these. You will be asked to present the warm up (along with other things you will learn) on the training.</p>
<p>Basic Moves of MYbarre</p>
<p>5 minute MYbarre warm up</p>
<p>If you cannot download or view them please notify us as soon as possible.</p>

<p>We will email you with more specific information about the weekend shortly, in the mean time please drop us an email with any questions.  We look forward to meeting you soon.</p>

<p>Kind regards,</p>



<p>MYbarre Master Training Team</p>`

 module.exports = help