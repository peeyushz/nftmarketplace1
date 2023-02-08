const dotenv = require('dotenv');
dotenv.config();
const offerClaimModel = require('../../model/offerClaimModel');
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
                contract.getPastEvents('OfferClaimed', {
                    fromBlock: (cbno-900),
                    toBlock: cbno
                }, async function(error, events){
                    
                    if(events){
                        for(var i = 0 ; i < events.length  ; i++){
                        let list = (events[i].returnValues); 
                        let txs = events[i].transactionHash;
                        await offerClaimModel.find({txHash : txs}).countDocuments().then(async (data) => {
                            
                            if(data == 0 || data == null){
                                
                                let eventlist = new offerClaimModel({
                                    // saleId : list['_saleId'],
                                    buyer : list['_buyer'],
                                    nftId : list['_tokenId'],
                                    txHash : txs,
                                    txTime : list['_time'],
                                    amount : list['_price'], 
                                }, {ordered : false })  
                                
                                eventlist.save(eventlist).catch(err =>{
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