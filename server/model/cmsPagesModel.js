"use strict";
const mongoose = require("mongoose");
var Schema = mongoose.Schema;

// create a schema
var cms = new Schema({
    name: { type: String, required: true },
    content: { type: String },
    slug: { type: String, required: true },
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
}, );

const CmsPages = mongoose.model("cms_pages", cms);

module.exports = CmsPages;