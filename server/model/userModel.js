"use strict";
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    profileImage: {
        type: String,
        required: true
    },
    socialMedia: {
        type: Object
    },
    notification: {
        type: Object
    },
    date: {
        type: Date,
        default: new Date()
    },
    updateTime: {
        type: Date
    },
    address: {
        type: String
    }

})

const Userdb = mongoose.model('userdb', schema);

module.exports = Userdb;