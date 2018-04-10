/*
 * Author: Kain·Altion <kain@foowala.com>
 */

'use strict';

const config  = require('../../setting/config'),
mongoose      = require('mongoose'),
moment        = require('moment'),
excel_help    = require('../helper/excel.help.js'),
video_service = require('./video.service'),
courses_mongo = mongoose.model('courses');


module.exports = {
	// 获取课程列表
	getList(user = null, page = 1, size = 1, sort = 'CreateTime|desc', callback) {
		courses_mongo.count({})
		.exec((err, count) => {
			let start = (page - 1) * size;
			let query = courses_mongo.find({})
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
			query.exec((err, courses) => {
				courses = courses.map(val => {
					let sign = val.sign_user.find(sign => sign.user._id == user)
					if(sign) return {data : val, selected : true};
					else return {data : val, selected : false};
				})
				return callback(courses, count)
			})
		})
	},

	getAll(callback) {
		courses_mongo.find({})
		.populate({
			path  : 'sign_user.user',
			model : 'user'
		})
		.sort({order : 1, CreateTime : -1})
		.exec((err, doc) => callback(doc))
	},

	getAllVideo(level, callback) {
		courses_mongo.find({})
		.sort({order : 1, CreateTime : -1})
		.exec((err, doc) => {
			video_service.getForLevel(level, videos => {
				const backs = doc.map(val => {
					const video = videos.filter(v => v.courses && v.courses.toString() == val._id.toString());
					return {
						videos : video,
						courses: val
					}
				})
				callback(backs)
			})
		})
	},
	// 获取课程报名列表
	getCourses(courses, callback) {
		courses_mongo.find({_id : courses})
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
	Apply(user, courses) {
		return new Promise((resolve, reject) => {
			courses_mongo.findById(courses, (err, doc) => {
				if (err || doc == null) return reject(err);
				// 必须小于规定报名人数
				
				const is_apply = doc.sign_user.length < doc.limit;
				if(is_apply) {
					doc.sign_user.push({user : user, payment : true});
					doc.save(err => {
						if(err) return reject(err)
						const item = doc.sign_user.find(val => val.user == user);
						resolve({courses, item_id : item._id});
					})
				} else reject()
			})
		})
	},
	// 修改报名的支付状态
	EditApply(courses, item_id) {
		return new Promise((resolve, reject) => {
			courses_mongo.findById(courses, (err, doc) => {
				if (err) return reject(err);

				let item = doc.sign_user.find(val => val._id.toString() == item_id.toString());
				if(item) {
					item.payment = !item.payment;
					doc.save(err => {
						if(err) return reject(err)
						resolve(doc);
					})
				} else reject();
			})
		})
	},
	// 转移报名到另一个课程
	TransferApply(courses, transfer, item_id) {
		console.log('courses', courses)
		return new Promise((resolve, reject) => {
			courses_mongo.findById(courses, (err, doc) => {
				if (err) return reject(err);
				// 获取报名
				let index, item;
				console.log('doc.sign_user', doc.sign_user)
				item = doc.sign_user.find((val, key) => {
					console.log(val._id.toString(), item_id.toString())
					if(val._id.toString() == item_id.toString()) {
						index = key;
						return true;
					} else return false;
				});
				if(item) {
					courses_mongo.findById(transfer, (err, courses_new) => {
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
	DeleteApply(courses, item_id) {
		return new Promise((resolve, reject) => {
			courses_mongo.findById(courses, (err, doc) => {
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
	Update(courses) {
		return new Promise((resolve, reject) => {
			courses_mongo.findById(courses._id, (err, doc) => {
				if (err) return reject(err);
				doc.name     = courses.name;
				doc.limit    = courses.limit;
				doc.price    = courses.price;
				doc.order    = courses.order;
				doc.time    = courses.time;
				doc.endTime  = courses.endTime;
				doc.location = courses.location;

				doc.save(err => {
					if(err) return reject(err)
					resolve(courses);
				})
			})
		})
	},


	SelectById(_id) {
		return new Promise((resolve, reject) => {
			courses_mongo.findById(_id)
			.exec((err, doc) => {
				if (err) return reject(err);
				resolve(doc);
			})
        })
	},
	Inset(courses) {
		return new Promise((resolve, reject) => {
			courses_mongo.create(courses, err => {
				if(err) return reject(err);
				else return resolve();
			})
		})
	},
	Delete(courses) {
		return new Promise((resolve, reject) => {
			courses_mongo.findById(courses._id, (err, doc) => {
				if (err) return reject(err);
				doc.remove(err => {
					if(err) return reject(err)
					resolve(courses);
				})
			})
		})	
	},
	// 生成excel表格
	toExcel(callback) {
		courses_mongo.find({})
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

	
