/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 课程
 */

'use strict';

var mongoose   = require('mongoose'),
Schema         = mongoose.Schema,
courses_Schema = new Schema({
	img        : String,	// 封面
	name       : String,	// 课程名称
	order      : {type : Number, default : 10},	// 课程排序
	CreateTime : {type : Date, default : Date.now }		// 创建时间
});

courses_Schema.virtual('date').get(() => {
  this._id.getTimestamp();
});

courses_Schema.statics = {
	findById(_id, callback) {
		this.findOne({_id})
		.exec(callback);
	}
}

mongoose.model('courses', courses_Schema, 'courses');



