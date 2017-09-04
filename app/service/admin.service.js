/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description:  管理员数据服务
 */

'use strict';

const config = require('../../setting/config'),
mongoose     = require('mongoose'),
admin_mongo   = mongoose.model('admin'),
encryption   = require('../helper/encryption'),
dateTime     = require('../helper/dateTime');



module.exports = {
	// 获取管理员
	getAdmin(page = 1, size = 1, sort = 'createTime|asc', callback) {

		admin_mongo.count()
		.exec((err, count) => {
			let start = (page - 1) * size;
			let query = admin_mongo.find({}, {name: 1, username: 1, createTime: 1, _id : 1})
			query.limit(size)
			query.skip(start)
			if(sort && sort != '') {
				sort = sort.split("|")
				if(sort[1] == 'asc') sort = sort[0]
				else sort = '-' + sort[0]
				query.sort(sort)
			}
			query.exec((err, admins) => callback(admins, count));
		})
	},
	// 删除管理员
	delAdmin(_id) {
		return new Promise((resolve, reject) => {
			admin_mongo.findById(_id, admin => {
				if(!admin) return reject(false);

				admin.remove(err => {
					if(err) return reject(false);
					return resolve(true);
				})
			})
		})
	},



	// 登陆
	login(model) {
		return new Promise((resolve, reject) => {
			admin_mongo.findOne({
					username: model.username
				}, (err, admin) => {
				if(err) return reject(err);
				if(admin) {
					// 解密
					encryption.decipher(admin.password, admin.key, pwd => {
						if(pwd == model.password) return resolve(admin)
						return reject();
					})
				} else return reject()
			})
		})
	},

	// 注册
	register(admin) {
		return new Promise((resolve, reject) => {
			admin_mongo.findOne({username : admin.username}, (err, doc) => {
				if(doc) return reject();
				console.log('admin', admin)
				encryption.cipher(admin.password, (pwd, key) => {
					admin = new admin_mongo({
						name     : admin.name,
						username : admin.username,
						password : pwd,
						key      : key,
					})
					admin.save(err => {
						if(err) return reject(err);
						return resolve();
					})
				})
			})
		})
	},

	// 修改密码
	editorPassword(model) {
		return new Promise((resolve, reject) => {
			admin_mongo.findOne({
				username: model.username
			}, (err, admin) => {
				if(err) return reject(err);

				if (!admin) return reject();

				encryption.decipher(admin.password, admin.key, pwd => {
					if(!(pwd == model.password)) return reject();
					
					encryption.key_cipher(model.new_password, admin.key, password => {
						admin.password = password;
						admin.save(err => {
							if(err) return reject(err);
							return resolve(admin);
						})
					})
				})
			})
        })
	},
	// 修改密码
	editorPasswordFroAdmin(model) {
		return new Promise((resolve, reject) => {
			admin_mongo.findOne({
				username: model.username
			}, (err, admin) => {
				if(err) return reject(err);

				if (!admin) return reject();

				encryption.key_cipher(model.new_password, admin.key, password => {
					admin.password = password;
					admin.save(err => {
						if(err) return reject(err);
						return resolve(admin);
					})
				})
			})
        })
	}
}
