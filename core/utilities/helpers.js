var CryptoJS = require('crypto-js');
let jwt = require('jsonwebtoken');
let response = require('./response');
let orderNumberModel = require('./../../models/order.numbers');

Number.prototype.pad = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
}

exports.createOrderNo = async () => {
    let lastOrderNo = await orderNumberModel.find();
    let newOrderNo = "";
    if (lastOrderNo.length == 1) {
        let a = await orderNumberModel.findOneAndUpdate({
            orderNo: lastOrderNo[0].orderNo
        }, { orderNo: (lastOrderNo[0].orderNo + 1) }, { new: true });
        newOrderNo = `${a.prefix}-${(a.orderNo).pad(6)}`;
    } else {
        let firstOrder = await orderNumberModel.create({
            orderNo: 1,
            prefix: "#ORD"
        });
        newOrderNo = `${firstOrder.prefix}-${(firstOrder.orderNo).pad(6)}`;
    }
    return newOrderNo;
}

exports.generateAccessToken = (userData) => {
    return jwt.sign(userData, process.env.SESSION_KEY, { expiresIn: process.env.LOGIN_EXP_IN_DAYS + 'd' });
}

exports.authenticated = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const token = bearer[1];
        jwt.verify(token, process.env.SESSION_KEY, (err, auth) => {
            if (err) {
                return response.unauthorisedRequest(res);
            } else {
                req.token = auth;
            }
        });
        next();
    } else {
        return response.unauthorisedRequest(res);
    }
}

exports.encryptPassword = async (plainPassword) => {
    var encLayer1 = CryptoJS.AES.encrypt(plainPassword, process.env.PASSWORD_KEY).toString();
    var encLayer2 = CryptoJS.DES.encrypt(encLayer1, process.env.PASSWORD_KEY).toString();
    var finalEncPassword = CryptoJS.TripleDES.encrypt(encLayer2, process.env.PASSWORD_KEY).toString();
    return finalEncPassword;
}

exports.decryptPassword = async (encryptedPassword) => {
    var decLayer1 = CryptoJS.TripleDES.decrypt(encryptedPassword, process.env.PASSWORD_KEY);
    var deciphertext1 = decLayer1.toString(CryptoJS.enc.Utf8);

    var decLayer2 = CryptoJS.DES.decrypt(deciphertext1, process.env.PASSWORD_KEY);
    var deciphertext2 = decLayer2.toString(CryptoJS.enc.Utf8);

    var decLayer3 = CryptoJS.AES.decrypt(deciphertext2, process.env.PASSWORD_KEY);
    var finalDecPassword = decLayer3.toString(CryptoJS.enc.Utf8);
    return finalDecPassword;
}