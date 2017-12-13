/*
 * Author: Kain·Altion <kain@foowala.com>
 */

'use strict';

const config = require('../../setting/config'),
mongoose     = require('mongoose'),
moment       = require('moment'),
user_mongo   = mongoose.model('user'),
encryption   = require('../helper/encryption'),
email_help   = require('../helper/email.help'),
dateTime     = require('../helper/dateTime');


module.exports = {
	getUserById(user_id, callback) {
		user_mongo.findOne({_id : user_id})
		.select({
			password : 0,
			key      : 0
		})
		.exec((err, user) => callback(user))
	},
	// 获取用户
	getUser(page = 1, size = 1, sort = 'subscribe_time|asc', callback) {
		user_mongo.count({})
		.exec((err, count) => {
			let start = (page - 1) * size;
			let query = user_mongo.find({})
			query.limit(size)
			query.skip(start)
			query.populate({
				path     : 'videos',
				model    : 'video'
			})
			if(sort && sort != '') {
				sort = sort.split("|")
				if(sort[1] == 'asc') sort = sort[0]
				else sort = '-' + sort[0]
				query.sort(sort)
			}
			query.exec((err, users) => {
				return callback(users, count)
			})
		})
	},
	
	Update(user) {
		return new Promise((resolve, reject) => {
			if(user) {
				user.save(err => {
					if(err) return reject(err)
					resolve(user);
				})
			}
		})
	},

	UpdateDetails(user) {
		return new Promise((resolve, reject) => {
			user_mongo.findById(user._id, (err, doc) => {
				if (err) return reject(err);
				// 如果修改的是phone或者email，需要先验证
				if(user.key == 'email') {
					user_mongo.findOne({email : user.value}, (err, u) => {
						if(u) return reject('The email has been registered!')
					})
				} else if(user.key == 'phone') {
					user_mongo.findOne({email : user.value}, (err, u) => {
						if(u) return reject('The phone has been registered!')
					})
				}
				doc[user.key] = user.value;
				doc.save(err => {
					if(err) {
						console.log('error', doc);
						return reject(err)
					}
					resolve(doc);
				})
			})
		})
	},

	UpdatePwd(_id, pwd, newpwd) {
		return new Promise((resolve, reject) => {
			user_mongo.findOne({_id})
			.exec((err, user) => {
				if(user) {
					// 验证密码
					encryption.decipher(user.password, user.key, modelpwd => {
						console.log('modelpwd == pwd', modelpwd , pwd)
						if(modelpwd == pwd) {
							// 验证成功，更新密码
							encryption.cipher(newpwd, (user_pwd, key) => {
								user.password = user_pwd;
								user.key = key;
								user.save(err => {
									if(err) reject('Password update failed!');
									else resolve();
								})
							});
							
						} else reject('The original password is incorrect!');
					})
				} else reject("Users don't exist!")
			})
		})
	},
	UpdatePayment(_id, is_payment) {
		return new Promise((resolve, reject) => {
			user_mongo.findOne({_id})
			.exec((err, user) => {
				if(user) {
					user.is_payment = is_payment;
					user.save(err => {
						if(err) reject(err)
						else resolve();
					})
				} else reject("Users don't exist!")
			})
		})
	},

	SelectById(_id) {
		return new Promise((resolve, reject) => {
			user_mongo.findOne({_id})
			.select({
				password : 0,
				key      : 0
			})
			.exec((err, doc) => {
				if (err) return reject(err);
				resolve(doc);
			})
        })
	},
	SelectUser(query) {
		return new Promise((resolve, reject) => {
			console.log([query.key])
			user_mongo.findByUser([query.key], (err, user) => {
				if (err) return reject(err);
				if(user) {
					// 解密
					encryption.decipher(user.password, user.key, pwd => {
						if(pwd == query.password) return resolve(user)
						return reject();
					})
				} else return reject();
			})
        })
	},
	setUserVideo(user_id, video_id) {
		return new Promise((resolve, reject) => {
			user_mongo.findOne({_id : user_id})
			.exec((err, user) => {
				if (err) return reject(err);
				const video = user.videos.find(v => v.toString() == video_id.toString());
				if(video) {
					console.log(moment(), '下载视频，已经下载', video_id, user_id)
					resolve();
				}
				else {
					console.log(moment(), '下载视频记录', video_id, user_id)
					user.videos.push(video_id);
					user.save(err => resolve())
				}
			})
        })
	},
	// 账户注册
	Register(user) {
		return new Promise((resolve, reject) => {
			user_mongo.findByUser([user.phone, user.email], (err, doc) => {
				if(doc) return reject();
				let experiences = [];

				for (var i = 0; i < 3; i++) {
					experiences.push({
						discipline : user.discipline?(user.discipline.length > i?user.discipline[i]: ""): "",
						level      : user.level?(user.level.length > i?user.level[i]: "") : "",
						years      : user.years?(user.years.length > i?user.years[i]: "") : ""
					})
				}
				user.experience = experiences;
				delete user.discipline;
				delete user.level;
				delete user.years;

				user_mongo.create(user, err => {
					if(err) return reject(err);
					else return resolve();
				})
			})
		})
	},
	// 审核并发送邮件
	Audit(_id, audit) {
		return new Promise((resolve, reject) => {
			user_mongo.findOne({_id})
			.exec((err, user) => {
				if(audit) {
					let password = '';
					for (var i = 0; i < 8; i++) {
						password += Math.floor(Math.random() * 10);
					}
					encryption.cipher(password, (pwd, key) => {
						user.password = pwd;
						user.key = key;
						user.audit = true;
						user.save(err => {
							if(err) return reject(err);
							console.log('执行邮件发送')
							console.log('user', user)
							email_help.send(user, user.email, password, err => {
								console.error(err);
							})
							resolve();
						})
					})
				} else {
					user.msgNum += 1;
					user.audit = false;
					user.save(err => {
						if(err) return reject(err);
						else return resolve();
					})
				}
			})
		})
	},
}

	
