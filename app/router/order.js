/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 订单处理
 */

'use strict';

var express   = require('express'),
router        = express.Router(),
help          = require('../helper/page.help.js'),
service       = require('../service/cart.service'),
order_service = require('../service/order.service'),
user_service  = require('../service/user.service');

router.route('/')
.get((req, res) => {
	let { page, per_page, sort, filter, status } = req.query;
	page     = parseInt(page);
	per_page = parseInt(per_page);

	order_service.getOrder(page, per_page, sort, filter, status, (orders, count) => {
		let { total, last_page, next_page_url, prev_page_url} = help.calculate(page, per_page, count, '/order');
		res.send({data: orders, current_page: page, total, per_page, last_page, next_page_url, prev_page_url })
	})
})
.post((req, res) => {
	const { recipients, phone, email, address, type, user } = req.body;
	const user_address = {
		recipients,
		phone,
		email,
		address,
		type,
	}
	console.log('address', user_address)
	order_service.Insert(user, {address : user_address})
	.then(order => res.send({status : true, order}))
	.catch(err => res.send({status : false, err}))
})
.put((req, res) => {
	const { _id, status } = req.body;

	order_service.UpdateStatus(_id, status)
	.then(order => res.send({status : true, order}))
	.catch(err => res.send({status : false, err}))
})

module.exports = app => {
	app.use('/order', router);
}