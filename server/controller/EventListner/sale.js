const dotenv = require('dotenv');
dotenv.config();
const saleModel = require('../../model/saleModel');
const eventModel = require('../../model/eventModel');
const auctionCreateModel = require('../../model/auctionCreateModel');
const dealCreateModel = require('../../model/dealCreateModel');
const Web3 = require("web3");
const common = require('./common');
const contract = common.contract;	
// const web3 = new Web3(Web3.givenProvider || process.env.rpc_url);
// const web3 = new Web3(Web3.givenProvider || process.env.rpc_url);
const web3 = new Web3("https://rpc-mumbai.maticvigil.com/");
// console.log("url", process.env.rpc_url)

let count = 0;

setInterval(function(){ 
    try{
        if(count == 0){
            count = 1;
            

            web3.eth.getBlockNumber().then((cbno)=>{
                contract.getPastEvents('Sell', {
                        fromBlock: cbno-1000,
                        toBlock: cbno
                    }, async function(error, events){
                        if(events){
                            for(let i = 0 ; i < events.length  ; i++)
                        {
                            let list = (events[i].returnValues); 
                            let txs = events[i].transactionHash;
                            await saleModel.find({txHash : `${txs}`}).countDocuments().then(async (counted) => {
                                if(counted == 0 || counted == null){
                                    
                                    await saleModel.findOneAndDelete({nftId : list['_tokenId']}).then(async(deletededata) => {
                                        
                                        let market = await contract.methods.checkMarket (list['_tokenId']).call();
                                        console.log(market);
                                        // await auctionCreateModel.findOneAndDelete({nftId : list['_tokenId']});
                                            //  await dealCreateModel.findOneAndDelete({nftId : list['_tokenId']});
                                                if(market == 'Sale'){   
                                                    await eventModel.findOneAndDelete({nftId : list['_tokenId']});
                                                    let eventlist = new saleModel({
                                                        saleId : list['_id'],
                                                        seller : list['_seller'],
                                                        nftId : list['_tokenId'],
                                                        txHash : txs,
                                                        txTime : list['_time'],
                                                        amount : list['_price'],      
                                                    }, {ordered : false })           
                                                    eventlist.save(eventlist).then(datasaved => {
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
       
}, 1000*2);