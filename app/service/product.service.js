/*
 * Author: Kain·Altion <kain@foowala.com>
 */

'use strict';

const config = require('../../setting/config'),
mongoose     = require('mongoose'),
moment       = require('moment'),
product_mongo  = mongoose.model('product');


module.exports = {
	getList(page = 1, size = 10, sort = 'CreateTime|desc', callback) {
		product_mongo.count({})
		.exec((err, count) => {
			let start = (page - 1) * size;
			let query = product_mongo.find({})
			query.limit(size)
			query.skip(start)
			query.sort({order: 1, CreateTime : -1});
			if(sort && sort != '') {
				sort = sort.split("|")
				if(sort[1] == 'desc') sort = sort[0]
				else sort = '-' + sort[0]
				query.sort(sort)
			}
			query.exec((err, products) => {
				return callback(products, count)
			})
		})
	},
	Editor(product) {
		return new Promise((resolve, reject) => {
			const _id = product._id;
			delete product._id;
			product_mongo.update({_id}, product)
			.exec((err, doc) => {
				console.log('error', doc);
				if(err) return reject(err)
				resolve(doc);
			})
		})
	},
	Update(product) {
		return new Promise((resolve, reject) => {
			product_mongo.findById(product._id, (err, doc) => {
				if (err) return reject(err);
				doc[product.key] = product.value;
				doc.save(err => {
					console.log('error', doc);
					if(err) return reject(err)
					resolve(doc);
				})
			})
		})
	},
	UpdateImg(product) {
		return new Promise((resolve, reject) => {
			product_mongo.findById(product._id, (err, doc) => {
				if (err) return reject(err);
				doc.img = doc.img.map(val => {
					if(val._id == product.img_id) val.def = true;
					else val.def = false;
					return val;
				});

				doc.save(err => {
					if(err) return reject(err)
					resolve(doc);
				})
			})
		})
	},
	getForLevel(level, callback) {
		let query = {level : {$ne : 0, $lte : parseInt(level) + 1}};
		product_mongo.find(query, (err, doc) => callback(doc)).sort({order: 1, CreateTime : -1});
	},

	SelectById(_id) {
		return new Promise((resolve, reject) => {
			product_mongo.findById(_id)
			.exec((err, doc) => {
				if (err) return reject(err);
				resolve(doc);
			})
        })
	},
	Inset(product) {
		return new Promise((resolve, reject) => {
			product_mongo.create(product, err => {
				if(err) return reject(err);
				else return resolve();
			})
		})
	},
	Delete(product) {
		return new Promise((resolve, reject) => {
			product_mongo.findById(product._id, (err, doc) => {
				if (err) return reject(err);
				doc.remove(err => {
					if(err) return reject(err)
					resolve(product);
				})
			})
		})	
	},
	getVideoForLevel(level) {
		return new Promise((resolve, reject) => {
			let query = {level : {$ne : 0, $lte : parseInt(level) + 1}};
			if(level == 0) query = {level : 0};

			product_mongo.find(query)
			.sort({level : 1, order: 1, CreateTime : -1})
			.exec((err, doc) => {
				if (err) return reject(err);
				return resolve(doc);
			})
		})	
	}
}

	
