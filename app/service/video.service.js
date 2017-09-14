/*
 * Author: Kain·Altion <kain@foowala.com>
 */

'use strict';

const config = require('../../setting/config'),
mongoose     = require('mongoose'),
moment       = require('moment'),
video_mongo  = mongoose.model('video');


module.exports = {
	// 获取用户
	getList(page = 1, size = 1, sort = 'CreateTime|asc', callback) {
		video_mongo.count({})
		.exec((err, count) => {
			let start = (page - 1) * size;
			let query = video_mongo.find({})
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
	
	Update(video) {
		return new Promise((resolve, reject) => {
			video_mongo.findById(video._id, (err, doc) => {
				if (err) return reject(err);
				doc[video.key] = video.value;
				doc.save(err => {
					console.log('error', doc);
					if(err) return reject(err)
					resolve(doc);
				})
			})
		})
	},

	getForLevel(level, callback) {
		console.log('level', level)
		let query = {level : {$ne : 0, $lte : parseInt(level) + 1}};
		video_mongo.find(query, (err, doc) => callback(doc))
	},

	SelectById(_id) {
		return new Promise((resolve, reject) => {
			video_mongo.findById(_id)
			.exec((err, doc) => {
				if (err) return reject(err);
				resolve(doc);
			})
        })
	},
	Inset(video) {
		return new Promise((resolve, reject) => {
			video_mongo.create(video, err => {
				if(err) return reject(err);
				else return resolve();
			})
		})
	},
	Delete(video) {
		return new Promise((resolve, reject) => {
			video_mongo.findById(video._id, (err, doc) => {
				if (err) return reject(err);
				doc.remove(err => {
					if(err) return reject(err)
					resolve(video);
				})
			})
		})	
	},
	getVideoForLevel(level) {
		return new Promise((resolve, reject) => {
			let query = {level : {$ne : 0, $lte : parseInt(level) + 1}};
			if(level == 0) query = {level : 0};
			console.log('level', query)

			video_mongo.find(query)
			.sort({level : 1, CreateTime : -1})
			.exec((err, doc) => {
				if (err) return reject(err);
				return resolve(doc);
			})
		})	
	}
}

	
