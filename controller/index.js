const { userModel, adminModel } = require('../models/userModel');
const { contentModel } = require('../models/contentModel');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { verificationModel } = require('../models/verificationModel');
const svgCaptcha = require('svg-captcha');

const self = module.exports = {

    randomWord: (randomFlag, min, max) => {
        var str = "",
            range = min,
            arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

        // 随机产生
        if (randomFlag) {
            range = Math.round(Math.random() * (max - min)) + min;
        }
        for (var i = 0; i < range; i++) {
            pos = Math.round(Math.random() * (arr.length - 1));
            str += arr[pos];
        }
        return str;
    },

    createAdmin: async (ctx, next) => {
        const username = "admin", password = "QAZWSX123";
        const hash = crypto.createHmac('sha256', 'slat-256').update(password).digest('hex');

        let admin = await adminModel.findOneAndUpdate({ username }, { password: hash });
        if (!admin) {
            let user = new adminModel({
                username: username,
                password: hash
            });

            try {
                await user.save();
            } catch (error) {
                throw error;
            };
        };

        ctx.body = true;
    },

    verification: async (ctx, next) => {
        // let rand = self.randomWord(false, 6);
        let ip = ctx.request.ip;

        const cap = svgCaptcha.create({
            size: 4,
            noise: 2,
            height: 40,
            fontSize: 36,
            background: "#fff",
            ignoreChars: '0oO1ilI',
        });

        let img = cap.data;

        // ctx.cookies.set('cp', cap.text.toLocaleLowerCase());
        let verification = new verificationModel({
            verificationCode: cap.text.toLocaleLowerCase(),
            ip: ip
        });

        try {
            await verification.save()
        } catch (error) {
            throw error
        };
        ctx.type = 'image/svg+xml';
        ctx.body =  `${img}`
    },

    authBackend: async (ctx, next) => {
        let { username, password } = ctx.params;
        password = crypto.createHmac('sha256', 'slat-256').update(password).digest('hex');
        let admin = await adminModel.findOne({ username, password });
        if (admin) {
            let token = jwt.sign({
                exp: Date.now() / 1000 + (60 * 60 * 3),
                data: {
                    username, password
                }
            }, 'salt-256');

            ctx.body = {
                token: token
            };
        } else {
            throw '登陆信息有误';
        }
    },

    setNickName: async (ctx, next) => {
        let { nickName } = ctx.params;
        let user = await userModel.findOne({ nickName });
        if (user) {
            throw '昵称已存在'
        }

        user = new userModel({
            nickName: nickName
        });

        try {
            await user.save();
        } catch (error) {
            throw error;
        };

        ctx.body = { nickName };
    },

    // 处理上传文件
    upload: async (ctx, next) => {
        let content = {};

        try {

            if (ctx.req && ctx.req.file) {
                let content = {};

                const fileMsg = ctx.req.file;

                const fileName = fileMsg.filename;
                content.imageUrl = `/images/${fileName}`;

                let contentCraete = new contentModel(content);
                contentCraete = await contentCraete.save();
                if (!contentCraete) {
                    throw '上传失败'
                };

                ctx.body = {
                    imageUrl: contentCraete.imageUrl,
                    _id: contentCraete._id
                }
            } else {
                const { name, school, desc, _id } = ctx.params;

                let contentCraete = await contentModel.findByIdAndUpdate({ _id: _id }, { name, school, desc }, { new: true })

                if (!contentCraete) {
                    throw '存储失败'
                };

                ctx.body = {
                    msg: '上传成功',
                    name: contentCraete.name,
                    school: contentCraete.school,
                    desc: contentCraete.desc
                }
            };


        } catch (error) {
            throw error
        }
    },

    getPushContent: async (ctx, next) => {
        let { type } = ctx.params;
        type || (type = 3);

        let content;

        switch (Number(type)) {
            case 1:
                content = await contentModel.find({}).sort({ like: -1 });
                break;
            case 2:
                content = await contentModel.find({}).sort({ like: 1 });
                break;
            case 3:
                content = await contentModel.find({}).sort({ createdAt: -1 });
                break;
            case 4:
                content = await contentModel.find({}).sort({ createdAt: 1 });
                break;

            default:
                break;
        };

        ctx.body = {
            content
        }
    },

    like: async (ctx, next) => {
        let { id, code } = ctx.params;
        let likes

        try {
            let use = await verificationModel.findOne({ verificationCode: code, ip: ctx.request.ip });
            if (!use || use.use) {
                throw '验证码错误'
            }

            likes = await contentModel.findOneAndUpdate({ _id: id }, { $inc: { like: 1 } }, { new: true });
            // try {
            //     await verificationModel.findOneAndUpdate({ verificationCode: code }, { $set: { use: true } })
            // } catch (error) {
            //     likes = await contentModel.findOneAndUpdate({ _id: id }, { $inc: { like: -1 } }, { new: true });
            // }
            if (!likes) {
                console.log(likes)
                throw '记录不存在'
            }
        } catch (error) {
            throw error;
        }


        ctx.body = likes;
    },

    update: async (ctx, next) => {
        try {

            if (ctx.req && ctx.req.file) {
                let content = {};
                const { id } = ctx.req.body;
                console.log('更新图片');
                console.log(id);

                const fileMsg = ctx.req.file;

                const fileName = fileMsg.filename;
                content.imageUrl = `/images/${fileName}`;

                let result = await contentModel.findByIdAndUpdate({ _id: id }, { $push: { imageUrl: `/images/${fileName}` } }, { new: true });
                // let contentCraete = new contentModel(content);
                // contentCraete = await contentCraete.save();
                if (!result) {
                    throw '上传失败'
                };

                ctx.body = {
                    imageUrl: result.imageUrl
                }
            } else {
                console.log('更新内容')
                const { name, school, desc, id } = ctx.params;
                console.log(ctx.request);

                let contentCraete = await contentModel.findByIdAndUpdate(
                    { _id: id },
                    {
                        $set: {
                            name, school, desc
                        }
                    },
                    { new: true })

                if (!contentCraete) {
                    throw '存储失败'
                };

                ctx.body = {
                    msg: '上传成功',
                    name: contentCraete.name,
                    school: contentCraete.school,
                    desc: contentCraete.desc
                }
            };


        } catch (error) {
            throw error
        }
    },

    delete: async (ctx, next) => {
        try {
            await contentModel.findByIdAndRemove({ _id: ctx.params._id });
        } catch (error) {

        }
        let content = await contentModel.find({}).sort({ 'createdAt': -1 });

        ctx.body = {
            content
        }
    }
}