/*
 * Author: Kain <kain@foowala.com> (https://github.com/a904616537)
 * Last Update (author): kain shi <kain@foowala.com> (https://github.com/a904616537)
 */
'use strict';

const express = require('express'),
config        = require('./setting/config'),
mongoose      = require('mongoose'),
http          = require('http'),
socket        = require('socket.io'),
glob          = require('glob'),
mongodb       = require('mongodb'),
proxy         = require('express-http-proxy'),
MongoClient   = mongodb.MongoClient;

// Mongodb 预加载
const models = glob.sync(config.root + '/app/models/*.js')
models.forEach(model => {
    console.log('Loading Mongodb model：' + model);
    require(model);
})

const app        = express();
const httpServer = http.Server(app);
const io         = socket(httpServer);

global.socket = io;


// 应用程序加载
require('./setting/express')(app, config);

// 应用程序启动 config.mongo.db
require('./app/service/mongodb.client');


httpServer.listen(config.port, () => console.log('Express server listening on port ' + config.port))

