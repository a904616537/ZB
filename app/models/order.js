/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: order mongoose
 */

'use strict';

var mongoose   = require('mongoose'),
Schema         = mongoose.Schema,
address_Scheam = new Schema({
	recipients : String,
	phone      : String,
	email      : String,
	province   : String,
	city       : String,
	district   : String,
	address    : String,
	remark     : String
}),
// 订单中的商品
order_item_Schema = new Schema({
	product  : { type: Schema.Types.ObjectId, ref : 'product'},
	number   : { type: Number, default: 1},     // 数量
	price    : { type: Number, set: v => Number(v).toFixed(2)},   // 购买时的单价
	total    : { type: Number, default: 0, set: v => Number(v).toFixed(2)}
}),
order_Schema = new Schema({
	_id             : { type: String, required: true},
	user            : { type: Schema.Types.ObjectId, ref: 'user'},
	total           : { type: Number, default: 0, min: 0, set: v => Number(v).toFixed(2) },//总价
	status          : { type: Boolean, default: false },
	out_trade_no    : String, // 支付单号
	CreateTime      : { type: Date, default : Date.now },
	order_item      : [order_item_Schema],
	address         : address_Scheam
});

order_Schema.statics = {
	findById(_id, callback) {
		this.findOne({_id})
		.populate({
			path     : 'order_item.product',
			model    : 'product'
		})
		.exec(callback)
	},
	getAll(callback) {
		this.findOne({})
		.populate({
			path     : 'order_item.product',
			model    : 'product'
		})
		.exec(callback)
	},
	getOrderByUser(_id, query, callback) {
		let select = {};
		if(query) select = {status : query};

		this.find(select)
		.populate({
			path     : 'order_item.product',
			model    : 'product'
		})
		.exec(callback)
	}
}

mongoose.model('order', order_Schema, 'order');



