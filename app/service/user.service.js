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
							email_help.send(user.email, password, err => {
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

	
