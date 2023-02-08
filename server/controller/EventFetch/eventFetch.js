"use strict";
const dotenv = require('dotenv');
dotenv.config();
const transfer = require('../../model/transferModel');
const bid = require('../../model/bidModel');
const eventModel = require('../../model/eventModel');
const auctionCreateModel = require('../../model/auctionCreateModel');
const saleModel = require('../../model/saleModel');
const offerMakeModel = require('../../model/offerMakeModel');
const dealCreateModel = require('../../model/dealCreateModel');
const common = require('../EventListner/common');
const MarketContract = common.contract;
const MrketContractAdd = common.contract_address;


exports.getLastOwner = async(req, res) =>{

  try{
    const token = req.query.tokenid
    const owner = await transfer.aggregate([
      {
        '$match': {
          'tokenId': Number(token), 
          'type': 'Transfer', 
          'from': MrketContractAdd
        }
      }, {
        '$sort': {
          'date': -1
        }
      }, {
        '$limit': 1
      }, {
        '$project': {
          'to': 1, 
          '_id': 0
        }
      }
    ]);
    if(owner){
      return res.status(200).send({success:true, msg:"Data not found", data:owner[0], err:""});
    }else{
      return res.status(203).send({success:false, msg:"owner not found", data:"", err:""});
    }
    
  }catch(err){
    return res.status(500).send({success:false, msg:"Data not found", data:"", err:""});
  }
}

exports.checkMarket = async(req, res) => {
  try{
    const token = req.query.tokenid;
    const DealCount = await dealCreateModel.find({nftId:Number(token)}).countDocuments();
    if(DealCount > 0){
      return res.status(200).send({success:true, msg:"Data found", data:"Deal", err:""});
    }else{
      return res.status(200).send({success:true, msg:"Data found", data:"Sale", err:""});
    }
  }catch{
    return res.status(500).send({success:false, msg:"Data not found", data:"", err:""});
  }
}

exports.getOneSale = async(req, res) =>{
  try{
    const token = req.query.tokenid;
    const sale = await saleModel.aggregate([
      {
        '$match': {
          'nftId': Number(token)
        }
      }, {
        '$lookup': {
          'from': 'offermakeevents', 
          'localField': 'saleId', 
          'foreignField': 'saleId', 
          'as': 'offerData'
        }
      }, {
        '$project': {
          '_id': 0, 
          'id': '$nftId', 
          'saleId': 1, 
          'price': '$amount', 
          'lastOffer': {
            '$max': {
              '$arrayElemAt': [
                '$offerData.amount', -1
              ]
            }
          }
        }
      }
    ]);
    
    if(sale){
      return res.status(200).send({success:true, msg:"Data found", data:sale[0], err:""});
    }else{
      return res.status(203).send({success:false, msg:"Data not found", data:"", err:""});
    }

  }catch(err){
    console.log(err);
    return res.status(500).send({success:false, msg:"Data not found", data:"", err:""});
  }
}
exports.getOneAuction = async(req, res) =>{
  try{
    const token = req.query.tokenid;
    const auction = await auctionCreateModel.aggregate([
      {
        '$match': {
          'nftId': Number(token)
        }
      }, {
        '$lookup': {
          'from': 'bidevents', 
          'localField': 'auctionId', 
          'foreignField': 'auctionId', 
          'as': 'bidData'
        }
      }, {
        '$project': {
          '_id': 0, 
          'id': '$nftId', 
          'auctionId': 1, 
          'startTime': 1, 
          'endTime': 1, 
          'price': '$amount', 
          'ipfs': '$nftData.ipfs', 
          'hishestBid': {
            '$max': {
              '$arrayElemAt': [
                '$bidData.amount', -1
              ]
            }
          }
        }
      }
    ]);
    if(auction){
      return res.status(200).send({success:true, msg:"Data found", data:auction[0], err:""});
    }else{
      return res.status(203).send({success:false, msg:"Data not found", data:"", err:""});
    }

  }catch(err){
    console.log(err);
    return res.status(500).send({success:false, msg:"Data not found", data:"", err:""});
  }
}
exports.getOneDeal = async(req, res) =>{
  try{
    const token = req.query.tokenid;
    const auction = await dealCreateModel.aggregate([
      {
        '$match': {
          'nftId': Number(token)
        }
      },  {
        '$project': {
          '_id': 0, 
          'id': '$nftId',  
          'startTime': 1, 
          'endTime': 1, 
          'price': '$amount'
        }
      }
    ]);
    if(auction){
      return res.status(200).send({success:true, msg:"Data found", data:auction[0], err:""});
    }else{
      return res.status(203).send({success:false, msg:"Data not found", data:"", err:""});
    }

  }catch(err){
    console.log(err);
    return res.status(500).send({success:false, msg:"Data not found", data:"", err:""});
  }
}

exports.getRunningAuctions = async(req, res) =>{
    try{
        const auctionData = await auctionCreateModel.aggregate([
            {
              '$lookup': {
                'from': 'bidevents', 
                'localField': 'auctionId', 
                'foreignField': 'auctionId', 
                'as': 'bidData'
              }
            }, {
              '$lookup': {
                'from': 'nfts', 
                'localField': 'nftId', 
                'foreignField': 'NftId', 
                'as': 'nftData'
              }
            }, {
              '$unwind': {
                'path': '$nftData'
              }
            }, {
              '$project': {
                'nftId': 1, 
                'auctionId': 1, 
                'startTime': 1, 
                'endTime': 1, 
                'price': '$amount', 
                'ipfs': '$nftData.ipfs', 
                'hishestBid': {
                  '$max': {
                    '$arrayElemAt': [
                      '$bidData.amount', -1
                    ]
                  }
                }
              }
            }
          ]);
    
        const NFTDetail = [];
        let NFTSet = {};
        // let details = {}
        for (let i = 0; i < auctionData.length; i++) {
            let now = Math.floor((new Date()).getTime() / 1000);
            if(parseInt( auctionData[i]['endTime']) > now && parseInt( auctionData[i]['startTime']) < now){
                NFTSet['id'] = auctionData[i]['nftId'];
                NFTSet['ipfs'] = auctionData[i].ipfs;
                NFTSet['details'] = {startTime: auctionData[i]['startTime'], endTime: auctionData[i]['endTime'], price: auctionData[i]['price'], hishestBid:auctionData[i]['hishestBid']}
                NFTSet['price'] = auctionData[i]['price'];
                NFTDetail.push(NFTSet);
                NFTSet = {};
            }  
        }
        if(NFTDetail.length > 0){
            return res.status(200).send({success:true, msg:"Data found", data:NFTDetail, err:""})
        }else{
            return res.status(203).send({success:false, msg:"Data not found", data:NFTDetail, err:""})
        }
    }catch (err){
        console.log(err);
        return res.status(500).send({success:false, msg:"Error while processing your request", data:[], err:""})
    }
    
        

}

exports.getRunningSale = async(req, res) =>{
    try{
        const saleData = await saleModel.aggregate([
            {
              '$lookup': {
                'from': 'nfts', 
                'localField': 'nftId', 
                'foreignField': 'NftId', 
                'as': 'nftData'
              }
            }, {
              '$unwind': {
                'path': '$nftData'
              }
            }, {
              '$project': {
                'id': '$nftId', 
                'saleId': 1, 
                'price': '$amount', 
                'ipfs': '$nftData.ipfs', 
                '_id': 0
              }
            }
          ]);
          if(saleData.length  > 0){
            return res.status(200).send({success:true, msg:"Data found", data:saleData, err:""})
          }else{
            return res.status(203).send({success:false, msg:"Data not found", data:saleData, err:""})
          }
    }catch (err){
        console.log(err);
        return res.status(500).send({success:false, msg:"Error while processing your request", data:[], err:""})
    }
}
exports.getRunningDeal = async(req, res) =>{
    try{
        const dealData = await dealCreateModel.aggregate([
            {
              '$lookup': {
                'from': 'nfts', 
                'localField': 'nftId', 
                'foreignField': 'NftId', 
                'as': 'nftData'
              }
            }, {
              '$unwind': {
                'path': '$nftData'
              }
            }, {
              '$project': {
                'nftId': 1, 
                'startTime': 1, 
                'endTime': 1, 
                'price': '$amount', 
                'ipfs': '$nftData.ipfs'
              }
            }
          ]);
          const NFTDetail = [];
            let NFTSet = {};
            // let details = {}
            for (let i = 0; i < dealData.length; i++) {
                let now = Math.floor((new Date()).getTime() / 1000);
                if(parseInt( dealData[i]['endTime']) > now && parseInt( dealData[i]['startTime']) < now){
                    NFTSet['id'] = dealData[i]['nftId'];
                    NFTSet['ipfs'] = dealData[i].ipfs;
                    NFTSet['details'] = {startTime: dealData[i]['startTime'], endTime: dealData[i]['endTime'], price: dealData[i]['price']}
                    NFTSet['price'] = dealData[i]['price'];
                    NFTDetail.push(NFTSet);
                    NFTSet = {};
                }  
            }
            if(NFTDetail.length  > 0){
                return res.status(200).send({success:true, msg:"Data found", data:NFTDetail, err:""})
              }else{
                return res.status(203).send({success:false, msg:"Data not found", data:[], err:""})
              }
    }catch(err){
        console.log(err);
        return res.status(500).send({success:false, msg:"Error while processing your request", data:[], err:""})
    }
}

exports.getTransferEvents = (req, res) => {
    try {
        let tokenId = req.body.tokenId;
        if(tokenId)
        {
            transfer.find({ tokenId : tokenId }).then(async(data) => {
                return res.status(200).send({ success: true, msg: "Transfer History of Token", data: data, errors: '' });
            })
        }
         else {
            return res.status(201).send({ success: false, msg: "No TokenId", data: {}, errors: '' });
        }
    } catch (e) {
        return res.status(201).send({ success: false, msg: "Error in fetching data", data: {}, errors: e });
    }
}

exports.getbidEvents = (req, res) => {
    try {
        let nftId = req.body.nftId;
        if(nftId)
        {
            bid.find({ nftId : nftId }).then(async(data) => {
                return res.status(200).send({ success: true, msg: "Transfer History of Token", data: data, errors: '' });
            })
        }
         else {
            return res.status(201).send({ success: false, msg: "No TokenId", data: {}, errors: '' });
        }
    } catch (e) {
        return res.status(201).send({ success: false, msg: "Error in fetching data", data: {}, errors: e });
    }
}

exports.getTokenHistory = async (req, res) => {
    try{
        let tokenId = parseInt(req.body.tokenId);
        if(tokenId)
        {
            let data = await transfer.aggregate([
                  {
                    '$match': {
                      '$and': [
                        {
                          'tokenId': {
                            '$eq': tokenId
                          }
                        }, {
                          'type': {
                            '$eq': 'Transfer'
                          }
                        }
                      ]
                    }
                  }, {
                    '$project': {
                      'from': 1, 
                      'to': 1, 
                      'txnHash': 1, 
                      'date': 1, 
                      'tokenId': 1
                    }
                  }, {
                    '$lookup': {
                      'from': 'userdbs', 
                      'localField': 'to', 
                      'foreignField': 'address', 
                      'as': 'userData'
                    }
                  }, {
                    '$project': {
                      'from': 1, 
                      'to': 1, 
                      'txnHash': 1, 
                      'date': 1, 
                      'tokenId': 1, 
                      'userData': 1
                    }
                  }
                ]);
              
            return res.status(200).send({ success: true, msg: "Token History", data: data, errors: '' });
           
        }
         else {
            return res.status(201).send({ success: false, msg: "No TokenId", data: {}, errors: '' });
        }

    }catch(e){
        return res.status(201).send({ success: false, msg: "Error in fetching data", data: {}, errors: e });
    }
}

exports.getbidHistory = async (req,res) => {
    try{
        let nftId = parseInt(req.body.nftId);
        if(nftId != '')
        {
            let auctionDetails = await MarketContract.methods.getAuction(nftId).call();
            
            var auctionId = parseInt(auctionDetails.id);
            let data = await bid.aggregate([
                {
                  '$match': {
                    '$and': [
                      {
                        'nftId': {
                          '$eq': nftId
                        }
                      }, {
                        'auctionId': {
                          '$eq': auctionId
                        }
                      }
                    ]
                  }
                }, {
                  '$lookup': {
                    'from': 'createauctionevents', 
                    'localField': 'auctionId', 
                    'foreignField': 'auctionId', 
                    'as': 'auctionDetails'
                  }
                }, {
                  '$project': {
                    'bidder': 1, 
                    'nftId': 1, 
                    'amount': 1, 
                    'seller': {
                      '$arrayElemAt': [
                        '$auctionDetails.seller', 0
                      ]
                    }, 
                    'txHash': 1, 
                    'txTime': 1, 
                    'date': 1
                  }
                }, {
                  '$lookup': {
                    'from': 'userdbs', 
                    'localField': 'bidder', 
                    'foreignField': 'address', 
                    'as': 'userData'
                  }
                }, {
                  '$project': {
                    'bidder': 1, 
                    'nftId': 1, 
                    'amount': 1, 
                    'txHash': 1, 
                    'txTime': 1, 
                    'date': 1, 
                    'userData': 1, 
                    'seller': 1
                  }
                }
              ]);
            return res.status(200).send({ success: true, msg: "Bid History", data: data, errors: '' });
           
        }
         else {
            return res.status(201).send({ success: false, msg: "No History", data: {}, errors: '' });
        }

    }catch(e){
        return res.status(201).send({ success: false, msg: "Error in fetching data", data: {}, errors: e });
    }  
}

exports.getSoldHistory = async(req, res) =>{
           const soldData =  await eventModel.aggregate([
          {
            '$sort': {
              'date': -1
            }
          }, {
            '$match': {
              'type': {
                '$ne': 'BuyDeal'
              }
            }
          }, {
            '$group': {
              '_id': '$nftId', 
              'nftId': {
                '$first': '$nftId'
              }, 
              'date': {
                '$last': '$date'
              }, 
              'buyer': {
                '$last': '$buyer'
              }, 
              'amount': {
                '$last': '$amount'
              }
            }
          }, {
            '$limit': 50
          }, {
            '$lookup': {
              'from': 'nfts', 
              'localField': 'nftId', 
              'foreignField': 'NftId', 
              'as': 'soldData'
            }
          }
        ]).then((soldData) =>{
        return res.status(200).send({ success: true, msg: "deal sold History", data: soldData, errors: '' });
      }).catch(err =>{
         return res.status(201).send({ success: false, msg: "No history found", data: {}, errors: err });
      })
}

exports.getDealSoldHistory = async(req, res) =>{
    const dealSoldData = await eventModel.aggregate([
        {
          '$sort': {
            'date': -1
          }
        }, {
          '$match': {
            'type': 'BuyDeal'
          }
        }, {
          '$group': {
            '_id': '$nftId', 
            'nftId': {
              '$first': '$nftId'
            }, 
            'date': {
              '$last': '$date'
            }, 
            'buyer': {
              '$last': '$buyer'
            }
          }
        }, {
          '$limit': 50
        }, {
          '$lookup': {
            'from': 'nfts', 
            'localField': 'nftId', 
            'foreignField': 'NftId', 
            'as': 'soldData'
          }
        }
      ]).then((dealSoldData) =>{
        return res.status(200).send({ success: true, msg: "deal sold History", data: dealSoldData, errors: '' });
      }).catch(err =>{
         return res.status(201).send({ success: false, msg: "No history found", data: {}, errors: err });
      })
}

exports.getUserAuctionData = async(req,res) =>{
    let seller = req.body.seller;
    if(seller == undefined || seller == null || seller == ''){
        return res.status(201).send({ success: true, msg: "No data found", data: {}, errors: '' });
    }
    const userAuctiondata = await auctionCreateModel.aggregate([
        {
          '$match': {
            'seller': seller
          }
        }, {
          '$lookup': {
            'from': 'nfts', 
            'localField': 'nftId', 
            'foreignField': 'NftId', 
            'as': 'userAuctiondata'
          }
        }, {
          '$group': {
            '_id': '$nftId', 
            'nftId': {
              '$first': '$nftId'
            }, 
            'date': {
              '$first': '$date'
            }, 
            'amount': {
              '$first': '$amount'
            }, 
            'seller': {
                '$first': '$seller'
            },
             'startTime': {
                '$first': '$startTime'
            },
            'endTime': {
                '$first': '$endTime'
            },
            'userAuctiondata': {
              '$first': '$userAuctiondata'
            }
          }
        }
      ]).then((userAuctiondata) => {
        return res.status(200).send({ success: true, msg: "data found", data: userAuctiondata, errors: '' });
      }).catch(err =>{
         return res.status(202).send({ success: false, msg: "No data found", data: {}, errors: err });
      })
    
}

exports.getUserSaleData = async(req,res) =>{
    let seller = req.body.seller;
    if(seller == undefined || seller == null || seller == ''){
        return res.status(201).send({ success: true, msg: "No data found", data: {}, errors: '' });
    }
    const userSaledata = await saleModel.aggregate([
        {
          '$match': {
            'seller': seller
          }
        }, {
          '$lookup': {
            'from': 'nfts', 
            'localField': 'nftId', 
            'foreignField': 'NftId', 
            'as': 'userSaledata'
          }
        }, {
          '$group': {
            '_id': '$nftId', 
            'nftId': {
              '$first': '$nftId'
            }, 
            'date': {
              '$first': '$date'
            }, 
            'amount': {
              '$first': '$amount'
            },
            'seller': {
                '$first': '$seller'
              },
            'userSaledata': {
              '$first': '$userSaledata'
            }
          }
        }
      ]).then((userSaledata) => {
        return res.status(200).send({ success: true, msg: "data found", data: userSaledata, errors: '' });
      }).catch(err =>{
         return res.status(202).send({ success: false, msg: "No data found", data: {}, errors: err });
      })
    
}

exports.getUserDealData = async(req,res) =>{
    let seller = req.body.seller;
    if(seller == undefined || seller == null || seller == ''){
        return res.status(201).send({ success: true, msg: "No data found", data: {}, errors: '' });
    }
    const userDealdata = await dealCreateModel.aggregate([
        {
          '$match': {
            'seller': seller
          }
        }, {
          '$lookup': {
            'from': 'nfts', 
            'localField': 'nftId', 
            'foreignField': 'NftId', 
            'as': 'userDealdata'
          }
        }, {
            '$group': {
              '_id': '$nftId', 
              'nftId': {
                '$first': '$nftId'
              }, 
              'date': {
                '$first': '$date'
              }, 
              'amount': {
                '$first': '$amount'
              },
              'seller': {
                  '$first': '$seller'
                },
              'userDealdata': {
                '$first': '$userDealdata'
              }
            }
          }
      ]).then((userDealdata) => {
        return res.status(200).send({ success: true, msg: "data found", data: userDealdata, errors: '' });
      }).catch(err =>{
         return res.status(202).send({ success: false, msg: "No data found", data: {}, errors: err });
      })
    
}

exports.getUserBids = async(req, res) => {
    let bidder = req.body.bidder;
    if(bidder == undefined || bidder == null || bidder == ''){
        return res.status(202).send({ success: false, msg: "Invalid Fields", data: {}, errors: '' });
    }
    await bid.aggregate([
        {
          '$match': {
            'bidder': bidder
          }
        }, {
          '$group': {
            '_id': '$auctionId', 
            'nftId': {
              '$first': '$nftId'
            }, 
            'total': {
              '$max': '$amount'
            }, 
            'bidder': {
              '$first': '$bidder'
            }
          }
        }, {
          '$lookup': {
            'from': 'auctionclaimedevents', 
            'let': {
              'id': '$nftId', 
              'bidder': '$bidder'
            }, 
            'pipeline': [
              {
                '$match': {
                  '$expr': {
                    '$and': [
                      {
                        '$eq': [
                          '$nftId', '$$id'
                        ]
                      }, {
                        '$eq': [
                          '$buyer', '$$bidder'
                        ]
                      }
                    ]
                  }
                }
              }, {
                '$project': {
                  '_id': 0, 
                  '__v': 0
                }
              }
            ], 
            'as': 'claimed'
          }
        }, {
          '$lookup': {
            'from': 'nfts', 
            'localField': 'nftId', 
            'foreignField': 'NftId', 
            'as': 'nftdata'
          }
        }, {
          '$unwind': {
            'path': '$nftdata'
          }
        }, {
          '$project': {
            'nftId': '$nftId', 
            'bidder': '$bidder', 
            'bidding_amount': '$total', 
            'ipfs': '$nftdata.ipfs', 
            'claimed_amount': {
              '$arrayElemAt': [
                '$claimed.amount', 0
              ]
            }, 
            'pending_claim': {
              '$subtract': [
                '$total', {
                  '$arrayElemAt': [
                    '$claimed.amount', 0
                  ]
                }
              ]
            }
          }
        }, {
          '$match': {
            '$or': [
              {
                'pending_claim': {
                  '$ne': 0
                }
              }, {
                'pending_claim': {
                  '$eq': null
                }
              }
            ]
          }
        }
      ]).then((data)=>{
          console.log(data);
        return res.status(200).send({ success: true, msg: "Data found", data: data, errors: '' });
        }).catch(err =>{
        return res.status(201).send({ success: false, msg: "No data found", data: {}, errors: err });
        })
    }

exports.getUserOffers = async(req, res) => {
    let offerer = req.body.offerer;
    if(offerer == undefined || offerer == null || offerer == ''){
        return res.status(202).send({ success: false, msg: "Invalid Fields", data: {}, errors: '' });
    }
    await offerMakeModel.aggregate([
        {
          '$match': {
            'offerer': offerer
          }
        }, {
          '$group': {
            '_id': '$saleId', 
            'nftId': {
              '$first': '$nftId'
            }, 
            'total': {
              '$max': '$amount'
            }, 
            'offerer': {
              '$first': '$offerer'
            }
          }
        }, {
          '$lookup': {
            'from': 'offerclaimevents', 
            'let': {
              'id': '$nftId', 
              'offerer': '$offerer'
            }, 
            'pipeline': [
              {
                '$match': {
                  '$expr': {
                    '$and': [
                      {
                        '$eq': [
                          '$nftId', '$$id'
                        ]
                      }, {
                        '$eq': [
                          '$buyer', '$$offerer'
                        ]
                      }
                    ]
                  }
                }
              }, {
                '$project': {
                  '_id': 0, 
                  '__v': 0
                }
              }
            ], 
            'as': 'claimed'
          }
        }, {
          '$lookup': {
            'from': 'nfts', 
            'localField': 'nftId', 
            'foreignField': 'NftId', 
            'as': 'nftdata'
          }
        }, {
          '$unwind': {
            'path': '$nftdata'
          }
        }, {
          '$lookup': {
            'from': 'offerreceiveevents', 
            'localField': '_id', 
            'foreignField': 'saleId', 
            'as': 'receiveData'
          }
        }, {
          '$project': {
            'nftId': '$nftId', 
            'offerer': '$offerer', 
            'offer_amount': '$total', 
            'ipfs': '$nftdata.ipfs', 
            'claimed_amount': {
              '$arrayElemAt': [
                '$claimed.amount', 0
              ]
            }, 
            'pending_claim': {
              '$subtract': [
                '$total', {
                  '$arrayElemAt': [
                    '$claimed.amount', 0
                  ]
                }
              ]
            }, 
            'reveived_address': {
              '$arrayElemAt': [
                '$receiveData.offerer', 0
              ]
            }
          }
        }, {
          '$match': {
            '$or': [
              {
                'pending_claim': {
                  '$ne': 0
                }
              }, {
                'pending_claim': {
                  '$eq': null
                }
              }
            ]
          }
        }, {
          '$match': {
            '$expr': {
              '$ne': [
                '$reveived_address', '$offerer'
              ]
            }
          }
        }
      ]).then((data)=>{
        return res.status(200).send({ success: true, msg: "Data found", data: data, errors: '' });
        }).catch(err =>{
        return res.status(201).send({ success: false, msg: "No data found", data: {}, errors: err });
        })
}

exports.getofferHistory = async (req,res) => {
  try{
      let nftId = req.body.nftId;
      if(nftId)
      {
          let data = await offerMakeModel.aggregate([
            {
              '$match': {
                'nftId': Number(req.body.nftId)
              }
            }, {
              '$lookup': {
                'from': 'saleevents', 
                'let': {
                  'nftId': '$nftId', 
                  'saleId': '$saleId'
                }, 
                'pipeline': [
                  {
                    '$match': {
                      '$expr': {
                        '$and': [
                          {
                            '$eq': [
                              '$saleId', '$$saleId'
                            ]
                          }, {
                            '$eq': [
                              '$nftId', '$$nftId'
                            ]
                          }
                        ]
                      }
                    }
                  }
                ], 
                'as': 'saleData'
              }
            }, {
              '$unwind': {
                'path': '$saleData'
              }
            }, {
              '$project': {
                'offerer': 1, 
                'nftId': 1, 
                'amount': 1, 
                'saleId': '$saleData.saleId', 
                'seller': '$saleData.seller', 
                'txHash': 1, 
                'txTime': 1, 
                'date': 1
              }
            }, {
              '$lookup': {
                'from': 'userdbs', 
                'localField': 'offerer', 
                'foreignField': 'address', 
                'as': 'userData'
              }
            }, {
              '$project': {
                'offerer': 1, 
                'nftId': 1, 
                'amount': 1, 
                'txHash': 1, 
                'txTime': 1, 
                'date': 1, 
                'userData': 1, 
                'seller': 1
              }
            }
          ]);
          return res.status(200).send({ success: true, msg: "offer History", data: data, errors: '' });
         
      }
       else {
          return res.status(201).send({ success: false, msg: "No History", data: {}, errors: '' });
      }

  }catch(e){
      return res.status(201).send({ success: false, msg: "Error in fetching data", data: {}, errors: e });
  }  
}

exports.getNewlisted = async(req, res) =>{
 
    const yesterdayTimeStamp = (new Date().getTime()) - 24*60*60*1000;
    const yesterdayDate = new Date(yesterdayTimeStamp);
    const pastDate = yesterdayDate.toISOString();
    // const auctionData = await auctionCreateModel.find({date: { $gte: pastDate }});
    // const saleData = await saleModel.find({date: { $gte: pastDate }});
    const auctionData = await auctionCreateModel.aggregate([
        {
          '$match': {
            '$expr': {
              '$gte': [
                'date', pastDate
              ]
            }
          }
        }, {
          '$project': {
            'id': '$nftId', 
            'amount': '$amount', 
            'startTime': '$startTime', 
            'endTime': '$endTime', 
            '_id': 0
          }
        }, {
          '$lookup': {
            'from': 'nfts', 
            'localField': 'id', 
            'foreignField': 'NftId', 
            'as': 'AuctionData'
          }
        }, {
          '$unwind': {
            'path': '$AuctionData'
          }
        }, {
          '$project': {
            'AuctionToken': '$id', 
            'amount': '$amount', 
            'startTime': '$startTime', 
            'endTime': '$endTime', 
            'ipfs': '$AuctionData.ipfs'
          }
        }
      ]);
    const saleData = await saleModel.aggregate([
        {
          '$match': {
            '$expr': {
              '$gte': [
                'date', pastDate
              ]
            }
          }
        }, {
          '$project': {
            'id': '$nftId', 
            'amount': '$amount', 
            'startTime': '$startTime', 
            'endTime': '$endTime', 
            '_id': 0
          }
        }, {
          '$lookup': {
            'from': 'nfts', 
            'localField': 'id', 
            'foreignField': 'NftId', 
            'as': 'AuctionData'
          }
        }, {
          '$unwind': {
            'path': '$AuctionData'
          }
        }, {
          '$project': {
            'SaleToken': '$id', 
            'amount': '$amount', 
            'startTime': '$startTime', 
            'endTime': '$endTime', 
            'ipfs': '$AuctionData.ipfs'
          }
        }
      ]);
      if(auctionData || saleData){
        var merge = [];
        var Arr = [];
        if(auctionData == undefined && auctionData == null){
            merge = saleData;
        }else if(saleData == undefined && saleData == null){
            merge = auctionData;
        }else if (auctionData != undefined && auctionData != null && saleData != undefined && saleData != null){
            merge =  auctionData.concat(saleData);
        }else{
            merge = [];
        }
        console.log(Arr);
        return res.status(200).send({ success: true, msg: "offer History", data: merge, errors: '' });
      }else{
        return res.status(201).send({ success: false, msg: "No data", data: [], errors: '' });
      }
    

}

exports.getNewDeals = async(req, res) => {
    const yesterdayTimeStamp = (new Date().getTime()) - 24*60*60*1000;
    const yesterdayDate = new Date(yesterdayTimeStamp);
    const pastDate = yesterdayDate.toISOString();
    
    await dealCreateModel.aggregate([
        {
            '$match': {
            '$expr': {
                '$gte': [
                'date', pastDate
                ]
            }
            }
        }, {
            '$project': {
            'id': '$nftId', 
            'amount': '$amount', 
            'startTime': '$startTime', 
            'endTime': '$endTime', 
            '_id': 0
            }
        }, {
            '$lookup': {
            'from': 'nfts', 
            'localField': 'id', 
            'foreignField': 'NftId', 
            'as': 'dealData'
            }
        }, {
            '$unwind': {
            'path': '$dealData'
            }
        }, {
            '$project': {
            'DealToken': '$id', 
            'amount': '$amount', 
            'startTime': '$startTime', 
            'endTime': '$endTime', 
            'ipfs': '$dealData.ipfs'
            }
        }
        ]).then((data) => {
            if(data){
                return res.status(200).send({ success: true, msg: "offer History", data: data, errors: '' });
            }else{
                return res.status(200).send({ success: false, msg: "No data found", data: [], errors: '' });
            }
    });
    
}


    