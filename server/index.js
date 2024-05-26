'use strict'

/**
 * Module dependencies.
 */

const express = require('express');
const base64url = require('base64url');
const session = require('express-session');
const uuid = require('uuid').v4;
const cbor = require('node-cbor')

const app = module.exports = express();
const { findOne, insertOne, findRegister, updateOne, createOneForPasskey, findOneByExternalId } = require('./db')

// 解析JSON类型的请求体
app.use(express.json());

// 解析URL编码类型的请求体（通常用于POST表单数据）
app.use(express.urlencoded({ extended: true }));

// session
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));


// Passport
const PassportService = require('./services/passport-service')
const SessionChallengeStore =
    require('passport-fido2-webauthn').SessionChallengeStore

const passportService = new PassportService()
const store = new SessionChallengeStore()

passportService.init(store)


const RESPONSE = {
    success: true,
    data: null,
    code: 200
}

// 登陆
app.post('/api/login', function (req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(401).send({
            ...RESPONSE,
            code: 401
        })
    }
    const item = findOne({ email, password })
    const { pwd, ...rest } = item || {};
    res.send({
        ...RESPONSE,
        msg: item ? '' : '用户登陆错误',
        data: item ? rest : null,
        success: false
    });
});


// 注册
app.post('/api/register', function (req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(401).send({
            ...RESPONSE,
            code: 401
        })
    }
    const item = findRegister({ email })
    if (item) {
        res.status(200).send({
            ...RESPONSE,
            code: 401,
            msg: '用户已存在',
            success: false
        });
    }
    insertOne({ email, password })
    res.send({
        ...RESPONSE,
        msg: '注册成功',
        data: { email, password },
        success: true
    });
});

// 创建 challenge
app.post('/api/register/public-key/challenge', function (req, res) {
    const user = {
        id: uuid({}, Buffer.alloc(16)),
        name: req.body.email,
    }

    const { response, id, email } = req.body

    // parse the string as an object
    const clientDataJSON = JSON.parse(base64url.decode(response.clientDataJSON))

    const { challenge } = clientDataJSON

    createOneForPasskey({
        public_key: challenge,
        external_id: id,
        email,
    })
    res.send({
        ...RESPONSE,
        data: { email }, success: true
    })
})

// 获取 challenge
app.post('/api/login/public-key/challenge', function (req, res) {
    store.challenge(req, (err, challenge) => {
        if (err) {
            console.log('error===', err)
        }
        res.json({ ...RESPONSE, data: { challenge: base64url.encode(challenge) } })
    })
})

// passkey 登陆
app.post('/api/login/public-key', function (req, res) {
    const { response, id } = req.body
    const authPasskey = findOneByExternalId(id);

    if (!authPasskey) {
        res.send({
            ...RESPONSE,
            msg: '无效的key'
        })
    }
    const { email } = authPasskey;

    const newUser = findRegister({ email });

    if (!newUser) {
        res.send({
            ...RESPONSE,
            msg: '未查询到用户'
        })
    }

    res.send({
        ...RESPONSE,
        data: newUser
    })
})


// regular middleware.
app.use(function (err, req, res, next) {
    // whatever you want here, feel free to populate
    // properties on `err` to treat it differently in here.
    res.status(err.status || 500);
    res.send({ error: err.message });
});

// our custom JSON 404 middleware. Since it's placed last
app.use(function (req, res) {
    res.status(404);
    res.send({ error: "Sorry, can't find that" })
});

/* istanbul ignore next */
if (!module.parent) {
    app.listen(3000);
    console.log('Express started on port 3000');
}