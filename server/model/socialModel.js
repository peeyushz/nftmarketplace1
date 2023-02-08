"use strict";
const mongoose = require("mongoose");
var Schema = mongoose.Schema;

// create a schema
var social = new Schema({
    name: { type: String, required: true },
    link: { type: String },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
}, );

const SocialModel = mongoose.model("socials", social);

module.exports = SocialModel;