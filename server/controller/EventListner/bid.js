const dotenv = require('dotenv');
dotenv.config();
const bidModel = require("../../model/bidModel");
const auctionModel = require("../../model/auctionCreateModel");
const cancelBid = require("../../model/cancelBidModel");
const common = require("./common");
const mail = require("../mailSender/mailSender");
const Web3 = require("web3");
const web3 = new Web3(Web3.givenProvider || process.env.rpc_url);
const contract = common.contract;
const nftinfo = mail.nftData;
const sellerinfo = mail.getSeller;
const mailSender = mail.mailSender;


async function lastbidMail(nft, bidder, amount, lastBidder) {
  let nftData = await nftinfo(nft);
  let userData = await sellerinfo(bidder);
  let lastBidderData = await sellerinfo(lastBidder);

  userData = userData[0];
  nftData = nftData[0];
  lastBidderData = lastBidderData[0];

  if (typeof nftData == "object" && typeof lastBidderData == "object") {
    if (
      lastBidderData.notification &&
      "bids" in JSON.parse(lastBidderData.notification) &&
      JSON.parse(lastBidderData.notification).bids == true
    ) {
      let htmlContent =
        "<p>Hi " +
        lastBidderData.displayName +
        ",</p><p>Your bid rejected on NFT <b><a href='"+(JSON.parse(nftData.ipfs)).image+"' target='_blank'>"+(JSON.parse(nftData.ipfs)).name+"</a></b> and winning bidding is " +
        Number(amount) / 10 ** 18 +
        " <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/1200px-Google_Chrome_icon_%28February_2022%29.svg.png' alt = ''/></p>";
      htmlContent =
        htmlContent +
        "<p>Winner name is: <b>" +
        userData.displayName +
        "</b></p><p>Your bid value will be refunded succesfully to your wallet address <b><a href='" +
        process.env.WalletUrl +
        lastBidderData.address +
        "' target='_blank'>wallet address</a></b></p><p>Team Codebird</p>";
      var subject = "Bid rejected";
      var to_mail = lastBidderData.email;
      mailSender(to_mail, subject, htmlContent);
    } else {
      console.log("Bid notificarion disabled");
    }
  } else {
    console.log("type of data doesnt match for bidder");
  }
}

async function nftOwnerBidMail(nft, auctionId, amount, bidder) {
  let auctionData = await contract.methods.getAuction(nft).call();
  let lastBidder = auctionData.highestBidder;
  const totalBids = await bidModel
    .find({ auctionId: auctionId })
    .countDocuments();
  let nftData = await nftinfo(nft);
  let seller = await auctionModel.find({ auctionId: Number(auctionId) });
  seller = seller[0].seller;
  let sellerData = await sellerinfo(seller);
  let bidderData = await sellerinfo(bidder);
  nftData = nftData[0];
  sellerData = sellerData[0];
  bidderData = bidderData[0];

  if (
    typeof nftData == "object" &&
    typeof sellerData == "object" &&
    typeof bidderData == "object"
  ) {
    if (
      sellerData.notification &&
      "bids" in JSON.parse(sellerData.notification) &&
      JSON.parse(sellerData.notification).bids == true
    ) {
      let htmlContent =
        "<p>Hi " +
        sellerData.displayName +
        ",</p><p>Your listed NFT <b><a href='"+(JSON.parse(nftData.ipfs)).image+"' target='_blank'>"+(JSON.parse(nftData.ipfs)).name+"</a></b> received a new bid <b>" +
        Number(amount) / 10 ** 18 +
        "</b> <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/1200px-Google_Chrome_icon_%28February_2022%29.svg.png' alt = ''/>. ";
      htmlContent =
        htmlContent + "<p>Bidder name is <b>" + bidderData.displayName + "<b></p><p>Team Codebird</p>";
      var subject = "New Bid";
      var to_mail = sellerData.email;
      mailSender(to_mail, subject, htmlContent);
    } else {
      console.log("bids notification disabled");
    }
  } else {
    console.log("type of data doesnt match for seller");
  }
  if (Number(totalBids) > 1) {
    lastbidMail(nft, bidder, amount, lastBidder);
  }
}

let count = 0;
setInterval(function () {
  try {
    if(count == 0){
        count = 1;
        web3.eth.getBlockNumber().then((cbno) => {
            contract.getPastEvents(
              "Bid",
              {
                fromBlock: cbno - 900,
                toBlock: "latest",
              },
              async function (error, events) {
                if (events) {
                  // console.log(events)
                  for (var i = 0; i < events.length; i++) {
                    let list = events[i].returnValues;
                    let txs = events[i].transactionHash;
                    await bidModel
                      .find({ txHash: `${txs}` })
                      .countDocuments()
                      .then(async (data) => {
                        if (data == 0 || data == null) {
                          let cancelBidData = await cancelBid.find({
                            $and: [
                              { auctionId: Number(list["_id"]) },
                              { bidder: list["_bidder"] },
                              { nftId: list["_tokenId"] },
                            ],
                          });
                          if (cancelBidData.length > 0) {
                            let n = cancelBidData.length - 1;
                            if (
                              Number(cancelBidData[n].txTime) < Number(list["_time"])
                            ) {
                              let eventlist = new bidModel(
                                {
                                  auctionId: list["_id"],
                                  bidder: list["_bidder"],
                                  nftId: list["_tokenId"],
                                  txHash: txs,
                                  txTime: list["_time"],
                                  amount: list["_price"],
                                },
                                { ordered: false }
                              );
                              eventlist
                                .save(eventlist)
                                .then((data) => {
                                  nftOwnerBidMail(
                                    list["_tokenId"],
                                    list["_id"],
                                    list["_price"],
                                    list["_bidder"]
                                  );
                                  console.log(
                                    "Data Save with tokenID",
                                    list["_tokenId"]
                                  );
                                })
                                .catch((err) => {
                                  console.error("error", err);
                                });
                            }
                          } else {
                            let eventlist = new bidModel(
                              {
                                auctionId: list["_id"],
                                bidder: list["_bidder"],
                                nftId: list["_tokenId"],
                                txHash: txs,
                                txTime: list["_time"],
                                amount: list["_price"],
                              },
                              { ordered: false }
                            );
                            eventlist
                              .save(eventlist)
                              .then((data) => {
                                nftOwnerBidMail(
                                  list["_tokenId"],
                                  list["_id"],
                                  list["_price"],
                                  list["_bidder"]
                                );
                                console.log(
                                  "Data Save with tokenID",
                                  list["_tokenId"]
                                );
                              })
                              .catch((err) => {
                                console.error("error", err);
                              });
                          }
                        }
                      });
                  }
                }
              }
            );
          });
          count = 0;
    }
    
  } catch (err) {
    console.error(err);
  }
}, 1000 * 10);
