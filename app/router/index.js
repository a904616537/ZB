/*
 * Author: Kain·Altion <kain@foowala.com>
 * Module description: 路由配置
 */

'use strict';

var express = require('express'),
router      = express.Router();


router.get('/', (req, res, next) => {
	res.send('home')
})

module.exports = app => {
	app.use('/', router);
}