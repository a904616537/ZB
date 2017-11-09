/*
 * Author: Kain·Altion <kain@foowala.com>
 */

'use strict';

var express   = require('express'),
service       = require('../service/studio.service'),
help          = require('../helper/page.help.js'),
moment        = require('moment'),
router        = express.Router();


router.route('/')
.get((req, res) => {
	let { page, per_page, sort, query } = req.query;
	page     = parseInt(page);
	per_page = parseInt(per_page);
	service.getList(page, per_page, sort, (studios, count) => {
		let { total, last_page, next_page_url, prev_page_url} = help.calculate(page, per_page, count, '/studio?query=' + query);
		res.send({data: studios, current_page: page, total, per_page, last_page, next_page_url, prev_page_url })
	})
})
.post((req, res) => {
	const studio = req.body;
	console.log('studio', studio)
	service.Inset(studio)
	.then(result => res.send({status : true}))
	.catch(err => { 
		console.error('err', err);
		res.send({status : false})
	})
})
.put((req, res) => {
	const studio = req.body;
	service.Editor(studio)
	.then(result => res.send({status : true}))
	.catch(err => { 
		console.error('err', err);
		res.send({status : false})
	})
})
.delete((req, res) => {
	const studio = req.body;
	console.log(studio)
	service.Delete(studio)
	.then(result => res.send({status : true}))
	.catch(err => { 
		console.error('err', err);
		res.send({status : false})
	})
})

module.exports = app => {
	app.use('/studio', router);
}