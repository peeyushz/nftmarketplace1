const dotenv = require('dotenv');
dotenv.config();
const auctionCreateModel = require('../../model/auctionCreateModel');
const saleModel = require('../../model/saleModel');
const dealCreateModel = require('../../model/dealCreateModel');
const eventModel = require('../../model/eventModel');
const common = require('./common');
const Web3 = require("web3");
const web3 = new Web3(Web3.givenProvider || process.env.rpc_url);
const contract = common.contract;

let count = 0;
setInterval(function(){ 
    try{
        if(count == 0){
            count = 1;
            web3.eth.getBlockNumber().then((cbno)=>{
                contract.getPastEvents('DealCreated', {
                    fromBlock: (cbno-900),
                    toBlock: cbno
                }, async function(error, events){
                    
                    if(events){
                        for(var i = 0 ; i < events.length  ; i++){
                        let list = (events[i].returnValues); 
                        let txs = events[i].transactionHash;
                        await dealCreateModel.find({txHash : `${txs}`}).countDocuments().then(async (data) => {
                            if(data == 0 || data == null){
                                // await saleModel.findOneAndDelete({nftId : list['_tokenId']});
                                    // await auctionCreateModel.findOneAndDelete({nftId : list['_tokenId']});
                                    await dealCreateModel.findOneAndDelete({nftId : list['_tokenId']}).then(async(data)=>{
                                        let market = await contract.methods.checkMarket (list['_tokenId']).call();
                                            if(market == 'Deal'){
                                                await eventModel.findOneAndDelete({nftId : list['_tokenId']});
                                                let eventlist = new dealCreateModel({
                                                    seller : list['_seller'],
                                                    nftId : list['_tokenId'],
                                                    txHash : txs,
                                                    txTime : list['_time'],
                                                    amount : list['_price'],
                                                    startTime : list['_startTime'],
                                                    endTime : list['_endTime'],     
                                                }, {ordered : false })           
                                                eventlist.save(eventlist).then(data => {
                                                    console.log("Data Save with tokenID" , list['_tokenId']);
                                                }).catch(err =>{
                                                    console.error("error",err);
                                                });
                                            }
                                    })
                                        
                            }
                        })
                    }
                    
                    }
                    
                    
                })
            })
            count = 0;
        }
        
    } catch (err) {
        console.error(err);
    }
       
}, 1000*10);