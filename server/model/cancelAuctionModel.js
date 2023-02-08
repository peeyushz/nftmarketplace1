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
    txTime: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: () => new Date()
    }

})

const cancelAuctionModel = mongoose.model('cancelAuctionModel', schema);

module.exports = cancelAuctionModel;