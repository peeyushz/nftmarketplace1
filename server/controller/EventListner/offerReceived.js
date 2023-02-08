const dotenv = require('dotenv');
dotenv.config();
const offerReceiveModel = require('../../model/offerRecievedModel');
const eventModel = require('../../model/eventModel');
const saleModel = require('../../model/saleModel');
const mail = require('../mailSender/mailSender');
const Web3 = require("web3");
const common = require('./common');
const contract = common.contract;
const nftinfo = mail.nftData;
const sellerinfo = mail.getSeller;
const mailSender = mail.mailSender;
const web3 = new Web3(Web3.givenProvider || process.env.rpc_url);

async function offerAcceptedMail(nftId,offerer,amount,gasPrice){
    let nftData = await nftinfo(nftId);
    let offererData = await sellerinfo(offerer);
    nftData = nftData[0];
    offererData = offererData[0];
    const PlatformFee = await contract.methods.sell_token_fee().call();
    if(typeof(nftData) == 'object' && typeof(offererData)=='object'){
        if(offererData.notification && 'items' in (JSON.parse(offererData.notification)) && (JSON.parse(offererData.notification)).items==true){
            let htmlContent = "<p>Congratulations  "+offererData.displayName+",</p><p>Your offer accepted for the NFT <b><a href='"+(JSON.parse(nftData.ipfs)).image+"' target='_blank'>"+(JSON.parse(nftData.ipfs)).name+"</a></b> ";
            htmlContent = htmlContent + "<p>Offer value: <b>"+amount/10**18+"</b></p><p>Platform fees <b>"+Number(PlatformFee)/10**18+"</b></p><p>Gas Fees <b>"+(gasPrice)/10**9+"</b></p><p>NFT successfully transferred to your wallet address. Please check and confirm.</p><p>Team Codebird</p>";
            var subject = "Offer Accepted";
            var to_mail = offererData.email;
            mailSender(to_mail,subject,htmlContent);
        }else{
            console.log('bids notification disabled')
        } 
    }else{
        console.log('type of data doesnt match for seller')
    }
}

async function nftSoldMail(nftId,amount,offerer,seller,gasPrice){
    let nftData = await nftinfo(Number(nftId));
    let sellerData = await sellerinfo(seller);
    nftData = nftData[0];
    sellerData = sellerData[0];
    const PlatformFee = await contract.methods.sell_token_fee().call();
    if(typeof(nftData) == 'object' && typeof(sellerData)=='object'){
        if(sellerData.notification && 'items' in (JSON.parse(sellerData.notification)) && (JSON.parse(sellerData.notification)).items==true){
            let htmlContent = "<p>Congratulations  "+sellerData.displayName+",</p><p>Your listed NFT has been transferred successfully <b><a href='"+(JSON.parse(nftData.ipfs)).image+"' target='_blank'>"+(JSON.parse(nftData.ipfs)).name+"</a></b> to your chosen offerer.";
            htmlContent = htmlContent + "<p>Offer value: "+Number(amount)/10**18+"</p><p>Platform fees <b>"+Number(PlatformFee)/10**18+"</b></p><p>Gas Fees <b>"+(gasPrice)/10**9+"</b></p><p>NFT successfully transferred to purchaser <b><a href='"+process.env.WalletUrl+offerer+"' target='_blank'>wallet address</a></b></p><p>Team Codebird</p>";
            var subject = "NFT sold";
            var to_mail = sellerData.email;
            mailSender(to_mail,subject,htmlContent);
        }else{
            console.log('bids notification disabled')
        } 
    }else{
        console.log('type of data doesnt match for seller')
    }
}

let count = 0;
setInterval(function(){ 
    try{
        if(count == 0){
            count = 1;
            web3.eth.getBlockNumber().then((cbno)=>{
                contract.getPastEvents('OfferReceived', {
                    fromBlock: (cbno-900),
                    toBlock: cbno
                }, async function(error, events){
                    if(events){
                       for(var i = 0 ; i < events.length  ; i++)
                    {
                        let list = (events[i].returnValues); 
                        let txs = events[i].transactionHash;
                        await offerReceiveModel.find({txHash : txs}).countDocuments().then(async (data) => {
                            if(data == 0 || data == null){
                                let seller = list['_seller']
                                let eventlist = new offerReceiveModel({
                                    saleId : list['_saleId'],
                                    offerer : list['_buyer'],
                                    nftId : list['_tokenId'],
                                    txHash : txs,
                                    txTime : list['_time'],
                                    amount : list['_price'], 
                                }, {ordered : false })           
                                eventlist.save(eventlist).then(async(data) => {
                                    if(data){
                                        await eventModel.find({txHash : txs}).countDocuments().then(async (data) => {
                                            if(data == 0 || data == null){
                                                let eventdata = new eventModel({
                                                    type : 'OfferReceived',
                                                    buyer : list['_buyer'],
                                                    nftId : list['_tokenId'],
                                                    txHash : txs,
                                                    buyTime : list['_time'],
                                                    amount : list['_price'],  
                                                }, {ordered : false })
            
                                                eventdata.save(eventdata).then(async(data) =>{
                                                    const gasPrice = await web3.eth.getTransaction(txs);
                                                    await saleModel.findOneAndDelete({nftId : list['_tokenId']});
                                                    console.log("Data Save with tokenID" , list['_tokenId']);
                                                    offerAcceptedMail(list['_tokenId'],list['_buyer'],list['_price'], gasPrice.gasPrice);
                                                    nftSoldMail(list['_tokenId'],list['_price'],list['_buyer'],seller, gasPrice.gasPrice);
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