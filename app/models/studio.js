/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: studio mongoose
 */

'use strict';

var mongoose = require('mongoose'),
Schema       = mongoose.Schema,
studio_Schema = new Schema({
	name         : String,
	email        : String,
	wechat       : String,
	phone        : String,
	studio_name  : String,
	location     : String,
	address      : String,
	studio_phone : String,
	website      : String,
	interested   : String,
	createTime   : {type : Date, default : Date.now() }
});

studio_Schema.virtual('date').get(() => {
  this._id.getTimestamp();
})

studio_Schema.statics = {
	findById(id, callback) {
		return this.findOne({_id : id}, (err, studio) => callback(studio))
	}
}

mongoose.model('studio', studio_Schema, 'studio');
