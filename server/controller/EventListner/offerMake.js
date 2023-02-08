const dotenv = require('dotenv');
dotenv.config();
const offerMakeModel = require('../../model/offerMakeModel');
const cancelOfferModel = require('../../model/cancelOfferModel');
const eventModel = require('../../model/eventModel');
const saleModel = require("../../model/saleModel")
const mail = require('../mailSender/mailSender');
const Web3 = require("web3");
const common = require('./common');
const contract = common.contract;
const nftinfo = mail.nftData;
const sellerinfo = mail.getSeller;
const mailSender = mail.mailSender;

const web3 = new Web3(Web3.givenProvider || process.env.rpc_url);

async function lastOfferMail(nft, offerer, amount,lastOffer){  
    let nftData = await nftinfo(nft);
    let userData = await sellerinfo(offerer);
    let lastOfferData = await sellerinfo(lastOffer);

    userData = userData[0];
    nftData = nftData[0];
    lastOfferData = lastOfferData[0];

    if(typeof(nftData) == 'object' && typeof(lastOfferData)=='object'){
        if(lastOfferData.notification && 'items' in (JSON.parse(lastOfferData.notification)) && (JSON.parse(lastOfferData.notification)).items==true){
            let htmlContent = "<p>Hi "+lastOfferData.displayName+",</p><p>Your offer rejected on NFT <b><a href='"+(JSON.parse(nftData.ipfs)).image+"' target='_blank'>"+(JSON.parse(nftData.ipfs)).name+"</a></b> and winning offer is <b>"+Number(amount)/10**18+"</b> <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/1200px-Google_Chrome_icon_%28February_2022%29.svg.png' style='width:18px;height:18px; position:relative;top:-2px; margin-right:2px;' alt = ''/></p>";
            htmlContent = htmlContent + "<p>Winner name is: <b>"+userData.displayName+"</b></p><p>Your offer value will be refunded succesfully to your wallet address <b><a href='"+process.env.WalletUrl+lastOfferData.address+"' target='_blank'>wallet address</a></b></p><p>Team Codebird</p>";
            var subject = "Offer rejected";
            var to_mail = lastOfferData.email;
            mailSender(to_mail,subject,htmlContent)
        }else{
            console.log('Bid notificarion disabled')
        } 
    }else{
        console.log('type of data doesnt match for bidder')
    }  
}

async function nftOwnerOfferMail(nft,saleId, amount,offerer){
    var lastOffer = await contract.methods.saleDetailsByTokenId(nft).call();
    lastOfferAmount = parseInt(lastOffer.offerInfo.price);
    lastOffer = lastOffer.offerInfo.prevOfferer;
    const totalOffers = await offerMakeModel.find({saleId:Number(saleId)}).countDocuments();
    let nftData = await nftinfo(nft);
    let seller = await saleModel.find({saleId:Number(saleId)});
    seller = seller[0].seller;
    let sellerData = await sellerinfo(seller);
    let offererData = await sellerinfo(offerer);
    nftData = nftData[0];
    sellerData = sellerData[0];
    offererData = offererData[0];

    if(typeof(nftData) == 'object' && typeof(sellerData)=='object' && typeof(offererData)=='object'){
        if(sellerData.notification && 'items' in (JSON.parse(sellerData.notification)) && (JSON.parse(sellerData.notification)).items==true){
            let htmlContent = "<p>Hi "+sellerData.displayName+",</p><p>Your listed NFT <b><a href='"+(JSON.parse(nftData.ipfs)).image+"' target='_blank'>"+(JSON.parse(nftData.ipfs)).name+"</a></b> received a new offer <b>"+Number(amount)/10**18+"</b> <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/1200px-Google_Chrome_icon_%28February_2022%29.svg.png' style='width:18px;height:18px; position:relative;top:-2px; margin-right:2px;' alt = ''/>. ";
            htmlContent = htmlContent + "<p>Offerer name is <b>"+offererData.displayName+"</b></p><p>Team Codebird</p>";
            var subject = "New Offer";
            var to_mail = sellerData.email;
            mailSender(to_mail,subject,htmlContent)
        }else{
            console.log('Offer notification disabled')
        } 
    }else{
        console.log('type of data doesnt match for seller')
    }
    if(Number(totalOffers) > 1){
        if(lastOffer == '0x0000000000000000000000000000000000000000'){
            lastOffer = offerer;
        }
        lastOfferMail(nft,offerer, amount, lastOffer);
    }

}
let count = 0;
setInterval(function(){
    try{
        if(count == 0){
            count = 1;
            web3.eth.getBlockNumber().then((cbno)=>{
                contract.getPastEvents('OfferMaked', {
                    fromBlock: (cbno-900),
                    toBlock: cbno
                }, async function(error, events){
                    if(events){
                        
                        for(var i = 0 ; i < events.length; i++){
                            let list = (events[i].returnValues); 
                            let txs = events[i].transactionHash;
                            await offerMakeModel.find({txHash : txs}).countDocuments().then(async (data) => {
                                if(data == 0 || data == null){
                                    let cancelofferdata = await cancelOfferModel.find({$and:[{saleId:Number(list['_saleId'])},{ offerer : list['_offerer']},{nftId : list['_tokenId']}]});
                                    
                                    if(cancelofferdata.length > 0){
                                        let n = cancelofferdata.length - 1;
                                        if(Number(cancelofferdata[n].txTime) < Number(list['_time'])){
                                            let eventlist = new offerMakeModel({
                                                saleId : list['_saleId'],
                                                offerer : list['_offerer'],
                                                nftId : list['_tokenId'],
                                                txHash : txs,
                                                txTime : list['_time'],
                                                amount : list['_price'], 
                                            }, {ordered : false })
                                            eventlist.save(eventlist).then(data =>{
                                                console.log("Data Save with tokenID" , list['_tokenId']);  
                                                nftOwnerOfferMail(list['_tokenId'],list['_saleId'],list['_price'],list['_offerer']);
                                                
                                            })           
                                            .catch(err =>{
                                                console.error("error",err);
                                            });
                                        }
                                    }else{
                                        let eventlist = new offerMakeModel({
                                            saleId : list['_saleId'],
                                            offerer : list['_offerer'],
                                            nftId : list['_tokenId'],
                                            txHash : txs,
                                            txTime : list['_time'],
                                            amount : list['_price'], 
                                        }, {ordered : false })
                                        eventlist.save(eventlist).then(data =>{
                                            console.log("Data Save with tokenID" , list['_tokenId']);
                                            nftOwnerOfferMail(list['_tokenId'],list['_saleId'],list['_price'],list['_offerer']);
                                            
                                        })           
                                        .catch(err =>{
                                            console.error("error",err);
                                        });
                                    }
                                    
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