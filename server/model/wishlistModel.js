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
    date: {
        type: Date,
        default: () => new Date()
    }
})

const Wishlist = mongoose.model('wishlist', schema);

module.exports = Wishlist;