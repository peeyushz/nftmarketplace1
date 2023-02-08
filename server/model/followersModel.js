"use strict";
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    followedBy: {
        type: String,
        required: true,
    },
    followedTo: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: () => new Date()
    }


})

const Follower = mongoose.model('follower', schema);

module.exports = Follower;