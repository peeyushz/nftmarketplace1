const Wishlist = require('../../model/wishlistModel');
const Userdb = require('../../model/userModel');
const Validator = require('../validationController');

exports.addInWishlist = async (req, res)=>{

    try {
        let data = Validator.checkValidation(req.body);
            if (data['success'] === true) {
                data = data['data'];
            } else {
                res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
            }
            var userId = data.userid;
            var nftId = data.nftid;

        if(!userId && !nftId){
            res.status(202).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }else{
            await Userdb.find({_id : userId}).countDocuments().then(async(UserData) => {
                if(UserData == 1){
                    await Wishlist.find({ userId: userId, nftId: nftId}).countDocuments().then((likedData) => {
                        if(likedData == 0){
                            //new record
                            const NewWishlist = new Wishlist({
                                userId : userId,
                                nftId : nftId, 
                            })
    
                            // add wishlist into database
                            NewWishlist
                                .save(NewWishlist)
                                .then(data => {
                                    res.status(200).send({success: true, msg: "Added into Wishlist", data:{}, errors: ''});
                                })
                                .catch(err =>{
                                    res.status(500).send({
                                        message : err.message || "Some error occurred while creating a create operation"
                                    });
                                });
                        }else{
                            return res.status(203).send({ success: false, msg: "Already in wishlist", data: {}, errors: '' });
                        }
                    });
                    
                }else{
                    return res.status(204).send({ success: false, msg: "There is some error While processing your Request", data: {}, errors: '' });
                }  
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}

exports.removeFromWishlist = async (req, res)=>{

    try {
        let data = Validator.checkValidation(req.body);
            if (data['success'] == true) {
                data = data['data'];    
            } else {
                return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
            }
            var userId = data.userid;
            var nftId = data.nftid;

        if(!userId && !nftId){
            return res.status(202).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }else{
            await Userdb.find({_id : userId}).countDocuments().then(async(UserData)=>{
                if(UserData == 1){
                    await Wishlist.findOneAndDelete({userId: userId, nftId: nftId}).then((deletedData)=>{
                        if(deletedData != null){
                            return res.status(200).send({ success: true, msg: "Removed from Wishlist", data: {}, errors: '' });
                        }else{
                            return res.status(203).send({ success: false, msg: "Found no record", data: {}, errors: '' });
                        }
                    })
                    .catch(err =>{
                        res.status(500).send({
                            message : err.message || "Some error occurred while creating a create operation"
                        });
                    });
                    
                    
                }else{
                    return res.status(204).send({ success: false, msg: "There is some error While processing your Request", data: {}, errors: '' });
                }  
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}

exports.wishlistData = async (req, res) => {

    try {
        let data = Validator.checkValidation(req.query);
            if (data['success'] == true) {
                data = data['data'];    
            } else {
                return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
            }
            var userId = data.userid;

        if(!userId){
            return res.status(202).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }else{
            await Userdb.find({_id : userId}).countDocuments().then(async(UserData)=>{
                if(UserData == 1){
                    await Wishlist.find({userId: userId}).then((data)=>{
                        if(data != null){
                            return res.status(200).send({ success: true, msg: "data received", data: data, errors: '' });
                        }else{
                            return res.status(203).send({ success: false, msg: "No record found", data: {}, errors: '' });
                        }
                    })
                    .catch(err =>{
                        res.status(500).send({
                            message : err.message || "Some error occurred while creating a create operation"
                        });
                    });
                    
                    
                }else{
                    return res.status(204).send({ success: false, msg: "There is some error While processing your Request", data: {}, errors: '' });
                }  
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}

exports.wishlistcheck = async (req, res) => {

    try {
        let data = Validator.checkValidation(req.body);
            if (data['success'] == true) {
                data = data['data'];    
            } else {
                return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
            }
            var userId = data.userid;
            var nftId = data.nftid;

        if(!userId){
            return res.status(202).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }else{
            await Userdb.find({_id : userId}).countDocuments().then(async(UserData)=>{
                if(UserData == 1){
                    await Wishlist.find({userId: userId, nftId : nftId}).countDocuments().then((data)=>{
                        console.log('data',data)
                        console.log(typeof(data))
                        if(data != null && data != 0){
                            return res.status(200).send({ success: true, msg: "In wishlist", data: data, errors: '' });
                        }else{
                            return res.status(203).send({ success: false, msg: "No record found", data: {}, errors: '' });
                        }
                    })
                    .catch(err =>{
                        res.status(500).send({
                            message : err.message || "Some error occurred while creating a create operation"
                        });
                    });
                    
                    
                }else{
                    return res.status(204).send({ success: false, msg: "There is some error While processing your Request", data: {}, errors: '' });
                }  
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}