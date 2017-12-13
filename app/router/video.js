/*
 * Author: Kain·Altion <kain@foowala.com>
 */

'use strict';

var express  = require('express'),
service      = require('../service/video.service'),
user_service = require('../service/user.service'),
help         = require('../helper/page.help.js'),
moment       = require('moment'),
router       = express.Router();


router.route('/')
.get((req, res) => {
	let { page, per_page, sort, query } = req.query;
	page     = parseInt(page);
	per_page = parseInt(per_page);
	service.getList(page, per_page, sort, (videos, count) => {
		let { total, last_page, next_page_url, prev_page_url} = help.calculate(page, per_page, count, '/video?query=' + query);
		res.send({data: videos, current_page: page, total, per_page, last_page, next_page_url, prev_page_url })
	})
})
.post((req, res) => {
	const video = req.body;
	service.Inset(video)
	.then(result => res.send({status : true}))
	.catch(err => { 
		console.error('err', err);
		res.send({status : false})
	})
})
.put((req, res) => {
	const video = req.body;
	service.Update(video)
	.then(result => res.send({status : true}))
	.catch(err => {
		console.error('err', err);
		res.send({status : false})
	})
})
.delete((req, res) => {
	const video = req.body;
	service.Delete(video)
	.then(result => res.send({status : true}))
	.catch(err => { 
		console.error('err', err);
		res.send({status : false})
	})
})

router.route('/download')
.get((req, res) => {
	const {video, user_id} = req.query;
	console.log('video', video)
	service.SelectById(video)
	.then(v => {
		if(!v) {
			res.send({status : false, msg : '文件不存在！'});
			return;
		}


		user_service.setUserVideo(user_id, v._id)
		.then(() => {})

		const filename = v.path.split('/').pop(),
			suffix     = filename.split('.').pop(),
			url        = 'http://image.mybarrefitness.com/download';
			// url        = 'http://localhost:8082/download';
		res.redirect(url + '?path=' + filename + '&name=' + v.name + '.' + suffix);
	})
	.catch(err => res.send({status : false, err}))
})

router.route('/level/:level')
.get((req, res) => {
	const {level} = req.params;
	service.getVideoForLevel(level)
	.then(videos => {
		res.send({status : true, videos})
	})
	.catch(err => res.send({status : false}))
})


module.exports = app => {
	app.use('/video', router);
}