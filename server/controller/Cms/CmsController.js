"use strict";
const CmsPages = require("../../model/cmsPagesModel");
const SocialModel = require("../../model/socialModel");

exports.getCmsData = async(req, res) => {
    try {
        const slug = req.params.slug || "";
        const cmsData = await CmsPages.findOne({ slug }).lean();
        if (cmsData && cmsData._id)
            res
            .status(200)
            .send({ success: true, msg: "", data: cmsData, errors: "" });
        else
            res.status(200).send({
                success: false,
                msg: "page doesn't exist",
                data: {},
                errors: "",
            });
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retriving page",
        });
    }
};

exports.getSocialLinks = async(req, res) => {
    try {
        console.log("here--");
        const socialLinks = await SocialModel.find().lean();
        res
            .status(200)
            .send({ success: true, msg: "", data: socialLinks, errors: "" });
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retriving page",
        });
    }
};