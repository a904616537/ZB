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
	let { page, per_page, sort, query, user } = req.query;
	page     = parseInt(page);
	per_page = parseInt(per_page);
	service.getList(user, page, per_page, sort, (coursess, count) => {
		let { total, last_page, next_page_url, prev_page_url} = help.calculate(page, per_page, count, '/courses?query=' + query);
		res.send({data: coursess, current_page: page, total, per_page, last_page, next_page_url, prev_page_url })
	})
})
.post((req, res) => {
	const courses = req.body;
	console.log('courses', courses)
	service.Inset(courses)
	.then(result => res.send({status : true}))
	.catch(err => { 
		console.error('err', err);
		res.send({status : false})
	})
})
.put((req, res) => {
	const courses = req.body;
	console.log('courses', courses)
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

router.route('/apply')
// 获取课程报名
.get((req, res) => {
	const courses = req.query.courses;
	service.getCourses(courses, result => res.send({data : result}))
})
.post((req, res) => {
	const {user, courses} = req.body;
	service.Apply(user, courses)
	.then((result) => {res.send({status : true, data : result})})
	.catch(err => {res.send({status : false})})
})
// 修改付款状态
.put((req, res) => {
	const {courses, item_id} = req.body;
	service.EditApply(courses, item_id)
	.then((result) => {res.send({status : true, data : result})})
	.catch(err => {res.send({status : false})})
})
.delete((req, res) => {
	const {courses, item_id} = req.body;
	service.DeleteApply(courses, item_id)
	.then((result) => {res.send({status : true, data : result})})
	.catch(err => {res.send({status : false})})
})

router.route('/apply/transfer')
.put((req, res) => {
	const {courses, transfer_id, item_id} = req.body;
	service.TransferApply(courses, transfer_id, item_id)
	.then((result) => {res.send({status : true, data : result})})
	.catch(err => {res.send({status : false})})
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

router.route('/download')
.get((req, res) => {
	service.toExcel(result => {
		console.log('result', result)
		res.send({result});
	})
})

module.exports = app => {
	app.use('/courses', router);
}