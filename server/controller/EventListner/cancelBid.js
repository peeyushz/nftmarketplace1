const dotenv = require('dotenv');
dotenv.config();
const bidModel = require('../../model/bidModel');
const cancelBid = require('../../model/cancelBidModel');
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
                contract.getPastEvents('BidCancelled', {
                    fromBlock: (cbno-900),
                    toBlock: cbno
                }, async function(error, events){
                    if(events){
                        // console.log('cancelBid',events)
                        for(var i = 0 ; i < events.length  ; i++){
                            let list = (events[i].returnValues); 
                            let txs = events[i].transactionHash;
                                
                                await cancelBid.find({txHash : `${txs}`}).countDocuments().then(async (data) => {
                                    if(data == 0 || data == null){
        
                                        await bidModel.deleteMany({$and:[{auctionId:Number(list['_auctionId'])},{nftId : list['_tokenId']},{bidder:list["_bidder"]}]}).then(async(data) =>{
                                            console.log('data'+data)
                                            if(data != null){
                                                console.log("Data Deleted with tokenID" , list['_tokenId']);
                                            }
        
                                            let eventlist = new cancelBid({
                                                auctionId : list['_auctionId'],
                                                bidder : list['_bidder'],
                                                nftId : list['_tokenId'],
                                                txHash : txs,
                                                txTime : list['_time'],
                                                amount : list['_amount'],
                                            }, {ordered : false })           
                                            eventlist.save(eventlist).then(data => {
                                                console.log("Data saved with tokenID" , list['_tokenId']);
                                            }).catch(err =>{
                                                console.error("error",err);
                                            });  
                                            
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