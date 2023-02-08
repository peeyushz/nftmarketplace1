"use strict";
const NftLike = require('../../model/nftLikeModel');
const Userdb = require('../../model/userModel');
const Validator = require('../validationController');

exports.addLikes = async(req, res) => {

    try {
        let data = Validator.checkValidation(req.body);
        if (data['success'] === true) {
            data = data['data'];
        } else {
            res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
        var LikedBy = data.likedby;
        var LikedTo = data.likedto;

        if (!LikedBy && !LikedTo) {
            res.status(202).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        } else {
            await Userdb.find({ _id: LikedBy }).countDocuments().then(async(UserData) => {
                if (UserData == 1) {
                    await NftLike.find({ likedByUser: LikedBy, likedToNft: LikedTo }).countDocuments().then((likedData) => {
                        if (likedData == 0) {
                            //Add New like
                            const Newlikes = new NftLike({
                                likedByUser: LikedBy,
                                likedToNft: LikedTo,
                            })

                            // save like in the database
                            Newlikes
                                .save(Newlikes)
                                .then(data => {
                                    res.status(200).send({ success: true, msg: "liked Successfully", data: {}, errors: '' });
                                })
                                .catch(err => {
                                    console.log(err)
                                    res.status(500).send({
                                        message: err.message || "Some error occurred while creating a create operation"
                                    });
                                });
                        } else {
                            return res.status(203).send({ success: false, msg: "Already liked", data: {}, errors: '' });
                        }
                    });

                } else {
                    return res.status(204).send({ success: false, msg: "There is some error While processing your Request", data: {}, errors: '' });
                }
            });
        }
    } catch (err) {
        console.log(err)
        console.error(err);
        res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}

exports.removeLikes = async(req, res) => {

    try {
        let data = Validator.checkValidation(req.body);
        if (data['success'] == true) {
            data = data['data'];
        } else {
            return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
        var LikedBy = data.likedby;
        var LikedTo = data.likedto;

        if (!LikedBy && !LikedBy) {
            return res.status(202).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        } else {
            await Userdb.find({ _id: LikedBy }).countDocuments().then(async(UserData) => {
                if (UserData == 1) {
                    await NftLike.findOneAndDelete({ likedByUser: LikedBy, likedToNft: LikedTo }).then((deletedData) => {
                            if (deletedData != null) {
                                return res.status(200).send({ success: true, msg: "Unliked Successfully", data: {}, errors: '' });
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

exports.countLikes = async(req, res) => {
    try {

        let data = Validator.checkValidation(req.query);
        if (data['success'] === true) {
            data = data['data'];
        } else {
            res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }

        var nftId = data.nftid;

        if (!nftId) {
            res.status(202).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        } else {
            await NftLike.find({ likedToNft: nftId }).countDocuments().then((likesNum) => {
                if (likesNum >= 0) {
                    res.status(200).send({ success: true, msg: "Found records", data: likesNum, errors: '' });
                } else {
                    res.status(203).send({ success: false, msg: "There is some issue ! please try again later", data: 0, errors: '' });
                }
            });

        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}

exports.checkLikes = async(req, res) => {
    try {

        let data = Validator.checkValidation(req.body);
        if (data['success'] === true) {
            data = data['data'];
        } else {
           return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }

        var nftId = data.nftid;
        var userId = data.userid;

        if (!nftId) {
            return res.status(202).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        } else {
            await NftLike.find({ likedByUser: userId, likedToNft: nftId }).countDocuments().then((data) => {
                if (data >= 0) {
                    return res.status(200).send({ success: true, msg: "Found records", data: data, errors: '' });
                } else {
                    return  res.status(203).send({ success: false, msg: "There is some issue ! please try again later", data: 0, errors: '' });
                }
            });

        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}