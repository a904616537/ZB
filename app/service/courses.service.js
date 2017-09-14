/*
 * Author: Kain·Altion <kain@foowala.com>
 */

'use strict';

const config = require('../../setting/config'),
mongoose     = require('mongoose'),
moment       = require('moment'),
video_service = require('./video.service'),
courses_mongo  = mongoose.model('courses');


module.exports = {
	// 获取课程列表
	getList(page = 1, size = 1, sort = 'CreateTime|asc', callback) {
		courses_mongo.count({})
		.exec((err, count) => {
			let start = (page - 1) * size;
			let query = courses_mongo.find({})
			query.limit(size);
			query.skip(start);
			query.sort({order: 1, CreateTime : -1});
			if(sort && sort != '') {
				sort = sort.split("|")
				if(sort[1] == 'asc') sort = sort[0]
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
	
	Update(courses) {
		return new Promise((resolve, reject) => {
			courses_mongo.findById(courses._id, (err, doc) => {
				if (err) return reject(err);
				doc[courses.key] = courses.value;
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

	
