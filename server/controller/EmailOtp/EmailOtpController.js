"use strict";
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const Validator = require('../validationController');
var Userdb = require('../../model/userModel');
var otpModel = require('../../model/otpModel');

var counter = 0;

function send_mails(to_mail, subj, htmlBody) {
    try {
        return new Promise(function(Resolve, Reject) {
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.mail_from,
                    pass: process.env.mail_pass
                }
            });
            var mailOptions = {
                from: process.env.mail_from,
                to: to_mail,
                subject: subj,
                html: htmlBody
            };

            transporter.sendMail(mailOptions, async function(info, error) {
                counter++
                console.log('info', info)
                console.log('error', error)
                setTimeout(() => { Resolve(true); }, 3000);
            })
        })
    } catch (err) {
        console.error(err);
    }
}


async function otp_gen(email, otp, htmlContent) {
    if (email != '' && otp != '') {
        await otpModel.findOneAndUpdate({ email: email }, { $set: { otp: otp, date: new Date() } }, { upsert: true });
        return await send_mails(email, "One Time Password", htmlContent);
    } else {
        if (counter <= 3) {
            return await send_mails(email, "One Time Password", htmlContent);
        } else {
            return false;
        }
    }
};



exports.otpVerify = async(req, res) => {
    try {
        let data = Validator.checkValidation(req.query);
        if (data['success'] === true) {
            data = data['data'];
        } else {
            res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
        var Email = data.email;
        await otpModel.findOneAndDelete({ email: Email }).then(async(data) => {
            console.log(data);
            if (data) {
                return res.status(200).send({ success: true, msg: "success", data: data, errors: '' });
            } else {
                return res.status(203).send({ success: false, msg: "Something goes wrong ! Please try again later", data: '', errors: '' });
            }
        });
    } catch (err) {
        console.log(err)
        console.error(err);
        res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}

exports.registerEmailVerification = async(req, res) => {
    try {
        let data = Validator.checkValidation(req.body);
        if (data['success'] === true) {
            data = data['data'];
        } else {
            res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
        var Email = data.email;
        const emailName = Email.split("@");
        //checking whether user exist or not
        await Userdb.findOne({ email: Email }).countDocuments().then(async(userData) => {

            if (userData == 0) {

                await otpModel.findOne({ email: Email }).then(async(otpData) => {
                    if (otpData) {
                        let lastOtpDate = otpData.date;
                        var stamp = parseInt((new Date(lastOtpDate).getTime()) / 1000);
                        var currentStamp = parseInt((new Date().getTime()) / 1000);
                        if (stamp + 120 < currentStamp) {
                            let otp = Math.floor(Math.random() * 8999) + 1000;
                            let date = new Date();
                            let htmlContent = "<p>Hi "+emailName[0]+",</p><p>Verify your email to finish signing up with Codebird NFT Marketplace. Use the following verification code.</p>";
                            htmlContent = htmlContent + "<h1>" + otp + "</h1><p>The verification code is valid for 30 minutes.</p><p>Team Codebird</p>";
                            if (await otp_gen(Email, otp,htmlContent)) {
                                currentStamp = parseInt((new Date().getTime()) / 1000);
                                return res.status(200).send({ success: true, msg: "success", data: otp, time: currentStamp, errors: '' });
                            } else {
                                return res.status(202).send({ success: false, msg: "There is some problem while sending the mail please try again letter", data: '', errors: '' });
                            }
                        } else {
                            return res.status(203).send({ success: false, msg: "Wait...", time: stamp, errors: '' });
                        }
                    } else {
                            let otp = Math.floor(Math.random() * 8999) + 1000;
                            let date = new Date();
                            let htmlContent = "<p>Hi "+emailName[0]+"</p><p>Verify your email to finish signing up with Codebird NFT Marketplace. Use the following verification code.</p>";
                            htmlContent = htmlContent + "<h1>" + otp + "</h1><p>The verification code is valid for 30 minutes.</p><p>Team Codebird</p>";
                            if (await otp_gen(Email, otp,htmlContent)) {
                                currentStamp = parseInt((new Date().getTime()) / 1000);
                                return res.status(200).send({ success: true, msg: "success", data: otp, time: currentStamp, errors: '' });
                            } else {

                                return res.status(202).send({ success: false, msg: "There is some problem while sending the mail please try again letter", data: '', errors: '' });
                            }
                    }
                });
            } else {
                return res.status(202).send({ success: false, msg: "Email already registered ! please try with a new email", data: '', errors: '' });
            }

        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}

exports.forgetPasswordVerification = async(req, res) => {
    try {
        let data = Validator.checkValidation(req.body);
        if (data['success'] === true) {
            data = data['data'];
        } else {
            res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
        var Email = data.email;

        //checking whether user exist or not
        await Userdb.findOne({ email: Email }).countDocuments().then(async(userData) => {
            if (userData==1) {
                let userDetails = await Userdb.findOne({ email: Email });
                await otpModel.findOne({ email: Email }).then(async(otpData) => {
                    if (otpData) {
                        let lastOtpDate = otpData.date;
                        var stamp = parseInt((new Date(lastOtpDate).getTime()) / 1000);
                        var currentStamp = parseInt((new Date().getTime()) / 1000);
                        if (stamp + 120 < currentStamp) {
                            let otp = Math.floor(Math.random() * 8999) + 1000;
                            let date = new Date();
                            let htmlContent = "<p>Hi "+userDetails.displayName+"</p><p>You have requested to reset your password for your account . Use the following verification code.</p>";
                            htmlContent = htmlContent + "<h1>" + otp + "</h1><p>The verification code is valid for 30 minutes.</p><p>Team Coebird</p>";
                            if (await otp_gen(Email, otp,htmlContent)) {
                                currentStamp = parseInt((new Date().getTime()) / 1000);
                                return res.status(200).send({ success: true, msg: "success", data: otp, time: currentStamp, errors: '' });
                            } else {

                                return res.status(202).send({ success: false, msg: "There is some problem while sending the mail please try again letter", data: '', errors: '' });
                            }
                        } else {
                            return res.status(203).send({ success: false, msg: "Wait...", time: stamp, errors: '' });
                        }
                    } else {
                            let otp = Math.floor(Math.random() * 8999) + 1000;
                            let date = new Date();
                            let htmlContent = "<p>Hi "+userDetails.displayName+"</p><p>You have requested to reset your password for your account . Use the following verification code.</p>";
                            htmlContent = htmlContent + "<h1>" + otp + "</h1><p>The verification code is valid for 30 minutes.</p><p>Team Codebird</p>";
                            if (await otp_gen(Email, otp,htmlContent)) {
                                currentStamp = parseInt((new Date().getTime()) / 1000);
                                return res.status(200).send({ success: true, msg: "success", data: otp, time: currentStamp, errors: '' });
                            } else {

                                return res.status(202).send({ success: false, msg: "There is some problem while sending the mail please try again letter", data: '', errors: '' });
                            }
                    }
                });
            } else {
                res.status(202).send({ success: false, msg: "Invalid Email! Please Register", data: '', errors: '' });
            }

        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}