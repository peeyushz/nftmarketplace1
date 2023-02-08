"use strict";
const transfer = require('../../model/transferModel');
const bid = require('../../model/bidModel');
const auction = require("../../model/auctionCreateModel");
const bidModel = require('../../model/bidModel');
const offerMakeModel = require('../../model/offerMakeModel');

exports.getAllActivity = async (req, res) => {
    try{
        let tokenId = Number(req.body.tokenId);
        let filter = req.body.filter;
        // console.log('filter',filter);
        console.log('tokenId',tokenId);
        if(tokenId != '')
        {
            let data = {};
           
            if(filter != ''){
                data ["auction"] = [];
                data ["transfer"] = [];
                data ["mint"] = [];
                data ["sale"] = [];
                data ["bid"] = [];
                data ["offer"] = [];
                let split = filter.split(",");
                if(split.includes("auction")){
                    let AuctionData = await transfer.aggregate([
                        {
                          '$match': {
                            '$and': [
                              {
                                'tokenId': tokenId
                              }, {
                                'type': 'Auction'
                              }
                            ]
                          }
                        }, {
                          '$lookup': {
                            'from': 'userdbs', 
                            'localField': 'from', 
                            'foreignField': 'address', 
                            'as': 'userFrom'
                          }
                        }, {
                          '$lookup': {
                            'from': 'userdbs', 
                            'localField': 'to', 
                            'foreignField': 'address', 
                            'as': 'userTo'
                          }
                        }, {
                          '$project': {
                            'from': '$from', 
                            'to': '$to', 
                            'nftId': '$tokenId', 
                            'price': '$amount', 
                            'date': '$date', 
                            'type': '$type', 
                            'userFrom': {
                              '$arrayElemAt': [
                                '$userFrom.displayName', 0
                              ]
                            }, 
                            'userTo': {
                              '$arrayElemAt': [
                                '$userTo.displayName', 0
                              ]
                            }
                          }
                        }
                      ])
                      
                    data ["auction"] = AuctionData;
                }

                if(split.includes("transfer")){
                    let transferData = await transfer.aggregate([
                        {
                          '$match': {
                            '$and': [
                              {
                                'tokenId': tokenId
                              }, {
                                'type': 'Transfer'
                              }
                            ]
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
                          '$lookup': {
                            'from': 'userdbs', 
                            'localField': 'from', 
                            'foreignField': 'address', 
                            'as': 'userFrom'
                          }
                        }, {
                          '$lookup': {
                            'from': 'userdbs', 
                            'localField': 'to', 
                            'foreignField': 'address', 
                            'as': 'userTo'
                          }
                        }, {
                          '$project': {
                            'from': '$from', 
                            'to': '$to', 
                            'nftId': '$tokenId', 
                            'price': '$amount', 
                            'date': '$date', 
                            'type': '$type', 
                            'userFrom': {
                              '$arrayElemAt': [
                                '$userFrom.displayName', 0
                              ]
                            }, 
                            'userTo': {
                              '$arrayElemAt': [
                                '$userTo.displayName', 0
                              ]
                            }, 
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
                        }
                      ]);
                    data ["transfer"] = transferData;
                }
                if(split.includes("sale")){
                    let saleData = await transfer.aggregate([
                        {
                          '$match': {
                            '$and': [
                              {
                                'tokenId': tokenId
                              }, {
                                'type': 'Sale'
                              }
                            ]
                          }
                        }, {
                          '$lookup': {
                            'from': 'userdbs', 
                            'localField': 'from', 
                            'foreignField': 'address', 
                            'as': 'userFrom'
                          }
                        }, {
                          '$lookup': {
                            'from': 'userdbs', 
                            'localField': 'to', 
                            'foreignField': 'address', 
                            'as': 'userTo'
                          }
                        }, {
                          '$project': {
                            'from': '$from', 
                            'to': '$to', 
                            'nftId': '$tokenId', 
                            'price': '$amount', 
                            'date': '$date', 
                            'type': '$type', 
                            'userFrom': {
                              '$arrayElemAt': [
                                '$userFrom.displayName', 0
                              ]
                            }, 
                            'userTo': {
                              '$arrayElemAt': [
                                '$userTo.displayName', 0
                              ]
                            }
                          }
                        }
                      ]);
                      data ["sale"] = saleData;
                }
                if(split.includes("mint")){
                    let mintData = await transfer.aggregate([
                        {
                          '$match': {
                            '$and': [
                              {
                                'tokenId': tokenId
                              }, {
                                'type': 'Mint'
                              }
                            ]
                          }
                        }, {
                          '$lookup': {
                            'from': 'userdbs', 
                            'localField': 'from', 
                            'foreignField': 'address', 
                            'as': 'userFrom'
                          }
                        }, {
                          '$lookup': {
                            'from': 'userdbs', 
                            'localField': 'to', 
                            'foreignField': 'address', 
                            'as': 'userTo'
                          }
                        }, {
                          '$project': {
                            'from': '$from', 
                            'to': '$to', 
                            'nftId': '$tokenId', 
                            'price': '$amount', 
                            'date': '$date', 
                            'type': '$type', 
                            'userFrom': {
                              '$arrayElemAt': [
                                '$userFrom.displayName', 0
                              ]
                            }, 
                            'userTo': {
                              '$arrayElemAt': [
                                '$userTo.displayName', 0
                              ]
                            }
                          }
                        }
                      ]);
                    data ["mint"] = mintData;
                }
                if(split.includes("bid")){
                    let transferData = await bidModel.aggregate([
                        {
                          '$match': {
                            'nftId': tokenId
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
                            'from': '$bidder', 
                            'nftId': '$nftId',
                            'type': 'Bid', 
                            'price': '$amount', 
                            'date': '$date', 
                            'userFrom': {
                              '$arrayElemAt': [
                                '$userData.displayName', 0
                              ]
                            }
                          }
                        }
                      ]);
                    data ["bid"] = transferData;
                }
                if(split.includes("offer")){
                    let transferData = await offerMakeModel.aggregate([
                        {
                          '$match': {
                            'nftId': tokenId
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
                            'from': '$offerer', 
                            'nftId': '$nftId',
                            'type': 'Offer', 
                            'price': '$amount', 
                            'date': '$date', 
                            'userFrom': {
                              '$arrayElemAt': [
                                '$userData.displayName', 0
                              ]
                            }
                          }
                        }
                      ]);
                    data ["offer"] = transferData;
                }
                
                return res.status(200).send({ success: true, msg: "All Activity", data: data, errors: '' });
            }else{
                
                let transferData = await transfer.aggregate([
                        {
                          '$match': {
                            '$and': [
                              {
                                'tokenId': tokenId
                              }, {
                                'type': 'Transfer'
                              }
                            ]
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
                          '$lookup': {
                            'from': 'userdbs', 
                            'localField': 'from', 
                            'foreignField': 'address', 
                            'as': 'userFrom'
                          }
                        }, {
                          '$lookup': {
                            'from': 'userdbs', 
                            'localField': 'to', 
                            'foreignField': 'address', 
                            'as': 'userTo'
                          }
                        }, {
                          '$project': {
                            'from': '$from', 
                            'to': '$to', 
                            'nftId': '$tokenId', 
                            'price': '$amount', 
                            'date': '$date', 
                            'type': '$type', 
                            'userFrom': {
                              '$arrayElemAt': [
                                '$userFrom.displayName', 0
                              ]
                            }, 
                            'userTo': {
                              '$arrayElemAt': [
                                '$userTo.displayName', 0
                              ]
                            }, 
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
                        }
                      ]);
                
                let AuctionData = await transfer.aggregate([
                    {
                      '$match': {
                        '$and': [
                          {
                            'tokenId': tokenId
                          }, {
                            'type': 'Auction'
                          }
                        ]
                      }
                    }, {
                      '$lookup': {
                        'from': 'userdbs', 
                        'localField': 'from', 
                        'foreignField': 'address', 
                        'as': 'userFrom'
                      }
                    }, {
                      '$lookup': {
                        'from': 'userdbs', 
                        'localField': 'to', 
                        'foreignField': 'address', 
                        'as': 'userTo'
                      }
                    }, {
                      '$project': {
                        'from': '$from', 
                        'to': '$to', 
                        'nftId': '$tokenId', 
                        'price': '$amount', 
                        'date': '$date', 
                        'type': '$type', 
                        'userFrom': {
                          '$arrayElemAt': [
                            '$userFrom.displayName', 0
                          ]
                        }, 
                        'userTo': {
                          '$arrayElemAt': [
                            '$userTo.displayName', 0
                          ]
                        }
                      }
                    }
                  ])
  
                let mintData = await transfer.aggregate([
                    {
                      '$match': {
                        '$and': [
                          {
                            'tokenId': tokenId
                          }, {
                            'type': 'Mint'
                          }
                        ]
                      }
                    }, {
                      '$lookup': {
                        'from': 'userdbs', 
                        'localField': 'from', 
                        'foreignField': 'address', 
                        'as': 'userFrom'
                      }
                    }, {
                      '$lookup': {
                        'from': 'userdbs', 
                        'localField': 'to', 
                        'foreignField': 'address', 
                        'as': 'userTo'
                      }
                    }, {
                      '$project': {
                        'from': '$from', 
                        'to': '$to', 
                        'nftId': '$tokenId', 
                        'price': '$amount', 
                        'date': '$date', 
                        'type': '$type', 
                        'userFrom': {
                          '$arrayElemAt': [
                            '$userFrom.displayName', 0
                          ]
                        }, 
                        'userTo': {
                          '$arrayElemAt': [
                            '$userTo.displayName', 0
                          ]
                        }
                      }
                    }
                  ]);

                  let saleData = await transfer.aggregate([
                    {
                      '$match': {
                        '$and': [
                          {
                            'tokenId': tokenId
                          }, {
                            'type': 'Sale'
                          }
                        ]
                      }
                    }, {
                      '$lookup': {
                        'from': 'userdbs', 
                        'localField': 'from', 
                        'foreignField': 'address', 
                        'as': 'userFrom'
                      }
                    }, {
                      '$lookup': {
                        'from': 'userdbs', 
                        'localField': 'to', 
                        'foreignField': 'address', 
                        'as': 'userTo'
                      }
                    }, {
                      '$project': {
                        'from': '$from', 
                        'to': '$to', 
                        'nftId': '$tokenId', 
                        'price': '$amount', 
                        'date': '$date', 
                        'type': '$type', 
                        'userFrom': {
                          '$arrayElemAt': [
                            '$userFrom.displayName', 0
                          ]
                        }, 
                        'userTo': {
                          '$arrayElemAt': [
                            '$userTo.displayName', 0
                          ]
                        }
                      }
                    }
                  ]);

                let bidData = await bidModel.aggregate([
                    {
                      '$match': {
                        'nftId': tokenId
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
                        'from': '$bidder', 
                        'nftId': '$nftId', 
                        'price': '$amount', 
                        'date': '$date', 
                        'type': 'Bid',
                        'userFrom': {
                          '$arrayElemAt': [
                            '$userData.displayName', 0
                          ]
                        }
                      }
                    }
                  ]);
                  
                let offerData = await offerMakeModel.aggregate([
                        {
                          '$match': {
                            'nftId': tokenId
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
                            'from': '$offerer', 
                            'nftId': '$nftId', 
                            'price': '$amount', 
                            'date': '$date',
                            'type': 'Offer',
                            'userFrom': {
                              '$arrayElemAt': [
                                '$userData.displayName', 0
                              ]
                            }
                          }
                        }
                      ])
                data["transfer"] = transferData;
                
                data["auction"] = AuctionData;
                
                data["mint"] = mintData;
                
                data["sale"] = saleData;
                
                data["bid"] = bidData;
                data["offer"] = offerData;
                return res.status(200).send({ success: true, msg: "All Activity", data: data, errors: '' });
            }
        }
         else {
            return res.status(201).send({ success: false, msg: "No All Activity", data: [], errors: '' });
        }

    }catch(e){
        return res.status(201).send({ success: false, msg: "Error in fetching data", data: [], errors: e });
    }
}

