/*
 * Author: Kain·Altion <kain@foowala.com>
 */

'use strict';

const config = require('../../setting/config'),
mongoose     = require('mongoose'),
moment       = require('moment'),
picture_mongo  = mongoose.model('picture');


module.exports = {
	// 获取用户
	getList(page = 1, size = 1, sort = 'CreateTime|asc', callback) {
		picture_mongo.count({})
		.exec((err, count) => {
			let start = (page - 1) * size;
			let query = picture_mongo.find({})
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

	getById(_id, callback) {
		picture_mongo.findById(_id, (err, doc) => callback(doc))
	},

	getAll(callback) {
		let query = picture_mongo.find({}, {_id : 1, name : 1, img : 1, order : 1})
		query.sort({order : 1, CreateTime : -1})
		query.exec((err, pictures) => {
			return callback(pictures)
		})
	},
	
	Update(picture) {
		return new Promise((resolve, reject) => {
			picture_mongo.findById(picture._id, (err, doc) => {
				if (err) return reject(err);
				console.log(picture.key, picture.value)
				doc[picture.key] = picture.value;
				doc.save(err => {
					if(err) return reject(err)
					resolve(doc);
				})
			})
		})
	},
	Inset(picture) {
		return new Promise((resolve, reject) => {
			picture_mongo.create(picture, err => {
				if(err) return reject(err);
				else return resolve();
			})
		})
	},
	Delete(picture) {
		return new Promise((resolve, reject) => {
			picture_mongo.findById(picture._id, (err, doc) => {
				if (err) return reject(err);
				doc.remove(err => {
					if(err) return reject(err)
					resolve(picture);
				})
			})
		})	
	}
}

	
