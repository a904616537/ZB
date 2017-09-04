# 管理员模块帮助文档

@(Robin 零食项目)[管理员模块|API]

**API访问地址：** http://315b6d94.ngrok.io
> 会变更

-------------------

[TOC]

## 管理员账号密码登录

> 注：密码登录仅使用于微信登录未申请之前的替代方案，将被移除的模块。

<font color=red>请务必在下面的 api 前加上全局访问地址</font>

- [url] /login
- [method] post

#### 请求参数
``` json
{
	"username" : "String",
	"password" : "String"
}
```
#### 返回实例
``` json
{
  "status": true,
  "admin": {
    "_id": "58d8e1eca0c1e72b775da0bb",
    "name": "Kain Shi",
    "username": "username",
    "password": "338f7f950093e0c85074019fa0a5c74f",
    "key": "8wMNDxTMxUNqxgkuky9TzDg",
    "__v": 0,
    "createTime": "2017-03-27T09:56:55.308Z"
  }
}
```

## 管理员注册

> 此注册应该在登录完成后由管理员手动注册，不开放

- [url] /register
- [method] post

#### 请求参数
``` javascript
{
	name     : String,
	username : String,
	password : String
}
// return
{status : true}
```

####  登出

- [url] /logout
- [method] get

#### return
``` javascript
{status : true}
```

## 修改登录者密码

- [url] /admin
- [method] put

#### 请求参数
``` javascript
{
	username     : String,
	password     : String,
	new_password : String
}
// return
{status : true}
//or 
{status: false, err}
```


