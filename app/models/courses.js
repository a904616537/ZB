/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 课程
 */

'use strict';

var mongoose   = require('mongoose'),
Schema         = mongoose.Schema,
signUser_Schema= new Schema({
	user       : { type : Schema.Types.ObjectId, ref : 'user'},
	payment    : { type : Boolean, default : false },	//付钱了没
	CreateTime : {type : Date, default : Date.now }		// 报名时间
}),
courses_Schema = new Schema({
	img        : String,	// 封面
	name       : String,	// 课程名称
	order      : {type : Number, default : 10},	// 课程排序
	price      : {type : Number, default : 0, min : 0, set : v => Number(v).toFixed(2) },	// 课程价格
	limit      : {type : Number, default : 50},	// 允许报名人数
	sign_user  : [signUser_Schema],	// 报名对象
	location   : {type : String, default : '' },
	time       : {type : String, default : '' },		// 上课时间日期
	endTime    : {type : Date, default : Date.now },	// 报名截止日期
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



