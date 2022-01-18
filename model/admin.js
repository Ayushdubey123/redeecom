const mongoose = require('mongoose');

let adminSchema = new  mongoose.Schema({
    name: {
        type: String,
        default: '',
    } ,
    email: {
        type: String,
        default: '',
    },
    passwrod: {
        type: String,
        default:  '',
    }
},{timestamps: true});

const adminModel = mongoose.model('admin', adminSchema);


module.exports = {
    adminModel
}