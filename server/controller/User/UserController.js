"use strict";
var Userdb = require('../../model/userModel');
var Follower = require('../../model/followersModel');
const validation = require('./validation');
const sha256 = require('sha256');
const Validator = require('../validationController');
const multiparty = require('multiparty');
const paths = require('path');
const movefile = require('mv');

exports.register = async(req, res) => {

    try {
        let time = Date.now();
        let form = new multiparty.Form();
        //pasing form data
        form.parse(req, async function(err, fields, files) {

            //handling profile image
            if (files.dp_files !== undefined) {
                var oldpath_dp = files.dp_files[0].path; //postman
                //var oldpath_dp = files.uploadFile[0].path;//server
                if (files.dp_files[0].originalFilename == '') {
                    files.dp_files[0].originalFilename = 'default_dp.jpg';
                    var newpath_dp = paths.join(__dirname, '../../../assets/images/' + files.dp_files[0].originalFilename);
                    var dp_image_name = files.dp_files[0].originalFilename;
                } else {
                    var newpath_dp = paths.join(__dirname, '../../../assets/images/' + time + files.dp_files[0].originalFilename);
                    var dp_image_name = time + files.dp_files[0].originalFilename;
                    console.log(newpath_dp)
                }
            } else {
                var dp_image_name = 'default_dp.jpg';
            }

            if (oldpath_dp != undefined) {
                //moving image on server
                movefile(oldpath_dp, newpath_dp, async function(err) {
                    if (err) {;
                        return res.status(501).send({ success: false, msg: "Error while uploading image", data: {}, errors: err });
                    }
                });
            }



            //validating form data
            let data = validation.signupfield(fields);
            if (data['success'] == true) {
                data = data['data'];
            } else {
                return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
            }

            let Email = data.email[0];
            let DisplayName = data.displayname[0];
            let password = data.password[0];
            let re_password = data.re_password[0];
            let bio = '';
            let emailVerified = JSON.parse(fields.emailverified[0]);
            let SocialMedia
            let Notification
            let Check = JSON.parse(fields.check[0]);
            if (fields.bio) {
                bio = fields.bio[0];
            }
            if (fields.socialmedia != undefined) {
                SocialMedia = fields.socialmedia[0];
            } else {
                SocialMedia = {}
            }
            if (fields.notification != undefined) {
                Notification = fields.notification[0];
            } else {
                Notification = {}
            }

            //checking email is verified
            if (Check == true) {
                if (emailVerified == true) {
                    //Checking Email already exist or not
                    const emailExist = Userdb.find({ email: Email }).countDocuments().then((NoOfRecords) => {
                        if (NoOfRecords == 0) {
                            //Checking Display name already taken or not
                            const nameExist = Userdb.find({ displayName: DisplayName }).countDocuments().then((NoOfrecords) => {
                                if (NoOfrecords == 0) {

                                    if (password == re_password) {
                                        let password_hash = sha256(password);
                                        //new user
                                        const NewUser = new Userdb({
                                            displayName: DisplayName,
                                            email: Email,
                                            password: password_hash,
                                            bio: bio,
                                            profileImage: dp_image_name,
                                            socialMedia: SocialMedia,
                                            notification: Notification
                                        })

                                        // save user in the database
                                        NewUser.save(NewUser).then(data => {
                                            res.status(200).send({ success: true, msg: "User Created successfully", data: '', errors: '' });
                                        }).catch(err => {
                                            console.log(err)
                                            res.status(500).send({
                                                
                                                message: err.message || "Some error occurred while creating a create operation"
                                            });
                                        });
                                    } else {
                                        res.status(202).send({ success: false, msg: "Password and confirm password", data: {}, errors: err });
                                    }
                                } else {
                                    res.status(203).send({ success: false, msg: "Display name already exist", data: {}, errors: '' });
                                }
                            });
                        } else {
                            res.status(204).send({ success: false, msg: "Email already exist", data: {}, errors: '' });
                        }
                    });
                } else {
                    res.status(205).send({ success: false, msg: "Email is not verified", data: {}, errors: '' });
                }
            } else {
                res.status(206).send({ success: false, msg: "Please agree to the terms and conditions", data: {}, errors: '' });
            }

        })
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}

exports.login = async(req, res) => {
    try {
        let data = Validator.checkValidation(req.body);
        if (data['success'] === true) {
            data = data['data'];
        } else {
            res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
        let Email = data.email;
        let password = data.password;

        //checking whether user exist or not
        await Userdb.findOne({ email: Email }).then((userData) => {
            if (userData) {
                let password_hash = sha256(password);
                if (userData.password == password_hash) {
                    res.status(200).send({ success: true, msg: "Logged in successfully", data: userData._id, errors: '' });
                } else {
                    res.status(202).send({ success: false, msg: "Invalid Password", data: '', errors: '' });
                }
            } else {
                res.status(203).send({ success: false, msg: "You don't have account please register! Please Register", data: '', errors: '' });
            }

        });
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }

}

exports.forgetPassword = async(req, res) => {
    try {

        let data = Validator.checkValidation(req.body);
        if (data['success'] === true) {
            data = data['data'];
        } else {
            return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
        let Email = data.email;
        let otpVerfied = JSON.parse(data.otpverified);
        let password = data.password;
        let re_password = data.re_password;

        //Checking whether email is verified for OTP
        if (otpVerfied == true) {
            if (password == re_password) {
                let password_hash = sha256(password);

                //checking whether user exist or not
                await Userdb.findOneAndUpdate({ email: Email }, { $set: { password: password_hash } }).then((checkUser) => {
                    if (checkUser != null) {
                        return res.status(200).send({ success: true, msg: "Password chmaged successfully", data: '', errors: '' });
                    } else {
                        return res.status(202).send({ success: false, msg: "User not found", data: '', errors: '' });
                    }
                });
            } else {
                return res.status(203).send({ success: false, msg: "Password and Confirm Password doesn't match", data: {}, errors: '' });
            }
        } else {
            return res.status(204).send({ success: false, msg: "Email is not Verified", data: {}, errors: '' });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }

}

exports.updateProfile = async(req, res) => {
    try {
        let time = Date.now();
        let form = new multiparty.Form();

        form.parse(req, async function(err, fields, files) {

            //Validating data
            let data = Validator.updateProfileValidation(fields);
            if (data['success'] == true) {
                data = data['data'];
            } else {
                return res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
            }
            let DisplayName = null; password = null; re_password = null; bio = null; SocialMedia= null; Notification = null;
            let UserId = data.userid[0];

            if (UserId == null || UserId == '' || UserId == undefined) {
                return res.status(207).send({ success: false, msg: "Please log In", data: {}, errors: '' });
            }
            //checking data which is entered by user to update 
            if (data.displayname != undefined) {
                DisplayName = data.displayname[0];
                await Userdb.findOne({ displayName: DisplayName, _id: { $ne: UserId } }).then(data => {
                    if (data) {
                        return res.status(202).send({ success: false, msg: "Username is already taken", data: {}, errors: '' });
                    }
                })
            }
            if (data.password != undefined) {
                password = data.password[0];
            }
            if (data.re_password != undefined) {
                re_password = data.re_password[0];
            }
            if (password != re_password) {
                return res.status(203).send({ success: false, msg: "password and confirm password doesn't match", data: {}, errors: '' });
            }
            if (password == re_password && password != null && re_password != null) {
                password = sha256(password);
            }
            if (fields.bio != undefined) {
                bio = fields.bio[0];
            }
            if (fields.socialmedia != undefined) {
                SocialMedia = fields.socialmedia[0];
            }
            if (fields.notification != undefined) {
                Notification = fields.notification[0];
            }

            //handling profile image
            if (files.dp_files !== undefined) {
                var oldpath_dp = files.dp_files[0].path; //postman
                //var oldpath_dp = files.uploadFile[0].path;//server
                if (files.dp_files[0].originalFilename == '') {
                    files.dp_files[0].originalFilename = 'default_dp.jpg';
                    var newpath_dp = paths.join(__dirname, '../../../assets/images/' + files.dp_files[0].originalFilename);
                    var dp_image_name = files.dp_files[0].originalFilename;
                } else {
                    var newpath_dp = paths.join(__dirname, '../../../assets/images/' + time + files.dp_files[0].originalFilename);
                    var dp_image_name = time + files.dp_files[0].originalFilename;
                }
            } else {
                var dp_image_name = 'default_dp.jpg';
            }

            //fetching user data from userId
            await Userdb.findOne({ _id: UserId }).then(async(userData) => {
                if (userData) {

                    if (DisplayName == null) {
                        DisplayName = userData.displayName;
                    }
                    if (password == null && password == undefined) {
                        password = userData.password;
                    }
                    if (bio == null) {
                        bio = userData.bio;
                    }
                    if (SocialMedia == null) {
                        SocialMedia = userData.socialMedia;
                    }
                    if (Notification == null) {
                        Notification = userData.notification;
                    }
                    //checking profile image is changed or not
                    if (dp_image_name == 'default_dp.jpg') {
                        dp_image_name = userData.profileImage;
                    }

                    if (oldpath_dp != undefined) {
                        movefile(oldpath_dp, newpath_dp, async function(err) {
                            if (err) {
                                return res.status(204).send({ success: false, msg: "ERROR", data: {}, errors: err });
                            }
                        })
                    }
                    //updating data
                    let updatetime = new Date()
                    await Userdb.findOneAndUpdate({ _id: UserId }, { $set: { displayName: DisplayName, password: password, bio: bio, socialMedia: SocialMedia, notification: Notification, profileImage: dp_image_name, updateTime: updatetime } }, { upsert: false }).then((updatedRecord) => {
                        if (updatedRecord) {
                            return res.status(200).send({ success: true, msg: "Profile updated successfully", data: {}, errors: err });
                        } else {
                            return res.status(205).send({ success: false, msg: "ERROR", data: {}, errors: err });
                        }
                    })
                } else {
                    return res.status(206).send({ success: false, msg: "User not found", data: {}, errors: err });
                }
            });
        })
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, msg: "Error", data: {}, errors: err });
    }
}

exports.userData = async(req, res) => {
    try {
        let data = Validator.checkValidation(req.query);
        if (data['success'] === true) {
            data = data['data'];
        } else {
            res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
        let userId = data.userid;
        await Userdb.findOne({ _id: userId }).then(async(data) => {
            if (data) {
                await Follower.find({ followedTo: userId }).countDocuments().then((num) => {   
                    if (num >= 0) {
                        res.status(200).send({ success: true, msg: "User data", data: data, followers: num, errors: '' });
                    } else {
                        res.status(202).send({ success: false, msg: "no follower found", data: data, followers : 0, errors: '' });
                    }
                });
            } else {
                res.status(203).send({ success: false, msg: "Error while fetching User Details", data: '', errors: '' });
            }
        })
    } catch (err) {
        res.status(500).send({ success: false, msg: "Error while fetching Details", data: '', errors: err });
    }
}

exports.userDataWithUserName = async(req, res) => {
    try {
        let data = Validator.checkValidation(req.query);
        if (data['success'] === true) {
            data = data['data'];
        } else {
            res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
        let name = data.displayname;
        console.log(name)
        await Userdb.findOne({ displayName : name }).then(async(data) => {
            console.log(data)
            if (data) {
                let userId = data._id;
                await Follower.find({ followedTo: userId }).countDocuments().then((num) => {   
                    if (num >= 0) {
                        res.status(200).send({ success: true, msg: "User data", data: data, followers: num, errors: '' });
                    } else {
                        res.status(202).send({ success: false, msg: "no follower found", data: data, followers : 0, errors: '' });
                    }
                });
            } else {
                res.status(203).send({ success: false, msg: "Error while fetching User Details", data: '', errors: '' });
            }
        })
    } catch (err) {
        res.status(500).send({ success: false, msg: "Error while fetching Details", data: '', errors: err });
    }
}

exports.userAddress = async(req, res) => {
    try {
        let userID = req.body.id;
        let userAddress = req.body.userAddress;
        
        await Userdb.find({$and :[{address: `${userAddress}`},{_id:userID}]}).countDocuments().then(async(num) => {
            if(num == 0 || num == null){
                await Userdb.find({address: `${userAddress}`}).countDocuments().then(async(data) =>{
                    if(data == 0 || data == null){
                        await Userdb.findOneAndUpdate({ _id: userID }, { $set: { address: userAddress } }).then((checkUser) => {
                            if (checkUser != null) {
                                return res.status(200).send({ success: true, msg: "Address update successfully", data: '', errors: '' });
                            } else {
                                return res.status(202).send({ success: false, msg: "User not found", data: '', errors: '' });
                            }
                        });
                    }else{
                        return res.status(202).send({ success: false, msg: "Address is already taken by another user", data: '', errors: '' });
                    }
                })   
            }else{
                return res.status(203).send({ success: false, msg: "Address is already Saved", data: '', errors: '' });
            }
        })
        
    } catch (err) {
        res.status(500).send({ success: false, msg: "Error while Updating Details", data: '', errors: err });
    }
}

exports.userCount = async (req,res) =>{
    try {
        let userCount = await Userdb.count();
        return res.status(201).send({ success: true, msg: "user Data", data: {
            user:userCount
        }, errors: '' }); 
        
    } catch (e) {
        return res.status(201).send({ success: false, msg: "user Data", data: {
            user:0
        }, errors: e });
    }
}

exports.userByAddress = async(req, res) =>{
    try {
        console.log(req.query.address);
        let data = Validator.checkValidation(req.query.address);

        if (data['success'] === true) {
            data = data['data'];
        } else {
            res.status(201).send({ success: false, msg: "Missing field", data: {}, errors: '' });
        }
        let address = data.address;
        await Userdb.findOne({ address : address }).then(async(data) => {
            
            if (data) {
                res.status(200).send({ success: true, msg: "User data", data: data, errors: '' });
            } else if(data == null) {
                res.status(203).send({ success: false, msg: "User doesn't have primary address", data: '', errors: '' });
            }else{
                res.status(202).send({ success: false, msg: "error while fetching data", data: '', errors: '' });
            }
        })
    } catch (err) {
        res.status(500).send({ success: false, msg: "Error while fetching Details", data: '', errors: err });
    }
}