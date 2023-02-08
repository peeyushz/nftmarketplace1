"use strict";
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    buyer: {
        type: String,
        required: true,
    },
    nftId: {
        type: Number,
        required: true,
    },
    txHash: {
        type: String,
        required: true,
        unique : true,
    },
    amount: {
        type: Number,
        required: true
    },
    buyTime: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: () => new Date()
    }

})

const eventModel = mongoose.model('Allevent', schema);

module.exports = eventModel;