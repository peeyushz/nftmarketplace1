"use strict";
const Follower = require('../../model/followersModel');
const Userdb = require('../../model/userModel');
const Validator = require('../validationController');
const mail = require('../mailSender/mailSender');	
const userinfo = mail.getuserData;	
const mailSender = mail.mailSender;	

async function followMail(followedBy, followedTo){  
    let follower = await userinfo(followedBy);
    let following = await userinfo(followedTo);

    if(typeof(follower) == 'object' && typeof(following)=='object'){
        if(following.notification && 'followers' in (JSON.parse(following.notification)) && (JSON.parse(following.notification)).followers==true){
            let htmlContent = "<p>Congratulations "+following.displayName+",</p><p>"+follower.displayName+" is start following you</p>";
            var subject = "Follower added";
            var to_mail = following.email;
            mailSender(to_mail,subject,htmlContent)
        }
        
    }   
}


exports.addFollwer = async(req, res) => {

    try {
        let data = Validator.checkValidation(req.body);
        if (data['success'] === true) {
            data = data['data'];
        } else {
            res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
        var followedBy = data.followedby;
        var followedTo = data.followedto;

        if (!followedBy && !followedTo) {
            res.status(206).send({ success: false, msg: "Followed Successfully", data: {}, errors: '' });
        }else if(followedBy == followedTo){
            res.status(205).send({ success: false, msg: "Can't follow own account", data: {}, errors: '' });
        } else {
            // followedBy = `Object(${followedBy})`;
            // followedTo = `Object(${followedTo})`;
            
            await Userdb.find({ _id: { $in: [followedBy, followedTo] } }).countDocuments().then(async(UserData) => {
                if (UserData == 2) {
                    await Follower.find({ followedBy: followedBy, followedTo: followedTo }).countDocuments().then((follwedData) => {
                        if (follwedData == 0) {
                            //new follower
                            const Newfollwer = new Follower({
                                followedBy: followedBy,
                                followedTo: followedTo,
                            })

                            // save follower in the database
                            Newfollwer
                                .save(Newfollwer)
                                .then(data => {
                                    followMail(followedBy, followedTo)
                                    res.status(200).send({ success: true, msg: "Followed Successfully", data: {}, errors: '' });
                                })
                                .catch(err => {
                                    res.status(500).send({
                                        message: err.message || "Some error occurred while creating a create operation"
                                    });
                                });
                        } else {
                            return res.status(203).send({ success: false, msg: "Already Followed", data: {}, errors: '' });
                        }
                    });

                } else {
                    return res.status(204).send({ success: false, msg: "There is some error While processing your Request", data: {}, errors: '' });
                }
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}

exports.removeFollwer = async(req, res) => {

    try {
        let data = Validator.checkValidation(req.body);
        if (data['success'] == true) {
            data = data['data'];
        } else {
            return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
        var followedBy = data.followedby;
        var followedTo = data.followedto;

        if (!followedBy && !followedTo) {
            return res.status(202).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        } else {
            await Userdb.find({ _id: { $in: [followedBy, followedTo] } }).countDocuments().then(async(UserData) => {
                if (UserData == 2) {
                    await Follower.findOneAndDelete({ followedBy: followedBy, followedTo: followedTo }).then((deletedData) => {
                            if (deletedData != null) {
                                return res.status(200).send({ success: true, msg: "Unfollowed Successfully", data: {}, errors: '' });
                            } else {
                                return res.status(203).send({ success: false, msg: "Found no record", data: {}, errors: '' });
                            }
                        })
                        .catch(err => {
                            res.status(500).send({
                                message: err.message || "Some error occurred while creating a create operation"
                            });
                        });
                } else {
                    return res.status(204).send({ success: false, msg: "There is some error While processing your Request", data: {}, errors: '' });
                }
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}

exports.countFollwer = async(req, res) => {
    try {
        let data = Validator.checkValidation(req.query);
        if (data['success'] === true) {
            data = data['data'];
        } else {
            return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
        var userId = data.userid;
        if (!userId) {
            return res.status(202).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        } else {
            await Userdb.find({ _id: userId }).countDocuments().then(async(userData) => {
                if (userData == 1) {
                    await Follower.find({ followedTo: userId }).countDocuments().then(async(followerNum) => {
                        if (followerNum >= 0) {
                            return res.status(200).send({ success: true, msg: "Found records", data: followerNum, errors: '' });
                        } else {
                            return res.status(203).send({ success: false, msg: "No follower found", data: 0, errors: '' });
                        }
                    });
                } else {
                    return res.status(204).send({ success: false, msg: "User Not found", data: 0, errors: '' });
                }
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}

exports.checkFollwer = async(req, res) => {
    try {
        let data = Validator.checkValidation(req.query);
        if (data['success'] === true) {
            data = data['data'];
        } else {
            return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
        let userId = data.userid;
        let profileId = data.profileid;
        if (!userId && !profileId) {
            return res.status(202).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        } else {
            await Userdb.find({ _id: {$in:[userId, profileId]} }).countDocuments().then(async(userData) => {
                if (userData == 2) {
                    await Follower.find({followedTo:profileId, followedBy:userId}).countDocuments().then(async(followerNum) => {
                        if (followerNum == 1) {
                            return res.status(200).send({ success: true, msg: "followed", data: followerNum, errors: '' });
                        } else {
                            return res.status(203).send({ success: false, msg: "No follower found", data: 0, errors: '' });
                        }
                    });
                } else {
                    return res.status(204).send({ success: false, msg: "User Not found", data: 0, errors: '' });
                }
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}