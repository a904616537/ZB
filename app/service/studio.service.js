/*
 * Author: Kain·Altion <kain@foowala.com>
 */

'use strict';

const config = require('../../setting/config'),
mongoose     = require('mongoose'),
moment       = require('moment'),
studio_mongo  = mongoose.model('studio');


module.exports = {
	getList(page = 1, size = 10, sort = 'createTime|desc', callback) {
		studio_mongo.count({})
		.exec((err, count) => {
			let start = (page - 1) * size;
			let query = studio_mongo.find({})
			query.limit(size)
			query.skip(start)
			query.sort({createTime : -1});
			if(sort && sort != '') {
				sort = sort.split("|")
				if(sort[1] == 'desc') sort = sort[0]
				else sort = '-' + sort[0]
				query.sort(sort)
			}
			query.exec((err, studios) => {
				return callback(studios, count)
			})
		})
	},
	Editor(studio) {
		return new Promise((resolve, reject) => {
			const _id = studio._id;
			delete studio._id;
			studio_mongo.update({_id}, studio)
			.exec((err, doc) => {
				console.log('error', doc);
				if(err) return reject(err)
				resolve(doc);
			})
		})
	},
	Update(studio) {
		return new Promise((resolve, reject) => {
			studio_mongo.findById(studio._id, (err, doc) => {
				if (err) return reject(err);
				doc[studio.key] = studio.value;
				doc.save(err => {
					console.log('error', doc);
					if(err) return reject(err)
					resolve(doc);
				})
			})
		})
	},
	Inset(studio) {
		return new Promise((resolve, reject) => {
			studio_mongo.create(studio, err => {
				if(err) return reject(err);
				else return resolve();
			})
		})
	},
	Delete(studio) {
		return new Promise((resolve, reject) => {
			studio_mongo.findById(studio._id, (doc) => {
				doc.remove(err => {
					if(err) return reject(err)
					resolve();
				})
			})
		})	
	}
}
