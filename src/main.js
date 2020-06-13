;(async function (){
  await require('./global.config')()
  await require('./app/base/build-stocks-model')()
  
  const sniffStockHome = require('./app/base/sniff-stock-home')
  const sniffDailyDeals = require('./app/base/sniff-daily-deals')
  const analyzer = require('./app/analyze/peer-deals')
  if (['kline', 'all'].includes(global.mode)) {
    await sniffStockHome()
  }
  if (['deal', 'all'].includes(global.mode)) {
    await sniffDailyDeals()
  }
  if (['shadowline', 'all'].includes(global.mode)) {
    await analyzer.shadowLines()
  }
  process.exit()

  // recordUsedAPI is not a function
})()