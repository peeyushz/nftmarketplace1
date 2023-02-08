"use strict";
const express = require("express");
const route = express.Router();

const HomeRoute = require("../controller/HomeRoute");
const User = require("../controller/User/UserController");
const Follower = require("../controller/Follower/FollowerController");
const Report = require("../controller/Report/ReportController");
const ContactUs = require("../controller/Contactus/ContactUsController");
const EmailOtp = require("../controller/EmailOtp/EmailOtpController");
const NftLike = require("../controller/NftLikes/NftLikeController");
const nft = require("../controller/nft/nft");
const WishList = require("../controller/Wishlist/WishlistController");
const CMS = require("../controller/Cms/CmsController");
// const GetEvents = require("../controller/EventFetch/event");
const transferEvents = require("../controller/EventFetch/eventFetch");
const activity = require("../controller/Activity/ActivityController");

//------------------------------ API----------------------------------
//Home Route
route.get("/", HomeRoute.home);

//email routes

route.post("/register-email-verify", EmailOtp.registerEmailVerification);
route.post("/forget-password-verify", EmailOtp.forgetPasswordVerification);
route.get("/otp-verify", EmailOtp.otpVerify);

//User Routes
route.post("/register", User.register);
route.post("/login", User.login);
route.post("/forget-password", User.forgetPassword);
route.post("/update-profile", User.updateProfile);
route.get("/user-profile", User.userData);
route.post("/userAddress", User.userAddress);
route.post("/user-count",User.userCount);
route.get("/userdetails-username",User.userDataWithUserName);
route.get("/userdetails-address",User.userByAddress);

//follower-routes
route.post("/add-follower", Follower.addFollwer);
route.post("/remove-follower", Follower.removeFollwer);
route.get("/count-follower", Follower.countFollwer);

//Nft likes routes
route.post("/add-likes", NftLike.addLikes);
route.post("/remove-likes", NftLike.removeLikes);
route.get("/count-likes", NftLike.countLikes);
route.post("/check-likes", NftLike.checkLikes);
route.get("/check-follower", Follower.checkFollwer);

//wishlist routes
route.post("/addinwishlist", WishList.addInWishlist);
route.post("/removefromwishlist", WishList.removeFromWishlist);
route.get("/wishlistdata", WishList.wishlistData);
route.post("/wishlistcheck", WishList.wishlistcheck);

//report-route
route.post("/add-report", Report.addReport);

//contact us route
route.post("/contactUs", ContactUs.addContact);

//getEvents 
// route.post("/GetEvents", GetEvents.getEvents);
route.post("/getTransferEvents", transferEvents.getTransferEvents);
route.post("/getbidEvents", transferEvents.getbidEvents);
route.post("/getTokenHistory", transferEvents.getTokenHistory);
route.post("/getBidHistory",transferEvents.getbidHistory);
route.get("/getSoldHistory",transferEvents.getSoldHistory);
route.get("/getDealSoldHistory",transferEvents.getDealSoldHistory);
route.post("/getUserAuctionData",transferEvents.getUserAuctionData);
route.post("/getUserSaleData",transferEvents.getUserSaleData);
route.post("/getUserbids",transferEvents.getUserBids);
route.post("/getUserOffers",transferEvents.getUserOffers);
route.post("/getUserDealData",transferEvents.getUserDealData);
route.post("/getofferHistory",transferEvents.getofferHistory);
route.get('/getnewlisted', transferEvents.getNewlisted);
route.get('/getnewdeals', transferEvents.getNewDeals);
route.get('/getRunningAuctions', transferEvents.getRunningAuctions);
route.get('/getRunningSale', transferEvents.getRunningSale);
route.get('/getRunningDeal', transferEvents.getRunningDeal);
route.get('/getauction', transferEvents.getOneAuction);
route.get('/get-last-owner', transferEvents.getLastOwner);
route.get('/getsale', transferEvents.getOneSale);
route.get('/check-market', transferEvents.checkMarket);
route.get('/getdeal', transferEvents.getOneDeal);
// social
route.get("/getSocialLinks", CMS.getSocialLinks);

//nft route
route.post("/nft", nft.getNFT);
route.post("/get-all-nft", nft.getAllNFT);
route.post("/search-nft", nft.searchNFT);
route.get("/market-nft-owner", nft.marketNFTOwner);
route.post("/get-user-nft", nft.getUserNFT);

//All Activity
route.post("/getAllActivity",activity.getAllActivity);


/** Always put it in below of all routes**/
// CMS page
route.get("/:slug", CMS.getCmsData);

// * route

route.use((req, res, next) => {
    res.status(401).send({ success: false, msg: "Route not found", data: {}, errors: '' });
});

/*route.get('*',()=>{
    res.status(401).send({ success: false, msg: "Route not found", data: {}, errors: '' });
})
route.post('*',()=>{
    res.status(401).send({ success: false, msg: "Route not found", data: {}, errors: '' });
})*/

module.exports = route;