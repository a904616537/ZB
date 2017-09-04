/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: admin 路由配置
 */

'use strict';

var express = require('express'),
router      = express.Router(),
moment      = require('moment'),
jwt         = require('jwt-simple'),
help        = require('../helper/page.help.js'),
service     = require('../service/admin.service')

router.route('/admin')
.get((req, res) => {
	let { page, per_page, sort } = req.query;
	page     = parseInt(page);
	per_page = parseInt(per_page);

	service.getAdmin(page, per_page, sort, (admins, count) => {
		let { total, last_page, next_page_url, prev_page_url} = help.calculate(page, per_page, count, '/admin');
		res.send({data: admins, current_page: page, total, per_page, last_page, next_page_url, prev_page_url })
	});
})
.put((req, res) => {
	const admin = {
		username     : req.body.username,
		password     : req.body.password,
		new_password : req.body.new_password
	}
	service.editorPassword(admin)
	.then(() => res.send({status: true}))
	.catch(err => res.send({status: false, err}))
})
.delete((req, res) => {
	const _id = req.body._id;
	service.delAdmin(_id)
	.then(result => res.send({status : result}))
	.catch(result => res.send({status : false}))
})

router.route('/admin/:username')
.put((req, res) => {
	const admin = {
		username     : req.params.username,
		new_password : req.body.new_password
	}
	service.editorPasswordFroAdmin(admin)
	.then(() => res.send({status: true}))
	.catch(err => res.send({status: false, err}))
})


router.route('/login')
.post((req, res) => {
	const admin = {
		username : req.body.username,
		password : req.body.password
	}
	console.log('admin', admin)
	service.login(admin)
	.then(admin => {
		const expires  = moment().add('minutes', 1).valueOf();
		admin.identity = 'admin';
		admin.password = '';
		admin.key      = '';
		const token = jwt.encode({
			iss : admin,
			exp : expires
		}, 'robin');
		res.send({status: true, token, expires, admin})
	})
	.catch(err => res.send({status: false, err}))
})

router.route('/logout')
.get((req, res) => {
	res.send({status:true})
})

router.route('/register')
.post((req, res) => {
	const admin = {
		name     : req.body.name,
		username : req.body.username,
		password : req.body.password
	}
	
	service.register(admin)
	.then(() => res.send({status: true}))
	.catch(err => res.send({status: false, err}))
})


module.exports = app => {
	app.use('/admin', router);
}