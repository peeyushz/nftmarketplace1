"use strict";
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    nftId: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    comments: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: () => new Date()
    }


})

const Report = mongoose.model('report', schema);

module.exports = Report;