"use strict";
const dotenv = require('dotenv');
dotenv.config();
const NFT = require('../../model/nftModel');
const auctionCreateModel = require('../../model/auctionCreateModel');
const saleModel = require('../../model/saleModel');
const dealModel = require('../../model/dealCreateModel');
const common = require('../EventListner/common');
const Web3 = require("web3");
const web3 = new Web3(Web3.givenProvider || process.env.rpc_url);
const MarketContract = common.contract;

exports.getNFT = (req, res) => {
    try {
        let data = JSON.parse(req.body.id);
        if (data.length) {
            NFT.find({ NftId: { $in: data } }).then(async(data) => {
                return res.status(201).send({ success: true, msg: "All nfts", data: data, errors: '' });
            })
        } else {
            return res.status(201).send({ success: false, msg: "empty array", data: {}, errors: '' });
        }
    } catch (e) {
        return res.status(201).send({ success: false, msg: "Error in fetching data", data: {}, errors: e });
    }
}

exports.searchNFT = (req, res) => {
    
    try {
        if (isNaN(req.body.search)) {
           let str = req.body.search;
            let search = decodeURI(str);
            NFT.find({ "name": { $regex: `${search}`, $options : 'i' } }).then(async(data) => {
                return res.status(201).send({ success: true, msg: "All nfts", data: data, errors: '' });
            })
        } else {
            
            NFT.find({ "NftId": req.body.search }).then(async(data) => {
                return res.status(201).send({ success: true, msg: "All nfts", data: data, errors: '' });
            })
        }
    } catch (e) {
        return res.status(201).send({ success: false, msg: "Error in fetching data", data: {}, errors: e });
    }
}

exports.getAllNFT = (req, res) => {
    try {
        NFT.find().then(async(data) => {
            return res.status(201).send({ success: true, msg: "All NFTs", data: data, errors: '' });
        })
    } catch (e) {
        return res.status(201).send({ success: false, msg: "Error in fetching data", data: {}, errors: e });
    }
}

exports.marketNFTOwner = async(req,res) => {
    try {
        let nftId = Number(req.query.nftid); 
        await MarketContract.methods.checkMarket(nftId).call().then((market)=>{
            if(market == 'Auction'){
                 auctionCreateModel.aggregate([
                    {
                      '$match': {
                        'nftId': nftId
                      }
                    }, {
                      '$lookup': {
                        'from': 'userdbs', 
                        'localField': 'seller', 
                        'foreignField': 'address', 
                        'as': 'userData'
                      }
                    }, {
                      '$project': {
                        'seller': '$seller', 
                        'username': {
                          '$arrayElemAt': [
                            '$userData.displayName', 0
                          ]
                        },
                        'profileImage': {
                            '$arrayElemAt': [
                              '$userData.profileImage', 0
                            ]
                          }
                      }
                    }
                  ]).then((data)=>{
                    return res.status(200).send({ success: true, msg: "data found", data: data, errors: ''});
                  })
                
            }else if(market == 'Sale'){
    
                 saleModel.aggregate([
                      {
                        '$match': {
                          'nftId': nftId
                        }
                      }, {
                        '$lookup': {
                          'from': 'userdbs', 
                          'localField': 'seller', 
                          'foreignField': 'address', 
                          'as': 'userData'
                        }
                      }, {
                        '$project': {
                          'seller': '$seller', 
                          'username': {
                            '$arrayElemAt': [
                              '$userData.displayName', 0
                            ]
                          },
                          'profileImage': {
                            '$arrayElemAt': [
                              '$userData.profileImage', 0
                            ]
                          }
                        }
                      }
                    ]).then((data)=>{
                        return res.status(200).send({ success: true, msg: "data found", data: data, errors: ''});
                    })
    
                
            }else if(market == 'Deal'){
    
               dealModel.aggregate([
                    {
                      '$match': {
                        'nftId': nftId
                      }
                    }, {
                      '$lookup': {
                        'from': 'userdbs', 
                        'localField': 'seller', 
                        'foreignField': 'address', 
                        'as': 'userData'
                      }
                    }, {
                      '$project': {
                        'seller': '$seller', 
                        'username': {
                          '$arrayElemAt': [
                            '$userData.displayName', 0
                          ]
                        },
                        'profileImage': {
                          '$arrayElemAt': [
                            '$userData.profileImage', 0
                          ]
                        }
                      }
                    }
                  ]).then((data)=>{
                    return res.status(200).send({ success: true, msg: "data found", data: data, errors: ''});
                })
    
              return res.status(200).send({ success: true, msg: "data found", data: data, errors: ''});
          }else{
                let data = []
                return res.status(200).send({ success: false, msg: "no data found", data: data, errors: ''});
            }
        });

        
    } catch (e) {
        return res.status(201).send({ success: false, msg: "Error in fetching data", data: {}, errors: e });
    }
}

exports.getUserNFT = async (req, res) => {
    try {
        let id = JSON.parse(req.body.id);
        let address = req.body.address;
        if (id.length && address !== null && address !== undefined && address !== '') {
            
            await NFT.aggregate([
              {
                '$match': {
                  'NftId': {
                    '$in': id
                  }
                }
              }, {
                '$lookup': {
                  'from': 'transferevents', 
                  'let': {
                    'nftid': '$NftId', 
                    'user': address
                  }, 
                  'pipeline': [
                    {
                      '$match': {
                        '$expr': {
                          '$and': [
                            {
                              '$eq': [
                                '$tokenId', '$$nftid'
                              ]
                            }, {
                              '$eq': [
                                '$to', '$$user'
                              ]
                            }
                          ]
                        }
                      }
                    }, {
                      '$sort': {
                        'date': -1
                      }
                    }, {
                      '$project': {
                        'to': 1, 
                        'txnHash': 1, 
                        'date': 1, 
                        '_id': 0
                      }
                    }
                  ], 
                  'as': 'stockdata'
                }
              }, {
                '$project': {
                  '_id': '$_id', 
                  'NftId': '$NftId', 
                  'ipfs': '$ipfs', 
                  'txnHash': {
                    '$arrayElemAt': [
                      '$stockdata.txnHash', 0
                    ]
                  }, 
                  'user': {
                    '$arrayElemAt': [
                      '$stockdata.to', 0
                    ]
                  }, 
                  'date': {
                    '$arrayElemAt': [
                      '$stockdata.date', 0
                    ]
                  }
                }
              }, {
                '$lookup': {
                  'from': 'buyevents', 
                  'localField': 'txnHash', 
                  'foreignField': 'txHash', 
                  'as': 'buyData'
                }
              }, {
                '$lookup': {
                  'from': 'offerreceiveevents', 
                  'localField': 'txnHash', 
                  'foreignField': 'txHash', 
                  'as': 'offerData'
                }
              }, {
                '$lookup': {
                  'from': 'auctionclaimedevents', 
                  'localField': 'txnHash', 
                  'foreignField': 'txHash', 
                  'as': 'auctionClaimrData'
                }
              }, {
                '$lookup': {
                  'from': 'buydealevents', 
                  'localField': 'txnHash', 
                  'foreignField': 'txHash', 
                  'as': 'buyDealData'
                }
              }, {
                '$project': {
                  '_id': '$_id', 
                  'NftId': '$NftId', 
                  'ipfs': '$ipfs', 
                  'date': '$date', 
                  'txnHash': '$txnHash', 
                  'price': {
                    '$switch': {
                      'branches': [
                        {
                          'case': {
                            '$gt': [
                              {
                                '$arrayElemAt': [
                                  '$buyData.amount', 0
                                ]
                              }, 0
                            ]
                          }, 
                          'then': {
                            '$arrayElemAt': [
                              '$buyData.amount', 0
                            ]
                          }
                        }, {
                          'case': {
                            '$gt': [
                              {
                                '$arrayElemAt': [
                                  '$offerData.amount', 0
                                ]
                              }, 0
                            ]
                          }, 
                          'then': {
                            '$arrayElemAt': [
                              '$offerData.amount', 0
                            ]
                          }
                        }, {
                          'case': {
                            '$gt': [
                              {
                                '$arrayElemAt': [
                                  '$auctionClaimrData.amount', 0
                                ]
                              }, 0
                            ]
                          }, 
                          'then': {
                            '$arrayElemAt': [
                              '$auctionClaimrData.amount', 0
                            ]
                          }
                        }, {
                          'case': {
                            '$gt': [
                              {
                                '$arrayElemAt': [
                                  '$auctionClaimrData.amount', 0
                                ]
                              }, 0
                            ]
                          }, 
                          'then': {
                            '$arrayElemAt': [
                              '$auctionClaimrData.amount', 0
                            ]
                          }
                        }
                      ], 
                      'default': '0'
                    }
                  }
                }
              }, {
                '$lookup': {
                  'from': 'cancelsellmodels', 
                  'localField': 'txnHash', 
                  'foreignField': 'txHash', 
                  'as': 'cancelSell'
                }
              }, {
                '$lookup': {
                  'from': 'cancelauctionmodels', 
                  'localField': 'txnHash', 
                  'foreignField': 'txHash', 
                  'as': 'cancelAuction'
                }
              }, {
                '$lookup': {
                  'from': 'canceldealmodels', 
                  'localField': 'txnHash', 
                  'foreignField': 'txHash', 
                  'as': 'cancelDeal'
                }
              }, {
                '$match': {
                  '$and': [
                    {
                      'cancelDeal': {
                        '$eq': []
                      }
                    }, {
                      'cancelSell': {
                        '$eq': []
                      }
                    }, {
                      'cancelAuction': {
                        '$eq': []
                      }
                    }
                  ]
                }
              }, {
                '$sort': {
                  'date': -1
                }
              }, {
                '$group': {
                  '_id': '$NftId', 
                  'NftId': {
                    '$first': '$NftId'
                  }, 
                  'ipfs': {
                    '$first': '$ipfs'
                  }, 
                  'date': {
                    '$max': '$date'
                  }, 
                  'txnHash': {
                    '$first': '$txnHash'
                  }, 
                  'price': {
                    '$first': '$price'
                  }
                }
              }
            ]).then(async(data) => {
                    console.log(data);
                return res.status(201).send({ success: true, msg: "All nfts", data: data, errors: '' });
            })
        } else {
            return res.status(201).send({ success: false, msg: "empty array", data: {}, errors: '' });
        }
    } catch (e) {
        return res.status(201).send({ success: false, msg: "Error in fetching data", data: {}, errors: e });
    }
}

