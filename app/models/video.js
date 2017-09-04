/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: user mongoose
 */

'use strict';

var mongoose   = require('mongoose'),
Schema         = mongoose.Schema,
video_Schema = new Schema({
	path       : String,
	img        : String,
	name       : String,
	level      : {type : Number, default : 4, max : 4, min : 0},
	order      : {type : Number, default : 0},
	grade      : {type : Number, default : 0, min : 0},
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



