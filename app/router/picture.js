/*
 * Author: Kain·Altion <kain@foowala.com>
 */

'use strict';

var express   = require('express'),
service       = require('../service/picture.service'),
help          = require('../helper/page.help.js'),
moment        = require('moment'),
router        = express.Router();


router.route('/')
.get((req, res) => {
	let { page, per_page, sort, query } = req.query;
	page     = parseInt(page);
	per_page = parseInt(per_page);
	service.getList(page, per_page, sort, (pictures, count) => {
		let { total, last_page, next_page_url, prev_page_url} = help.calculate(page, per_page, count, '/picture?query=' + query);
		res.send({data: pictures, current_page: page, total, per_page, last_page, next_page_url, prev_page_url })
	})
})
.post((req, res) => {
	const picture = req.body;
	service.Inset(picture)
	.then(result => res.send({status : true}))
	.catch(err => { 
		console.error('err', err);
		res.send({status : false})
	})
})
.put((req, res) => {
	const picture = req.body;
	console.log('req.body', picture)
	service.Update(picture)
	.then(result => res.send({status : true}))
	.catch(err => { 
		console.error('err', err);
		res.send({status : false})
	})
})
.delete((req, res) => {
	const picture = req.body;
	service.Delete(picture)
	.then(result => res.send({status : true}))
	.catch(err => { 
		console.error('err', err);
		res.send({status : false})
	})
})

router.route('/all')
.get((req, res) => {
	service.getAll((pictures) => {
		res.send({data: pictures})
	})
})


router.route('/more/:_id')
.get((req, res) => {
	const {_id} = req.params;
	service.getById(_id, (picture) => {
		if(picture) res.send({status : true, data: picture})
		else res.send({status : false})
	})
})

module.exports = app => {
	app.use('/picture', router);
}