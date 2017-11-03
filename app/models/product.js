/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 商品
 */

'use strict';

var mongoose   = require('mongoose'),
Schema         = mongoose.Schema,
image_schema = new Schema({
	def : { type : Boolean, default : false },
	path : String
}),
product_Schema = new Schema({
	name       : String,
	img        : [image_schema],
	price      : { type : Number, default : 0, min : 0, set : v => Number(v).toFixed(2) },
	order      : {type : Number, default : 10},
	CreateTime : {type : Date, default : Date.now }
});

product_Schema.virtual('date').get(() => {
  this._id.getTimestamp();
});

product_Schema.statics = {
	findById(_id, callback) {
		this.findOne({_id})
		.exec(callback);
	}
}

mongoose.model('product', product_Schema, 'product');



