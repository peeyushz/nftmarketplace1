"use strict";
const mongoose = require('mongoose');

var schema = new mongoose.Schema({
    
    uri: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: () => new Date()
    }

})

const BaseUri = mongoose.model('baseUri', schema);

module.exports = BaseUri;