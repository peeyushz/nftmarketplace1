"use strict";
const Report = require('../../model/reportModel');
const Validator = require('../validationController');
var Userdb = require('../../model/userModel');

exports.addReport = async(req, res) => {
    try {
        let data = Validator.checkValidation(req.body);
        if (data['success'] === true) {
            data = data['data'];
        } else {
            return res.status(300).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }

        let userId = data.userid;
        let nftId = data.nftid;
        let reason = data.reason;
        let comments = data.comments;

        Userdb.findOne({ _id: userId }).countDocuments().then((userData) => {

            if (userData != null) {
                //New report
                const NewReport = new Report({
                    userId: userId,
                    nftId: nftId,
                    reason: reason,
                    comments: comments
                })
                NewReport.save(NewReport).then((Reportdata) => {
                    res.status(200).send({ success: true, msg: "Report added successfully", data: '', errors: '' });
                }).catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while creating a create operation"
                    });
                })
            } else {
                res.status(202).send({ success: false, msg: "user Not found", data: '', errors: '' });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}