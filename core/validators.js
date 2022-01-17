let joi = require('joi');

exports.customerValidator = joi.object().keys({
    id: joi.string().required(),
    name: joi.string().required(),
    mobileNo: joi.string().length(10).required(),
    address: joi.string().optional()
}).unknown(true);

exports.itemValidator = joi.object().keys({
    id: joi.string().required(),
    itemName: joi.string().required(),
    description: joi.string(),
    mrp: joi.number().required(),
    srp: joi.number().required(),
    isActive: joi.boolean().required()
}).unknown(true);

exports.orderValidator = joi.object().keys({
    customerId: joi.string().length(24).required(),
    orderDate: joi.allow(),
    items: joi.allow(),
    totalAmount: joi.number().required()
}).unknown(true);

exports.addTransaction = joi.object().keys({
    customerId: joi.string().length(24).required(),
    date: joi.allow().required(),
    amount: joi.number().required(),
    transactionType: joi.string().required()
}).unknown(true);