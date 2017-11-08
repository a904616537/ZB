/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: cart 路由配置
 */

'use strict';

var express = require('express'),
router      = express.Router(),
service     = require('../service/cart.service');

router.route('/')
.get((req, res) => {
	const user_id = req.query.user;
	console.log('get cart by user', user_id)
	service.getCart(user_id)
	.then(cart => res.send({status : true, cart}))
	.catch(err => res.send({status : false, err}))
})
.put((req, res) => {
	const item = {
		number  : req.body.number,
		item_id : req.body._id,
		user    : req.body.user
	};

	console.log('put cart item for product', item);
	service.getCart(item.user)
	.then(cart => {
		let cart_item = cart.cart_item.find(value => {
			return value._id == item.item_id
		})
		let product = cart_item.product;
		cart_item.number = item.number;
		
		service.Update(cart)
		.then(() => res.send({status : true}))
		.catch(err => res.send({status : false, err}))
	})
	.catch(err => res.send({status: false, err}))
})
.post((req, res) => {
	const { product_id, number, user } = req.body;
	service.getCart(user)
	.then(cart => {
		let cart_item = cart.cart_item.find(value => {
			if(value.product) return value.product._id == product_id;
			else return false;
		})
		if(cart_item) cart_item.number += Number(number);
		else cart.cart_item.push({
			product : product_id,
			number  : Number(number),
		})
		service.Update(cart)
		.then(cart => res.send({status : true, cart}))
		.catch(err => res.send({status : false, err}))
	})
	.catch(err => res.send({status : false, err}))
})
// 移除普通商品
.delete((req, res) => {
	const { _id, user } = req.body;
	service.getCart(user)
	.then(cart => {
		let index = cart.cart_item.findIndex(value => value._id == _id)
		
		cart.cart_item.splice(index, 1)

		service.Update(cart)
		.then(cart => res.send({status : true, cart}))
		.catch(err => res.send({status : false, err}))
	})
	.catch(err => res.send({status : false , err : err}))
})

router.route('/clear')
.get((req, res) => {
	const user_id = req.query.user;
	console.log('get cart by user', user_id)
	service.Clear(user_id)
	.then(cart => res.send({status : true, cart}))
	.catch(err => res.send({status : false, err}))
})

module.exports = app => {
	app.use('/cart', router);
}