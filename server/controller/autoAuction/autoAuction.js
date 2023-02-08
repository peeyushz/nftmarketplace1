const auction_model = require('../../model/auctionCreateModel');
const common = require('../EventListner/common')
const Web3 = require("web3");
const dotenv = require('dotenv');
dotenv.config();
const web3 = new Web3(process.env.rpc_url || Web3.givenProvider);
const account =  web3.eth.accounts.wallet.add(process.env.address_key);
let add = account.address;
const contract = common.contract;
const contract_address = common.contract_address
const privateKey = process.env.address_key;
const mail = require('../mailSender/mailSender');
const nftinfo = mail.nftData;
const sellerinfo = mail.getSeller;
const mailSender = mail.mailSender;

async function bidWinMail(nftId,gaslimit,lastBid,lastBidder){
    
    let nftData = await nftinfo(nftId);
    let bidderData = await sellerinfo(lastBidder);
    nftData = nftData[0];
    bidderData = bidderData[0];
    const PlatformFee = await contract.methods.auction_token_fee().call();
    if(typeof(nftData) == 'object' && typeof(bidderData)=='object'){
        if(bidderData.notification && 'bids' in (JSON.parse(bidderData.notification)) && (JSON.parse(bidderData.notification)).bids==true){
            let htmlContent = "<p>Congratulations  "+bidderData.displayName+",</p><p>Your bid won the NFT <br><a href='"+(JSON.parse(nftData.ipfs)).image+"' target='_blank'>"+(JSON.parse(nftData.ipfs)).name+"</a></br>";
            htmlContent = htmlContent + "<p>Bid value: <b>"+lastBid/10**18+"</b></p><p>Platform fees <b>"+Number(PlatformFee)/10**18+"</b></p><p>Gas Fees <b>"+gaslimit/10**9+"</b></p><p>NFT successfully transferred to your wallet address. Please check and confirm.</p><p>Team Codebird</p>";
            var subject = "Bid Won";
            var to_mail = bidderData.email;
            console.log(to_mail,subject,htmlContent)
            mailSender(to_mail,subject,htmlContent)
        }else{
            console.log('bids notification disabled')
        } 
    }else{
        console.log('type of data doesnt match for seller')
    }
}
async function nftSoldMail(nftId,gaslimit,seller,lastBid,lastBidder){
    
    let nftData = await nftinfo(nftId);
    let sellerData = await sellerinfo(seller);
    nftData = nftData[0];
    sellerData = sellerData[0];
    const PlatformFee = await contract.methods.auction_token_fee().call();
    if(typeof(nftData) == 'object' && typeof(sellerData)=='object'){
        if(sellerData.notification && 'bids' in (JSON.parse(sellerData.notification)) && (JSON.parse(sellerData.notification)).bids==true){
            let htmlContent = "<p>Congratulations  "+sellerData.displayName+",</p><p>Your listed NFT <br><a href='"+(JSON.parse(nftData.ipfs)).image+"' target='_blank'>"+(JSON.parse(nftData.ipfs)).name+"</a></br> has been sold succesfully.";
            htmlContent = htmlContent + "<p>Bid value: <b>"+lastBid/10**18+"</b></p><p>Platform fees <b>"+Number(PlatformFee)/10**18+"</b></p><p>Gas Fees <b>"+gaslimit/10**18+"</b></p><p>NFT successfully transferred to purchaser <b><a href='"+process.env.WalletUrl+lastBidder+"' target='_blank'>wallet address</a></b></p><p>Team Codebird</p>";
            var subject = "NFT sold";
            var to_mail = sellerData.email;
            mailSender(to_mail,subject,htmlContent)
        }else{
            console.log('bids notification disabled')
        } 
    }else{
        console.log('type of data doesnt match for seller')
    }
}
 


async function sendTrans(nftId){
    let auctionData = await contract.methods.getAuction(nftId).call();
    let seller = await auction_model.find({auctionId:Number(auctionData.id)});
    seller = seller[0].seller;
    let gaslimit = await contract.methods.auctionClaim(nftId).estimateGas({from:add});

    var transfer = contract.methods.auctionClaim(nftId);
    var encodedABI = transfer.encodeABI();

    var tx = {
        from: add,  // Owner address
        to: contract_address,//conttract address
        gas: gaslimit,
        data: encodedABI
    };

    web3.eth.accounts.signTransaction(tx, privateKey).then(signed => {
        var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);
        tran.on('receipt', receipt => {
            console.log('reciept',receipt);
            // send Mail section
            console.log(nftId, gaslimit, auctionData.highestBid, auctionData.highestBidder, seller)
            bidWinMail(nftId, gaslimit, auctionData.highestBid, auctionData.highestBidder);
            nftSoldMail(nftId, gaslimit, seller, auctionData.highestBid, auctionData.highestBidder);
            //Mail send section ends here
        });
        tran.on('error', console.error);
    });
}

setInterval(async() => {

        let now = (new Date()).getTime()/1000 ;
        let auctionData = await auction_model.find({endTime : {$lt : parseInt(now)}},{ auctionId: 1, nftId:1 });
        if(auctionData.length){
            await Promise.all(auctionData.map(async(item)=>{
                let market = await contract.methods.checkMarket(item.nftId).call();
                    if(market == 'Auction'){
                        let details = await contract.methods.getAuction(item.nftId).call();
                        let auction = details.id;
                
                        if(parseInt(auction) == parseInt(item.auctionId) && details.highestBidder != '0x0000000000000000000000000000000000000000'){
                            sendTrans(item.nftId)
                        }
                    }
            }))
        }
    }
, 10000);
