"use strict";
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    NftId: {
        type: Number,
        required: true,
        unique: true
    },
    ipfs: {
        type: String,
        required: true
    },
     name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    uri: {
        type: String,
        required: true
    }
})

const nftSchema = mongoose.model('NFT', schema);

module.exports = nftSchema;