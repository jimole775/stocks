const allStocks = require(global.baseData).data
const BunchThread = require('./bunch-thread')
module.exports = function requestApiInBunch (apikey, unlinkedUrls, task) {
  return new Promise((resolve) => {
    const unLinkStocks = []
    allStocks.forEach((stockItem) => {
      for (let i = 0; i < unlinkedUrls.length; i++) {
        const urlItem = unlinkedUrls[i]
        if (urlItem.includes(stockItem.code) && stockItem[apikey]) {
          unLinkStocks.push(stockItem)
          unlinkedUrls.splice(i, 1)
          break
        }
      }
    })

    // 如果没有一个api被记录的，就直接返回 unlinkedUrls
    if (unLinkStocks.length === 0) return resolve(unlinkedUrls)

    const bunch = new BunchThread()
    unLinkStocks.forEach((stockItem) => {
      bunch.taskCalling(() => {
        return new Promise(async (resolve) => {
          return resolve(await task(stockItem))
        })
      })
    })

    bunch.finally(() => {
      console.log('kline requestApiInBunch end!')
      return resolve(unlinkedUrls)
    })
  })
}