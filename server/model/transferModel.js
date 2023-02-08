"use strict";
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    type : {
        type: String,
        required: true,
    },
    from : {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    amount: {
        type: Number
    },
    tokenId: {
        type: Number,
        required: true,
    },
    txnHash: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: () => new Date()
    }

})

const transferModel = mongoose.model('transferevent', schema);

module.exports = transferModel;