//Add your biance API key and Secret in .env 

require('dotenv').config();
import ccxt from 'ccxt';
const axios=require('axios');
const tick=async()=>{
const {asset,base,spred,allocation}=config;
const market=`${asset}/${base}`;
const orders=await binanceclient.fetchOpenOrder(market);
orders.forEach(async order=>{
    await binanceclient.cancleOrder(order.id);
});
const result=await Promise.all([
    axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
    , axios.get('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd')
]);
const marketprice =result[0].data.bitcoin.usd/result[1].data.tether.usd;
const sellprice=marketprice*(1+spred);
const buyprice =marketprice*(1-spred);
const balances=await binanceclient.fetchBalance();
const assetbalance=balances.free[asset];
const basebalance=balances.free[base];
const sellvolume=assetbalance*allocation;
const buyvolume=(basebalance * allocation)/marketprice;
await binanceclient.createLimitsellorder(market,sellvolume,sellprice);
await binanceclient.createLimitbuyorder(market,buyvolume,buyprice);
console.log(`
    New tick for ${market}...
    Crreated limit sell order for ${sellvolume}@${sellprice}
    Created limit buy order for ${buyvolume}@${buyprice}
    `
)
};
const run=()=>{
    const config={
        asset:'BTC',//cypto we want to trade
        base: 'USDT',//in which form binance only supports crypto currency USDT=1$ roughly
        allocation: 0.1,
        spred: 0.2,
        tickInterval: 2000 //evaluate position after every 2 sec
    };
    const binanceclient=new ccxt.binance({
        apiKey: process.env.API_ENV,
        secret: process.env.API_SECRET
    });
    tick(config,binanceclient);
    setInterval(tick,config,tickInterval,config,binanceclient);
}
run();