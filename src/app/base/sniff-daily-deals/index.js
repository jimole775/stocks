/*
 * @Author: Rongxis 
 * @Date: 2019-07-25 14:23:25 
 * @Last Modified by: Rongxis
 * @Last Modified time: 2019-08-17 10:43:24
 */
import fs from 'fs'
const { recordPeerDeal } = require('./record-peer-deal')
const { readFile, batchLink, hasUninks, dateFormat } = require(`${global.srcRoot}/utils`)
export async function sniffDailyDeals() {
  return new Promise(excution).catch(err => err)
}

async function excution(s, j) {
  const baseData = readFile(`${global.srcRoot}/db/warehouse/base.json`)
  const urlModel = readFile(`${global.srcRoot}/url-model.yml`)
  const peerDealReg = new RegExp(urlModel.api.peerDealReg, 'g')
  const allStocks = JSON.parse(baseData ? baseData.data : {})
  const recordDir = `${global.srcRoot}/db/warehouse/peer-deals/${global.finalDate}`
  if (!canContinue()) return s(false)
  const urls = allStocks.map(item => {
    return urlModel.model.PeerDeal
      .replace('[stockCode]', item.code)
      .replace('[marketCode]', item.marketCode)
  })

  const unlinks = await hasUninks(urls, recordDir)
  console.log('daily deals unlink: ', unlinks.length)
  
  // 每日交易详情会以日期为目录区分，
  // 所以，如果当前目录的文件数如果饱和，没必要再进行抓取
  unlinks.length && batchLink(unlinks, {
    onResponse: function(response) {
      if (response.status() === 200 && peerDealReg.test(response.url())) {
        return recordPeerDeal(response)
      }
    },
    onEnd: async function() {
      const unlinks = await hasUninks(urls, recordDir)
      if (unlinks.length) return batchLink(unlinks, this)
      return s(false)
    }
  })
}

function canContinue() {
  const pass = true
  const curDate = dateFormat('YYYY-mm-dd', new Date())
  // 如果最后的交易日是APP运行的当天，那么，15点钟收盘之前，recordPeerDeal都不要运行
  // 这样做可以让 星期六 的任何时间都可以正常运行 recordPeerDeal
  if (global.finalDate === curDate && new Date().getHours() < 15) {
    pass = false
  }
  return pass
}
