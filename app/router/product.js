/*
 * Author: Kain·Altion <kain@foowala.com>
 */

'use strict';

var express   = require('express'),
service       = require('../service/product.service'),
help          = require('../helper/page.help.js'),
moment        = require('moment'),
router        = express.Router();


router.route('/')
.get((req, res) => {
	let { page, per_page, sort, query } = req.query;
	page     = parseInt(page);
	per_page = parseInt(per_page);
	service.getList(page, per_page, sort, (coursess, count) => {
		let { total, last_page, next_page_url, prev_page_url} = help.calculate(page, per_page, count, '/product?query=' + query);
		res.send({data: coursess, current_page: page, total, per_page, last_page, next_page_url, prev_page_url })
	})
})
.post((req, res) => {
	req.body.img = JSON.parse(req.body.img);
	const product = req.body;
	console.log('product', product)
	service.Inset(product)
	.then(result => res.send({status : true}))
	.catch(err => { 
		console.error('err', err);
		res.send({status : false})
	})
})
.put((req, res) => {
	req.body.img = JSON.parse(req.body.img);
	console.log('put product', req.body)
	const product = req.body;
	service.Editor(product)
	.then(result => res.send({status : true}))
	.catch(err => { 
		console.error('err', err);
		res.send({status : false})
	})
})
.delete((req, res) => {
	const product = req.body;
	service.Delete(product)
	.then(result => res.send({status : true}))
	.catch(err => { 
		console.error('err', err);
		res.send({status : false})
	})
})


router.route('/image')
.put((req, res) => {
	const product = req.body;
	service.UpdateImg(product)
	.then(result => res.send({status : true}))
	.catch(err => {
		console.error('err', err);
		res.send({status : false})
	})
})

module.exports = app => {
	app.use('/product', router);
}