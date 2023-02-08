"use strict";
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    likedByUser: {
        type: String,
        required: true,
    },
    likedToNft: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: () => new Date()
    }
})

const NftLike = mongoose.model('nftLike', schema);

module.exports = NftLike;