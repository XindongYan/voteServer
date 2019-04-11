const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let userSchema = new Schema({
    nickName: { type: String }
}, {
    timestamps: true
});

let adminSchema = new Schema({
    username: { type: String },
    password: { type: String }
}, {
    timestamps: true
});

module.exports.adminModel = mongoose.model('admin', adminSchema);

module.exports.userModel = mongoose.model('user', userSchema);