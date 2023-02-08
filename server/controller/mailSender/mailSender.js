"use strict";
const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer');
const NFT = require('../../model/nftModel');
const Userdb = require('../../model/userModel');
var counter = 0;
exports.nftData = async(nftId) => {
    try {
        return new Promise(async(resolve, reject)=>{
            if (nftId) {
               await NFT.find({ NftId: { $in: nftId } }).then(async(data) => {
                    resolve(data);
                })
            } else {
               reject();
            }
        })
        
    } catch (e) {
        console.error(e)
        reject();
    }

}

exports.getSeller =  async(add) => {
    try {
        return new Promise(async(resolve, reject)=>{
            await Userdb.find({ address : add }).then(async(data) => {
                if (data) {
                    resolve(data);
                } else if(data == null) {
                    resolve(add);
                }else{
                    reject();
                }
            })
        })
    } catch (err) {
        console.error(e)
        reject();
    }
}

exports.mailSender = (to_mail, subj, htmlBody) => {
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
            console.log(mailOptons);	
            console.log(transporter);	

            transporter.sendMail(mailOptions, async function(error, info) {
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

exports.getuserData = async( userid ) => {
    try {
        return new Promise(async (resolve,reject)=>{
            await Userdb.findOne({ _id: userid }).then(async(data) => {
                if (data) {
                    resolve(data)
                }
            });
        })
        
    } catch (err) {
        console.log(err)
    }
}

