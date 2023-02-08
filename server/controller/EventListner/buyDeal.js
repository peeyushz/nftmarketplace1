const dotenv = require('dotenv');
dotenv.config();
const buyDealModel = require('../../model/buyDealModel');
const dealCreateModel = require('../../model/dealCreateModel');
const eventModel = require('../../model/eventModel');
const Web3 = require("web3");
const common = require('./common');
const mail = require('../mailSender/mailSender');
const contract = common.contract;
const nftinfo = mail.nftData;
const sellerinfo = mail.getSeller;
const mailSender = mail.mailSender;

const web3 = new Web3(Web3.givenProvider || process.env.rpc_url);

async function buyMail(nft, buyer, amount,txs){
    const gasPrice  = await web3.eth.getTransaction(txs);
    let nftData = await nftinfo(nft);
    let userData = await sellerinfo(buyer);
    nftData = nftData[0];
    userData = [0];
    if(typeof(nftData) == 'object' && typeof(userData)=='object'){
        if(userData.notification && 'items' in (JSON.parse(userData.notification)) && (JSON.parse(userData.notification)).items==true){
            let htmlContent = "<p>Congratulations "+userData.displayName+",</p>Purchased NFT <b><a href='"+(JSON.parse(nftData.ipfs)).image+"' target='_blank'>"+(JSON.parse(nftData.ipfs)).name+"</a></b> succesfully transferred to your wallet address <b><a href='"+process.env.WalletUrl+lastBidderData.address+"' target='_blank'>wallet address</a></b></p>";
            htmlContent = htmlContent + "<p>Price: <b>"+amount/10**18+"</b></p><p>Gas Fees <b>"+Number(gasPrice.gasPrice)/10**9+"</b></p><p>Team Codebird</p>";
            var subject = "Mail regarding item purchased";
            var to_mail = userData.email;
            mailSender(to_mail,subject,htmlContent)
        }
        
    }   
}

let count = 0;
setInterval(function(){
    try{
        if(count == 0){
            count = 1;
            web3.eth.getBlockNumber().then((cbno)=>{
                contract.getPastEvents('BuyDeal', {
                    fromBlock: (cbno-1000),
                    toBlock: cbno
                }, async function(error, events){
                    if(events){
                        for(var i = 0 ; i < events.length  ; i++)
                    {
                        let list = (events[i].returnValues); 
                        let txs = events[i].transactionHash;
                        await buyDealModel.find({txHash : txs}).countDocuments().then(async (data) => {
                            if(data == 0 || data == null){
                                // console.log("hi",txs);
                                let eventlist = new buyDealModel({
                                    buyer : list['_buyer'],
                                    seller : list['_seller'],
                                    nftId : list['_tokenId'],
                                    txHash : txs,
                                    amount : list['_price'],  
                                    txTime :  list['_time'], 
                                }, {ordered : false })           
                                eventlist.save(eventlist).then(async(data) => {
                                    if(data){
                                        await eventModel.find({txHash : txs}).countDocuments().then(async (data) => {
                                            if(data == 0 || data == null){
                                                let eventdata = new eventModel({
                                                    type : 'BuyDeal',
                                                    buyer : list['_buyer'],
                                                    nftId : list['_tokenId'],
                                                    txHash : txs,
                                                    amount : list['_price'],  
                                                    buyTime :  list['_time'], 
                                                }, {ordered : false })
            
                                                eventdata.save(eventdata).then(async(data) =>{
                                                    await dealCreateModel.findOneAndDelete({nftId : list['_tokenId']});
                                                    buyMail(list['_tokenId'], list['_buyer'], list['_price'], txs)
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