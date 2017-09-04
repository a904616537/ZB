/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 用户登录令牌
 */

'use strict';

var mongoose = require('mongoose'),
Schema       = mongoose.Schema,
token_schema = new Schema({
	token : String,
	admin : { type : Schema.Types.ObjectId, ref : 'admin'}
});

token_schema.statics = {
	getToken(token) {
		return new Promise((resolve, reject) => {
			this.findOne({token})
			.populate('admin')
			.exec((err, result) => {
				if (err) return reject(err);
				return resolve(result);
			})
			
		})
	},
	setToken(token, admin) {
		// 有则更新，无则添加
		return new Promise((resolve, reject) => {
			const query = {token : token},
			options     = {upsert : true}
			this.update(query, {token, admin}, options, (err, result) => {
				if (err) return reject(err);
				return resolve();
			})
		})
	}
}

mongoose.model('usertoken', token_schema, 'usertoken');



