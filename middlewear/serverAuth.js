const jwt = require('jsonwebtoken');
const { adminModel } = require('../models/userModel');

module.exports = function () {
    return async function (ctx, next) {
        let callback = await jwt.verify(ctx.headers.authorization, 'salt-256');
        let { username, password } = callback.data;

        let admin = await adminModel.findOne({ username, password });
        if (!admin) {
            ctx.body = {
                code: 403,
                msg: '验证错误'
            }
        } else {
            await next();
            return;
        }

    }
}