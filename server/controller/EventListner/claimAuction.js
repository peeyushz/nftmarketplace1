const dotenv = require('dotenv');
dotenv.config();
const auctionClaimedModel = require('../../model/claimAuctionModel');
const auctionCreateModel = require('../../model/auctionCreateModel');
const eventModel = require('../../model/eventModel');
const Web3 = require("web3");
const common = require('./common');
const contract = common.contract;

const web3 = new Web3(Web3.givenProvider || process.env.rpc_url);
let count = 0;
setInterval(function(){ 
    try{
        if(count == 0){
            count = 1;
            web3.eth.getBlockNumber().then((cbno)=>{
                contract.getPastEvents('AuctionClaimed', {
                    fromBlock: (cbno-900),
                    toBlock: cbno
                }, async function(error, events){
                    if(events){
                        for(var i = 0 ; i < events.length  ; i++)
                    {
                        let list = (events[i].returnValues); 
                        let txs = events[i].transactionHash;
                        await auctionClaimedModel.find({txHash : txs}).countDocuments().then(async (data) => {
                            if(data == 0 || data == null){
                                // console.log("hi",txs);
                                let eventlist = new auctionClaimedModel({
                                    auctionId :list['_id'],
                                    buyer : list['_buyer'],
                                    seller : list['_seller'],
                                    nftId : list['_tokenId'],
                                    txHash : txs,
                                    amount : list['_price'],  
                                    txTime :  list['_time'], 
                                }, {ordered : false })           
                                eventlist.save(eventlist).then(async(data) => {
                                    if(data){
                                        await auctionCreateModel.findOneAndDelete({nftId : list['_tokenId']})
                                        await eventModel.find({txHash : txs}).countDocuments().then(async (data) => {
                                            if(data == 0 || data == null){
                                                let eventdata = new eventModel({
                                                    type : 'AuctionClaimed',
                                                    buyer : list['_buyer'],
                                                    nftId : list['_tokenId'],
                                                    txHash : txs,
                                                    amount : list['_price'],  
                                                    buyTime :  list['_time'], 
                                                }, {ordered : false })
            
                                                eventdata.save(eventdata).then(async(data) =>{
                                                    console.log("Data Save with tokenID" , list['_tokenId']);
                                                })
                                            }
                                        })
                                    }
                                }).catch(err =>{
                                    console.error("error",err);
                                });
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