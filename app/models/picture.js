/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 图片
 */

'use strict';

var mongoose   = require('mongoose'),
Schema         = mongoose.Schema,
picture_Schema = new Schema({
	img        : String,
	name       : String,
	SmallPic   : [String],
	order      : {type : Number, default : 10},
	CreateTime : {type : Date, default : Date.now }
});

picture_Schema.virtual('date').get(() => {
  this._id.getTimestamp();
});

picture_Schema.statics = {
	findById(_id, callback) {
		this.findOne({_id})
		.exec(callback);
	}
}

mongoose.model('picture', picture_Schema, 'picture');



