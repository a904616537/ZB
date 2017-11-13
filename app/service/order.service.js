/*
 * Author: Kain·Altion <kain@foowala.com>
 */

'use strict';

const config = require('../../setting/config'),
mongoose     = require('mongoose'),
moment       = require('moment'),
async        = require('async'),
order_mongo  = mongoose.model('order'),
user_service = require('./user.service'),
cart_service = require('./cart.service');

const getId = () => {
	var str = "" + moment().unix(),
    pad = "000000000",
    _id = moment().format("YYYY") + moment().format("MM") + pad.substring(0, pad.length - str.length) + str;
    return _id;
}

module.exports = {
	// 获取订单
	getOrder(page = 1, size = 1, sort = 'CreateTime|desc', filter='', status, callback) {
		const reg = new RegExp(filter, 'i'),
		find      = status?{status}:{},
		seach     = [
					{ '_id': { $regex: reg }},
					{ 'address.recipients': { $regex: reg }},
					{ 'address.phone': { $regex: reg }}
				]
		order_mongo.count(find)
		.or(seach)
		.exec((err, count) => {
			let start = (page - 1) * size;
			let query = order_mongo.find(find)
			query.limit(size)
			query.skip(start)
			query.populate({
				path     : 'order_item.product',
				model    : 'product'
			})
			query.populate({
				path  : 'user',
				model : 'user'
			})
			query.or(seach)
			query.sort({CreateTime : -1})
			if(sort) {
				sort = sort.split("|")
				if(sort[1] == 'asc') sort = sort[0]
				else sort = '-' + sort[0]
				query.sort(sort)
			}
			query.exec((err, orders) => {
				return callback(orders, count)
			})
		})
	},
	getOrderCount(user, callback) {
		order_mongo.count({user : user})
		.exec((err, count) => {
			if(count) callback(count);
			else callback(0);
		})
	},
	getOrderById(_id, callback) {
		order_mongo.findById(_id, callback);
	},
	getOrderByUser(user, callback) {
		let select = {user, is_subscribe : false};
		let query = order_mongo.find(select)
		query.populate({
			path     : 'order_item.product',
			model    : 'product'
		})
		query.sort({CreateTime : -1})
		query.exec(callback)
	},
	Insert(_id, order) {
		return new Promise((resolve, reject) => {
			if(!order._id) order._id = getId();
			let user = {};
			order.order_item     = [];
			order.original_total = 0;

			// 清空购物车，并返回选择的商品			
			cart_service.Clear(_id)
			.then(result => {

				const {cart_item, clearNext} = result;
				let total           = 0;	// 统计总价
				let discount        = 100;	// 记录折扣

				async.series([
					// 获取用户当前信息
					next => {
						user_service.getUserById(_id, u => {
							user = u;
							next();
						})
					},
					// 单品处理
					next => {
						if(cart_item.length == 0) return next();
						async.each(cart_item, (item, cb) => {
							if(!item.product) return cb();
							if(!order.order_item) order.order_item = [];
							order.order_item.push({
								product : item.product._id,
								total   : item.product.price * item.number,
								number  : item.number,
								price   : item.product.price
							});
							total += item.product.price * item.number;
							cb();
						}, err => {
							if(err) console.error(moment(), '下单处理购物车单品出错!err:', err)
							next();
						});
					}
					// 合计
				], err => {
					// 绑定下单人数据主键，方便查询
					order.status = false;
					order.user   = user._id;
					order.total  = total;
					if(order.address.type == "Express Delivery (20 rmb delivery fee)") {
						order.total  += 20;
					}
					
					console.log(moment(), '下单金额：', order._id, order.total)
					console.log('order', order)

					order_mongo.create(order, (err, doc) => {
						if(err) {
							console.log(moment(), '订单生成失败', err)
							reject(err);
							next(err);
						}
						else {
							console.log(moment(), '订单生成成功', order)
							// 生成订单未出错则通知清空购物车！
							clearNext();
							resolve(order);
						}
					})
				});
			})
			.catch(err => {
				reject(err)
			})
		})
	},
	Update(data) {
		return new Promise((resolve, reject) => {
			this.getOrderById(data._id, (err, order) => {
				order.address        = data.address;
				order.total          = data.total;
				order.order_item     = data.order_item.map(value => {
					return {
						product : value.product._id,
						price   : value.price,
						total   : value.total,
						number  : value.number
					}
				});
				order_mongo.update({_id : data._id}, order, err => {
					if(err) return reject(err);
					resolve(order);
				})
			})
		});
	},
	UpdateStatus(_id, status) {
		return new Promise((resolve, reject) => {
			this.getOrderById(_id, (err, order) => {
				order.status = status;
				order.save(err => {
					if(err) return reject(err);
					resolve(order);
				})
			})
		});
	}
}
