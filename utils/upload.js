const multer = require('koa-multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (ctx, file, cd) => {
        cd(null, path.resolve(__dirname, '../public/images'));
    },
    filename: (ctx, file, cd) => {
        cd(null, Date.now() + '-' + file.originalname);
    }
});

module.exports.upload = multer({ storage });