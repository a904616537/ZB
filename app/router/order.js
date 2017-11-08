/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 订单处理
 */

'use strict';

var express  = require('express'),
router       = express.Router(),
email_help   = require('../helper/email.help'),
service      = require('../service/cart.service'),
user_service = require('../service/user.service');

router.route('/')
.post((req, res) => {
	const { address, user } = req.body;
	const user_address = JSON.parse(address);
	user_service.getUserById(user, user => {
		console.log('order user', user);
		service.getCart(user)
		.then(cart => {
			console.log('email cart', cart)
			email_help.order_email(user, user_address, cart.cart_item, err => {
				if(err) res.send({status : false, err})
				else res.send({status : true})
			})
		})
		.catch(err => res.send({status : false, err}))
	})
})

module.exports = app => {
	app.use('/order', router);
}