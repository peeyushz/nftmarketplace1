"use strict";
const https = require("https");
const fs = require("fs");
const path = require('path');
// const nftfetch =  require('./NFTSave')

const nft = require('./NFTSave').exec;
const bidList = require('./server/controller/EventListner/bid').exec;
const transfer = require('./server/controller/EventListner/transfer').exec
const buyList = require('./server/controller/EventListner/buy').exec
const saleList = require('./server/controller/EventListner/sale').exec
const AuctionCreated = require('./server/controller/EventListner/auctionCreated').exec
const dealList = require('./server/controller/EventListner/buyDeal').exec
const claimAuctionList = require('./server/controller/EventListner/claimAuction').exec
const offerMakeList = require('./server/controller/EventListner/offerMake').exec
const OfferClaimedList = require('./server/controller/EventListner/offerClaimed').exec
const OfferReceivedList = require('./server/controller/EventListner/offerReceived').exec
const dealcreateList = require('./server/controller/EventListner/dealCreated').exec
const cancelAuctionList = require('./server/controller/EventListner/cancelAuction').exec
const cancelSell = require('./server/controller/EventListner/cancelSell').exec;
const cancelDeal = require('./server/controller/EventListner/cancelDeal').exec;
const cancelBid = require('./server/controller/EventListner/cancelBid').exec;
const cancelOffer = require('./server/controller/EventListner/cancelOffer').exec;
const AuctionTransfer = require('./server/controller/autoAuction/autoAuction').exec;

// const base = require('./baseUri.js').exec;


// const options = {
//   key: fs.readFileSync("./keys/e6d70_9fb03_4d6568108ab59d0907d9b3aee2f53ee1.key"),
//   cert: fs.readFileSync("./crts/techyroots_com_e6d70_9fb03_1654905599_4053239ab6103d374f5bcc2007b1a72e.crt")
// };
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyparser = require("body-parser");
const helmet = require('helmet');
const cors = require('cors');

const connectDB = require('./server/database/connection');

const app = express();

const PORT = process.env.PORT || 8443

// log requests
app.use(morgan('tiny'));

//helmet and cors
app.use(helmet({
    crossOriginResourcePolicy: false,
  }));
app.use(cors());

// mongodb connection
connectDB();

// support parsing of application/json type post data
app.use(bodyparser.json());
// parse request to body-parser
app.use(bodyparser.urlencoded({ extended: true }))
//static files
app.use('/images', express.static(path.join(__dirname, 'assets/images')));
// load routers
app.use('/', require('./server/routes/router'));


//Save Nft by token id
// app.get('/nftdatabytoken', nftfetch.saveNftByToken);
// app.get('/deletenftdata', nftfetch.deleteAllNftData);

app.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`) });
// https.createServer(options, app).listen(PORT, ()=> { console.log(`Server is running on ${Date.now()}`)});