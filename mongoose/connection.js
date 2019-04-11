//require mongoose module
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

//export this function and imported by server.js
module.exports = function () {

    mongoose.connect('mongodb://127.0.0.1:27017/vote', { useNewUrlParser: true });

    // if (!config["mongodb.user"]) {
    // mongoose.connect(config["mongodb.dbURL"], { useNewUrlParser: true });
    // } else {
    //     mongoose.connect(config["mongodb.dbURL"], { auth: { authdb: "admin" }, user: config["mongodb.user"], pass: config["mongodb.password"], useNewUrlParser: true });
    // }

    autoIncrement.initialize(mongoose.connection);

    // mongoose.connection.on('connected', function () {
    //     logger.info("Mongoose default connection is open to ", config["mongodb.dbURL"]);
    // });

    // mongoose.connection.on('error', function (err) {
    //     logger.info("Mongoose default connection has occured " + err + " error " + config["mongodb.dbURL"]);
    // });

    // mongoose.connection.on('disconnected', function () {
    //     logger.info("Mongoose default connection is disconnected" + config["mongodb.dbURL"]);
    // });

    // process.on('SIGINT', function () {
    //     mongoose.connection.close(function () {
    //         logger.info(termination("Mongoose default connection is disconnected due to application termination"));
    //         process.exit(0)
    //     });
    // });
}