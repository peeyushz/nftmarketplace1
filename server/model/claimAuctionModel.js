"use strict";
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    
    auctionId: {
        type: Number,
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
    txTime: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: () => new Date()
    }

})
const auctionClaimedModel = mongoose.model('auctionClaimedevent', schema);

module.exports = auctionClaimedModel;