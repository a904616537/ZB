/*
 * Author: Kain·Altion <kain@foowala.com>
 */

'use strict';

var express   = require('express'),
service       = require('../service/courses.service'),
help          = require('../helper/page.help.js'),
moment        = require('moment'),
router        = express.Router();


router.route('/')
.get((req, res) => {
	let { page, per_page, sort, query } = req.query;
	page     = parseInt(page);
	per_page = parseInt(per_page);
	service.getList(page, per_page, sort, (coursess, count) => {
		let { total, last_page, next_page_url, prev_page_url} = help.calculate(page, per_page, count, '/courses?query=' + query);
		res.send({data: coursess, current_page: page, total, per_page, last_page, next_page_url, prev_page_url })
	})
})
.post((req, res) => {
	const courses = req.body;
	service.Inset(courses)
	.then(result => res.send({status : true}))
	.catch(err => { 
		console.error('err', err);
		res.send({status : false})
	})
})
.put((req, res) => {
	const courses = req.body;
	service.Update(courses)
	.then(result => res.send({status : true}))
	.catch(err => { 
		console.error('err', err);
		res.send({status : false})
	})
})
.delete((req, res) => {
	const courses = req.body;
	service.Delete(courses)
	.then(result => res.send({status : true}))
	.catch(err => { 
		console.error('err', err);
		res.send({status : false})
	})
})
router.route('/list')
.get((req, res) => {
	service.getAll(coursess => res.send({data: coursess}))
})

router.route('/list/video/:level')
.get((req, res) => {
	const {level} = req.params;
	service.getAllVideo(level, coursess => {
		res.send({status : true, data: coursess})
	})
})

module.exports = app => {
	app.use('/courses', router);
}