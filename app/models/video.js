/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 视频
 */

'use strict';

var mongoose   = require('mongoose'),
Schema         = mongoose.Schema,
video_Schema = new Schema({
	path       : String,
	img        : String,
	name       : String,
	level      : {type : Number, default : 4},
	courses    : { type : Schema.Types.ObjectId, ref : 'courses'},
	order      : {type : Number, default : 0},
	CreateTime : {type : Date, default : Date.now }
});

video_Schema.virtual('date').get(() => {
  this._id.getTimestamp();
});

video_Schema.statics = {
	findById(_id, callback) {
		this.findOne({_id})
		.exec(callback);
	}
}

mongoose.model('video', video_Schema, 'video');



