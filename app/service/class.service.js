/*
 * Author: Kain·Altion <kain@foowala.com>
 */

'use strict';

const config = require('../../setting/config'),
mongoose     = require('mongoose'),
moment       = require('moment'),
excel_help   = require('../helper/excel.help.js'),
user_service = require('./user.service'),
class_mongo  = mongoose.model('class');


module.exports = {
	// 获取课程列表
	getList(user = null, page = 1, size = 1, sort = 'CreateTime|desc', callback) {
		class_mongo.count({})
		.exec((err, count) => {
			let start = (page - 1) * size;
			let query = class_mongo.find({})
			query.populate({
				path  : 'sign_user.user',
				model : 'user'
			})
			query.limit(size);
			query.skip(start);
			query.sort({order: 1, CreateTime : -1});
			if(sort && sort != '') {
				sort = sort.split("|")
				if(sort[1] == 'desc') sort = sort[0]
				else sort = '-' + sort[0]
				query.sort(sort)
			}
			query.exec((err, result) => {
				result = result.map(val => {
					let sign;
					for(let item of val.sign_user) {
						if(item.user._id == user) {
							sign = item;
						}
					}
					if(sign) return {data : val, selected : true};
					else return {data : val, selected : false};
				})
				return callback(result, count)
			})
		})
	},

	getAll(callback) {
		class_mongo.find({})
		.populate({
			path  : 'sign_user.user',
			model : 'user'
		})
		.sort({order : 1, CreateTime : -1})
		.exec((err, doc) => callback(doc))
	},

	getUserClass(user, callback) {
		class_mongo.find({})
		.exec((err, doc) => {
			let array = [];
			for(let item of doc) {
				for(let sign of item.sign_user) {
					if(sign.user == user && sign.payment) {
						for(let courses of item.courses) {
							array.push(courses.toString());
						}
					}
				}
			}
			const set = new Set(array);
			callback([...set])
		})
	},
	// 获取课程报名列表
	getClass(_id, callback) {
		class_mongo.find({_id})
		.populate({
			path  : 'sign_user.user',
			model : 'user'
		})
		.sort({order : 1, CreateTime : -1})
		.exec((err, doc) => {
			callback(doc);
		})
	},
	// 报名申请
	Apply(user, _id) {
		return new Promise((resolve, reject) => {
			class_mongo.findById(_id, (err, doc) => {
				if (err || doc == null) return reject(err);
				// 必须小于规定报名人数
				
				const is_apply = doc.sign_user.length < doc.limit;
				if(is_apply) {
					doc.sign_user.push({user : user, payment : true});
					doc.save(err => {
						if(err) return reject(err)
						const item = doc.sign_user.find(val => val.user == user);
						resolve({_id, item_id : item._id});
					})

					user_service.UpdateLevel(user, doc.level)
					.then(result => console.log('修改用户权限！', user, doc.level))
					.catch(err => console.log('修改用户权限失败！', user, doc.level))

				} else reject()
			})
		})
	},
	// 修改报名的支付状态
	EditApply(_id, item_id) {
		return new Promise((resolve, reject) => {
			class_mongo.findById(_id, (err, doc) => {
				if (err) return reject(err);

				let sign;
				for(let item of doc.sign_user) {
					if(item._id == item_id) sign = item;
				}
				if(sign) {
					sign.payment = !sign.payment;
					doc.save(err => {
						if(err) return reject(err)
						resolve(doc);
					})
				} else reject();
			})
		})
	},
	// 转移报名到另一个课程
	TransferApply(_id, transfer, item_id) {
		console.log('_id', _id)
		return new Promise((resolve, reject) => {
			class_mongo.findById(_id, (err, doc) => {
				if (err) return reject(err);
				// 获取报名
				let index, item;
				doc.sign_user.map((val, key) => {
					console.log('val._id.toString() === item_id', val._id, item_id)
					if(val._id.toString() === item_id) {
						item = val;
						index = key;
					}
				})
				if(item) {
					class_mongo.findById(transfer, (err, courses_new) => {
						if(courses_new) {
							delete item._id;
							console.log('transfer item', item);
							courses_new.sign_user.push(item);
							courses_new.save(err => {
								if(err) return reject(err)
								resolve(courses_new);
								doc.sign_user.splice(index, 1);
								doc.save(err => {
									if(err) console.log('delete sign_user item error', err);
								})
							})
						} else reject();
					})
				} else reject();
			})
		})
	},
	// 移除用户报名
	DeleteApply(_id, item_id) {
		return new Promise((resolve, reject) => {
			class_mongo.findById(_id, (err, doc) => {
				if (err) return reject(err);

				const item_index = doc.sign_user.findIndex(val => val._id.toString() == item_id.toString());
				if(item_index > -1) {
					doc.sign_user.splice(item_index, 1);
					doc.save(err => {
						if(err) return reject(err)
						resolve(doc);
					})
				} else reject();
			})
		})
	},
	Update(model) {
		return new Promise((resolve, reject) => {
			class_mongo.findById(model._id, (err, doc) => {
				if (err) return reject(err);
				doc.name     = model.name;
				doc.level    = model.level;
				doc.courses  = model.courses;
				doc.limit    = model.limit;
				doc.price    = model.price;
				doc.order    = model.order;
				doc.time     = model.time;
				doc.endTime  = model.endTime;
				doc.location = model.location;

				doc.save(err => {
					if(err) return reject(err)
					resolve(model);
				})
			})
		})
	},


	SelectById(_id) {
		return new Promise((resolve, reject) => {
			class_mongo.findById(_id)
			.exec((err, doc) => {
				if (err) return reject(err);
				resolve(doc);
			})
        })
	},
	Inset(model) {
		return new Promise((resolve, reject) => {
			class_mongo.create(model, err => {
				if(err) return reject(err);
				else return resolve();
			})
		})
	},
	Delete(model) {
		return new Promise((resolve, reject) => {
			class_mongo.findById(model._id, (err, doc) => {
				if (err) return reject(err);
				doc.remove(err => {
					if(err) return reject(err)
					resolve(model);
				})
			})
		})	
	},
	// 生成excel表格
	toExcel(callback) {
		class_mongo.find({})
		.populate({
			path  : 'sign_user.user',
			model : 'user'
		})
		.sort({order: 1, CreateTime : -1})
		.exec((err, courses) => {
			const cols = [
				{caption: 'CreateTime', type:'string', width:10},
				{caption: 'EndTime', type:'string', width:10},
				{caption: 'Choreographies', type:'string', width:10},
				{caption: 'Price', type:'string', width:10},
				{caption: 'Limit', type:'string', width:10},
				{caption: 'Location', type:'string', width:20},
				{caption: 'Time', type:'string', width:20}
			];
			let excels = [];
			for(let val of courses) {
				const item = [
					moment(val.CreateTime).format('YYYY-MM-DD hh:mm:ss'),
					moment(val.endTime).format('YYYY-MM-DD hh:mm:ss'),
					val.name,
					val.price.toString(),
					val.limit.toString(),
					val.location,
					val.time
				];
				excels.push(item)
				// 报名增加
				for(let sign of val.sign_user) {
					const user = [
						'',
						'',
						sign.user.first_name,
						sign.user.last_name,
						sign.user.phone,
						sign.payment?"payment" : "not payment",
						moment(sign.CreateTime).format('YYYY-MM-DD hh:mm:ss'),
					];
					excels.push(user)
				}
			}
			console.log(excels)
			excel_help.toExcel('Choreographies', cols, excels)
			.then(url => {
				callback(url);
			})
			.catch(err => {
				callback('');
			});	
		})
	}
}

	
