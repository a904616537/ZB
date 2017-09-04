/*
 * Author: Kain·Altion <kain@foowala.com>
 */

'use strict';

var mongoose = require('mongoose'),
mongo        = mongoose.model('usertoken');

module.exports = {
	getToken(token) {
		return new Promise((resolve, reject) => {
			mongo.getToken(token)
			.then(result => {
				resolve(result)
			})
		})
	},
	setToken(token, admin) {
		return new Promise((resolve, reject) => {
			mongo.setToken(token, admin)
			.then(() => resolve())
		})	
	}
}

