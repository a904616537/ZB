/*
 * Author: Kain·Altion <kain@foowala.com>
 */

'use strict';

const config  = require('../../setting/config'),
mongoose      = require('mongoose'),
moment        = require('moment'),
excel_help    = require('../helper/excel.help.js'),
video_service = require('./video.service'),
class_service = require('./class.service'),
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

	getAllVideo(level, user, callback) {
		class_service.getUserClass(user, (result) => {
			console.log('result', result)
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
	}
}

	
