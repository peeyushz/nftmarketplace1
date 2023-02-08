"use strict";
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    auctionId: {
        type: Number,
        required: true,
    },
    bidder: {
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
        unique:true,
    },
    txTime: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: () => new Date()
    }

})

const cancelBidModel = mongoose.model('cancelbidevent', schema);

module.exports = cancelBidModel;