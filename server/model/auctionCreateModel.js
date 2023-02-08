"use strict";
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    
    auctionId: {
        type: Number,
        required: true,
    },
    seller: {
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
    amount: {
        type: Number,
        required: true
    },
    startTime: {
        type: Number,
        required: true
    },
    endTime: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: () => new Date()
    }

})

const auctionCreateModel = mongoose.model('createAuctionEvent', schema);

module.exports = auctionCreateModel;