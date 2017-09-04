/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: user mongoose
 */

'use strict';

var mongoose   = require('mongoose'),
Schema         = mongoose.Schema,
user_Schema = new Schema({
	first_name     : String,
	last_name      : String,
	password       : String,
	key            : String,	// 加密key
	language       : String,
	phone          : String,
	email          : String,
	address        : String,
	birth          : String ,
	nationality    : String,
	occupation     : String,
	studio_name    : String,
	studio_address : String,
	studio_phone   : String,
	manager        : String,
	motivation1    : String, 
	motivation2    : String,
	experience     : [{
		discipline : String,
		level      : String,
		years      : String
	}],
	bellet              : String,
	share_experience    : String,
	isvpn               : String,
	music : String,
	QQ                  : String,
	heart_condition     : String,
	workout          : String,
	high_blood : String,
	
	level      : { type : Number, min : 0, default : 0 },
	audit      : { type : Boolean, default : false },	// 审核
	msgNum     : { type : Number, default : 1}, 	// 通知次数
	CreateTime : { type : Date, default : Date.now }
});

user_Schema.virtual('date').get(() => {
  this._id.getTimestamp();
});

user_Schema.statics = {
	findById(_id, callback) {
		this.findOne({_id})
		.select({
			password : 0,
			key      : 0
		})
		.exec(callback);
	},
	findByUser(select, callback) {
		this.findOne({})
		.or([
			{'phone': { $in: select }},
			{'email': { $in: select }}
		])
		.exec(callback)
	}
}

mongoose.model('user', user_Schema, 'user');



