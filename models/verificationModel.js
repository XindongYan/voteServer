const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let verificationSchema = new Schema({
    verificationCode: { type: String },
    ip: { type: String },
    use: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports.verificationModel = mongoose.model('verification', verificationSchema);